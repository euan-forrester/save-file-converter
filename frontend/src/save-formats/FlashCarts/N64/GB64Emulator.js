/*
GB64 is a GB/GBC emulator that runs on the N64

The save format has a header which is described here: https://github.com/lambertjamesd/gb64/blob/master/src/gameboy.h#L112

struct GameboySettings
{
    // Always has the value 0x47423634 (GB64 as an ascii string)
    0: u32 header;
    // Used to check save file compatibility
    4: u32 version;
    8: u16 flags;
    // color palette to use for non color games
    10: u16 bgpIndex;
    12: u16 obp0Index;
    14: u16 obp1Index;
    16: struct InputMapping inputMapping; -> 16 bytes
    32: struct GameboyGraphicsSettings graphics; -> 4 bytes
    40: u64 timer; -> unsure why this isn't offset 36: some sort of alignment issue?
    48: enum StoredInfoType storedType; -> 4 bytes
    52: u32 compressedSize;
};

Offset 128: Beginning of data compressed with zlib

When uncompressed, this data is a concatenation of various things the emulator needs, and begins with SRAM data. The length of the SRAM
data is determined from the ROM

enum StoredInfoType
{
    StoredInfoTypeAll,
    StoredInfoTypeSettingsRAM,
    StoredInfoTypeRAM,
    StoredInfoTypeSettings,
    StoredInfoTypeNone,
};
*/

import pako from 'pako';
import Util from '../../../util/util';
import SaveFilesUtil from '../../../util/SaveFiles';
import GbRom from '../../../rom-formats/gb';

const LITTLE_ENDIAN = false;

const MAGIC = 'GB64';
const MAGIC_OFFSET = 0;
const MAGIC_ENCODING = 'US-ASCII';

const VERSION_OFFSET = 4;
const FLAGS_OFFSET = 8;
const STORED_INFO_TYPE_OFFSET = 48;
const COMPRESSED_SIZE_OFFSET = 52;
const COMPRESSED_DATA_OFFSET = 0x80;

const DESIRED_VERSION = 2;

const STORED_INFO_TYPE_ALL = 0;
// const STORED_INFO_TYPE_SETTINGS_RAM = 1; // The emulator returns immediately after reading the SRAM data if the stored info type is one of these: https://github.com/lambertjamesd/gb64/blob/master/src/save.c#L588
// const STORED_INFO_TYPE_RAM = 2;
const STORED_INFO_TYPE_SETTINGS = 3;
const STORED_INFO_TYPE_NONE = 4;

const UNCOMPRESSED_DATA_SRAM_OFFSET = 0;
const MIN_SRAM_SIZE = 8192;

export default class Gb64EmulatorSaveData {
  static createFromFlashCartData(flashCartArrayBuffer, romArrayBuffer) {
    const gbRom = new GbRom(romArrayBuffer);

    return Gb64EmulatorSaveData.createFromFlashCartDataInternal(flashCartArrayBuffer, gbRom.getSramSize());
  }

  static createFromFlashCartDataInternal(flashCartArrayBuffer, sramSize) {
    // Based on https://github.com/lambertjamesd/gb64/blob/master/src/save.c#L492

    Util.checkMagic(flashCartArrayBuffer, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);

    const flashCartDataView = new DataView(flashCartArrayBuffer);

    this.version = flashCartDataView.getUint32(VERSION_OFFSET, LITTLE_ENDIAN);
    this.flags = flashCartDataView.getUint16(FLAGS_OFFSET, LITTLE_ENDIAN);
    this.storedInfoType = flashCartDataView.getUint32(STORED_INFO_TYPE_OFFSET, LITTLE_ENDIAN);
    this.compressedSize = flashCartDataView.getUint32(COMPRESSED_SIZE_OFFSET, LITTLE_ENDIAN);

    if (this.version !== DESIRED_VERSION) {
      throw new Error(`Found version ${this.version} but can only read version ${DESIRED_VERSION}`);
    }

    if ((this.storedInfoType < STORED_INFO_TYPE_ALL) || (this.storedInfoType > STORED_INFO_TYPE_NONE)) {
      throw new Error(`Unrecognized stored info type: ${this.storedInfoType}`);
    }

    if ((this.storedInfoType === STORED_INFO_TYPE_SETTINGS) || (this.storedInfoType === STORED_INFO_TYPE_NONE)) {
      throw new Error('This file does not contain save data');
    }

    // FIXME: Need to handle versions 1 & 2: compressedSize is set to 0 in those cases

    console.log(`Found version: ${this.version}, flags: 0x${this.flags.toString(16)}, storedInfoType: ${this.storedInfoType}, compressed size: ${this.compressedSize} bytes`);

    const compressedData = flashCartArrayBuffer.slice(COMPRESSED_DATA_OFFSET, COMPRESSED_DATA_OFFSET + this.compressedSize);
    const uncompressedData = pako.inflate(compressedData);

    // The emulator appears to incorrectly obtain the SRAM size from the ROM:
    // https://github.com/lambertjamesd/gb64/blob/master/src/save.c#L443
    // https://github.com/lambertjamesd/gb64/blob/dde5833ec53dda6ec642d591b9985422eecba923/src/rom.c#L206
    //
    // Effectively, this appears to ensure a minimum size of 8kB, even if the ROM specifies 2kB or 0kB.
    // Notice also that the weird MBC2 cartridge type is also covered by this: it was a value of 0 in the header but has 2kB of onboard RAM.
    // It's not tested for specifically by the emulator, but happens to succeed by making a minimum value of 8kB.

    const sramLength = Math.max(sramSize, MIN_SRAM_SIZE);

    const rawArrayBuffer = uncompressedData.slice(UNCOMPRESSED_DATA_SRAM_OFFSET, UNCOMPRESSED_DATA_SRAM_OFFSET + sramLength);

    return new Gb64EmulatorSaveData(flashCartArrayBuffer, rawArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    return new Gb64EmulatorSaveData(rawArrayBuffer, rawArrayBuffer);
  }

  static createWithNewSize(neon64EmulatorSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(neon64EmulatorSaveData.getRawArrayBuffer(), newSize);

    // Don't call createFromRawData() with the resized raw data, because we'll get an error saying Neon can only do 8kB saves. Bypass it instead.
    return new Gb64EmulatorSaveData(neon64EmulatorSaveData.getFlashCartArrayBuffer(), newRawSaveData);
  }

  static getFlashCartFileExtension() {
    return 'fla';
  }

  static getRawFileExtension() {
    return null; // GB/C saves have many possible extensions, and we just want to keep whatever the original extension was
  }

  static requiresRomClass() {
    return GbRom;
  }

  static adjustOutputSizesPlatform() {
    return 'gb';
  }

  constructor(flashCartArrayBuffer, rawArrayBuffer) {
    this.flashCartArrayBuffer = flashCartArrayBuffer;
    this.rawArrayBuffer = rawArrayBuffer;
  }

  getRawArrayBuffer() {
    return this.rawArrayBuffer;
  }

  getFlashCartArrayBuffer() {
    return this.flashCartArrayBuffer;
  }
}
