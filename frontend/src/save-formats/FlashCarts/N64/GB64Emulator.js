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

Offset 128: Beginning of compressed data

enum StoredInfoType
{
    StoredInfoTypeAll,
    StoredInfoTypeSettingsRAM,
    StoredInfoTypeRAM,
    StoredInfoTypeSettings,
    StoredInfoTypeNone,
};

Then there's data compressed with zlib
*/

import pako from 'pako';
import Util from '../../../util/util';
import SaveFilesUtil from '../../../util/SaveFiles';

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
// const STORED_INFO_TYPE_SETTINGS_RAM = 1;
// const STORED_INFO_TYPE_RAM = 2;
// const STORED_INFO_TYPE_SETTINGS = 3;
const STORED_INFO_TYPE_NONE = 4;

const SRAM_OFFSET = 0;
const SRAM_LENGTH = 8192; // Need to calculate this from the ROM, but hardcode for now

export default class Gb64EmulatorSaveData {
  static createFromFlashCartData(flashCartArrayBuffer) {
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

    console.log(`Found version: ${this.version}, flags: 0x${this.flags.toString(16)}, storedInfoType: ${this.storedInfoType}, compressed size: ${this.compressedSize} bytes`);

    const compressedData = flashCartArrayBuffer.slice(COMPRESSED_DATA_OFFSET, COMPRESSED_DATA_OFFSET + this.compressedSize);
    const uncompressedData = pako.inflate(compressedData);

    const rawArrayBuffer = uncompressedData.slice(SRAM_OFFSET, SRAM_OFFSET + SRAM_LENGTH);

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
    return null;
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
