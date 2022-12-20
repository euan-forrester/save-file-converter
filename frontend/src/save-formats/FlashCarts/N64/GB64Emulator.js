/* eslint-disable no-bitwise */

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

Offset 128: Beginning of data compressed with gzip

When uncompressed, this data is a concatenation of various things the emulator needs, and begins with SRAM data. The length of the SRAM
data is determined from the ROM

struct InputMapping
{
    u8 right;
    u8 left;
    u8 up;
    u8 down;
    u8 a;
    u8 b;
    u8 select;
    u8 start;

    u8 save;
    u8 load;
    u8 openMenu;
    u8 fastForward;

    u32 reserved2;
};

struct GameboyGraphicsSettings
{
    u32 unused:27;
    u32 smooth:1;
    u32 scaleSetting:4;
};

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
const BGP_INDEX_OFFSET = 10;
const OBP0_INDEX_OFFSET = 12;
const OBP1_INDEX_OFFSET = 14;
const INPUT_MAPPING_OFFSET = 16;
const INPUT_MAPPING_LENGTH = 16;
const GRAPHICS_SETTINGS_OFFSET = 32;
const TIMER_OFFSET = 40;
const STORED_INFO_TYPE_OFFSET = 48;
const COMPRESSED_SIZE_OFFSET = 52;
const GAMEBOY_STATE_DATA_OFFSET = 0x80;

const HEADER_SIZE = GAMEBOY_STATE_DATA_OFFSET;
const HEADER_FILL_VALUE = 0x00;

const FILE_LENGTH = 0x20000;
const FILE_PADDING_VALUE = 0xAA;

const DESIRED_VERSION = 2;

const DEFAULT_FLAGS = 0x0000;
const DEFAULT_BGP_INDEX = 0;
const DEFAULT_OBP0_INDEX = 0;
const DEFAULT_OBP1_INDEX = 0;
const DEFAULT_GRAPHICS_SETTINGS = 0x00000002;
const DEFAULT_TIMER = 0x02C445F9n; // 0n;

const STORED_INFO_TYPE_ALL = 0;
// const STORED_INFO_TYPE_SETTINGS_RAM = 1; // The emulator returns immediately after reading the SRAM data if the stored info type is one of these: https://github.com/lambertjamesd/gb64/blob/master/src/save.c#L588
// const STORED_INFO_TYPE_RAM = 2;
const STORED_INFO_TYPE_SETTINGS = 3;
const STORED_INFO_TYPE_NONE = 4;

const GAMEBOY_STATE_DATA_SRAM_OFFSET = 0;
const GAMEBOY_STATE_DATA_FILL_VALUE = 0x00;
const MIN_SRAM_SIZE = 8192;

const GAMEBOY_DATA_DATA_LENGTH_GB = (25472 - 8192); // Gotten empirically by looking at a save file for Zelda: Link's Awakening: file size minus game SRAM size
const GAMEBOY_DATA_DATA_LENGTH_GBC = (58240 - 8192); // Gotten empirically by looking at a save file for Zelda: Oracle of Seasons: file size minus game SRAM size

/*
const PALETTE_COUNT = 64; // https://github.com/lambertjamesd/gb64/blob/a6b90ef5454e3f2cf4b92dd746926e7ddd858f91/src/memory_map.h#L177
const MAX_RAM_SIZE = 0x8000; // https://github.com/lambertjamesd/gb64/blob/a6b90ef5454e3f2cf4b92dd746926e7ddd858f91/src/memory_map.h#L12
const MISC_MEMORY_SIZE = 0x8000; // Man this is so complex I don't want to add it all up: https://github.com/lambertjamesd/gb64/blob/a6b90ef5454e3f2cf4b92dd746926e7ddd858f91/src/memory_map.h#L160
const MISC_SAVE_STATE_DATA_SIZE = 0x8000; // Same for this: really complex and I don't want to add it up: https://github.com/lambertjamesd/gb64/blob/391b553966ef1ff45368bad8bb28fea119aa20de/src/save.c#L434

// From https://github.com/lambertjamesd/gb64/blob/391b553966ef1ff45368bad8bb28fea119aa20de/src/save.c#L25
function alignFlashOffset(offset) {
  return ((offset + 0x7F) & ~0x7F);
}
*/

function calculateGameboyStateDataSize(isGbc) {
  /*
  // Taken from https://github.com/lambertjamesd/gb64/blob/master/src/save.c#L441
  // which seems, oddly enough, to be different from https://github.com/lambertjamesd/gb64/blob/master/src/save.c#L720
  // (The latter doesn't rely on checking if the platform is GBC, for example)
  // I wonder if the latter is not actually used

  let offset = 0;
  offset = alignFlashOffset(offset + sramLength);
  offset = alignFlashOffset(offset + (isGbc ? 0x4000 : 0x2000));
  offset = alignFlashOffset(offset + (2 * PALETTE_COUNT));
  offset = alignFlashOffset(offset + (isGbc ? MAX_RAM_SIZE : 0x2000));
  offset = alignFlashOffset(offset + MISC_MEMORY_SIZE);
  offset = alignFlashOffset(offset + MISC_SAVE_STATE_DATA_SIZE);

  return offset;
  */
  if (isGbc) {
    return GAMEBOY_DATA_DATA_LENGTH_GBC;
  }

  return GAMEBOY_DATA_DATA_LENGTH_GB;
}

function getDefaultInputMapping() {
  // Just hardcode the default data I see in an example save file, rather than spelling out every
  // last item here

  const arrayBuffer = Util.getFilledArrayBuffer(INPUT_MAPPING_LENGTH, 0x00);
  const dataView = new DataView(arrayBuffer);

  dataView.setUint32(0, 0x08090B0A, false);
  dataView.setUint32(4, 0x0F0E0D0C, false);
  dataView.setUint32(8, 0x03020100, false);

  return arrayBuffer;
}

export default class Gb64EmulatorSaveData {
  static createFromFlashCartData(flashCartArrayBuffer, romArrayBuffer) {
    const gbRom = new GbRom(romArrayBuffer);

    return Gb64EmulatorSaveData.createFromFlashCartDataInternal(flashCartArrayBuffer, gbRom.getSramSize());
  }

  static createFromFlashCartDataInternal(flashCartArrayBuffer, sramSize) {
    // Based on https://github.com/lambertjamesd/gb64/blob/master/src/save.c#L492

    Util.checkMagic(flashCartArrayBuffer, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);

    const flashCartDataView = new DataView(flashCartArrayBuffer);

    const version = flashCartDataView.getUint32(VERSION_OFFSET, LITTLE_ENDIAN);
    const flags = flashCartDataView.getUint16(FLAGS_OFFSET, LITTLE_ENDIAN);
    const storedInfoType = flashCartDataView.getUint32(STORED_INFO_TYPE_OFFSET, LITTLE_ENDIAN);
    const compressedSize = flashCartDataView.getUint32(COMPRESSED_SIZE_OFFSET, LITTLE_ENDIAN);
    const dataIsCompressed = (version === DESIRED_VERSION);

    if ((version < 0) || (version > DESIRED_VERSION)) {
      throw new Error(`Found version ${version} but can only read versions 0 through ${DESIRED_VERSION}`);
    }

    if ((storedInfoType < STORED_INFO_TYPE_ALL) || (storedInfoType > STORED_INFO_TYPE_NONE)) {
      throw new Error(`Unrecognized stored info type: ${storedInfoType}`);
    }

    if ((storedInfoType === STORED_INFO_TYPE_SETTINGS) || (storedInfoType === STORED_INFO_TYPE_NONE)) {
      throw new Error('This file does not contain save data');
    }

    console.log(`Found version: ${version}, flags: 0x${flags.toString(16)}, storedInfoType: ${storedInfoType}, compressed size: ${compressedSize} bytes`);

    let gameboyStateData = null;

    if (dataIsCompressed) {
      const compressedData = flashCartArrayBuffer.slice(GAMEBOY_STATE_DATA_OFFSET, GAMEBOY_STATE_DATA_OFFSET + compressedSize);

      gameboyStateData = pako.inflate(compressedData);

      console.log(`Uncompressed data size: ${gameboyStateData.byteLength}`);
    } else {
      gameboyStateData = flashCartArrayBuffer.slice(GAMEBOY_STATE_DATA_OFFSET); // In the emulator code, this begins at ALIGN_FLASH_OFFSET(sizeof(GameboySettings)), which is ALIGN_FLASH_OFFSET(56), which is 0x80 -- same as FLASH_BLOCK_SIZE for the compressed data
    }

    // The emulator appears to incorrectly obtain the SRAM size from the ROM:
    // https://github.com/lambertjamesd/gb64/blob/master/src/save.c#L443
    // https://github.com/lambertjamesd/gb64/blob/dde5833ec53dda6ec642d591b9985422eecba923/src/rom.c#L206
    //
    // Effectively, this appears to ensure a minimum size of 8kB, even if the ROM specifies 2kB or 0kB.
    // Notice also that the weird MBC2 cartridge type is also covered by this: it was a value of 0 in the header but has 2kB of onboard RAM.
    // It's not tested for specifically by the emulator, but happens to succeed by making a minimum value of 8kB.

    const sramLength = Math.max(sramSize, MIN_SRAM_SIZE);

    const rawArrayBuffer = gameboyStateData.slice(GAMEBOY_STATE_DATA_SRAM_OFFSET, GAMEBOY_STATE_DATA_SRAM_OFFSET + sramLength);

    return new Gb64EmulatorSaveData(flashCartArrayBuffer, rawArrayBuffer, gameboyStateData);
  }

  static createFromRawData(rawArrayBuffer, isGbc) { // FIXME: isGbc Needs to come from the ROM
    const sramLength = Math.max(rawArrayBuffer.byteLength, MIN_SRAM_SIZE); // FIXME: This needs to come from the ROM too

    const headerArrayBuffer = Util.setMagic(Util.getFilledArrayBuffer(HEADER_SIZE, HEADER_FILL_VALUE), MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);
    const headerDataView = new DataView(headerArrayBuffer);
    const headerUint8Array = new Uint8Array(headerArrayBuffer);

    const defaultInputMapping = new Uint8Array(getDefaultInputMapping());

    headerUint8Array.set(defaultInputMapping, INPUT_MAPPING_OFFSET);

    headerDataView.setUint32(VERSION_OFFSET, DESIRED_VERSION, LITTLE_ENDIAN);
    headerDataView.setUint16(FLAGS_OFFSET, DEFAULT_FLAGS, LITTLE_ENDIAN);
    headerDataView.setUint16(BGP_INDEX_OFFSET, DEFAULT_BGP_INDEX, LITTLE_ENDIAN);
    headerDataView.setUint16(OBP0_INDEX_OFFSET, DEFAULT_OBP0_INDEX, LITTLE_ENDIAN);
    headerDataView.setUint16(OBP1_INDEX_OFFSET, DEFAULT_OBP1_INDEX, LITTLE_ENDIAN);
    headerDataView.setUint32(GRAPHICS_SETTINGS_OFFSET, DEFAULT_GRAPHICS_SETTINGS, LITTLE_ENDIAN);
    headerDataView.setBigUint64(TIMER_OFFSET, DEFAULT_TIMER, LITTLE_ENDIAN);
    headerDataView.setUint32(STORED_INFO_TYPE_OFFSET, STORED_INFO_TYPE_ALL, LITTLE_ENDIAN);

    // The data which is compressed is a concatenation of SRAM data first, then other blocks of data used by the
    // emulator like RAM, etc. We need to include space for all of it so that the emulator can read it in, otherwise
    // the emulator will fail reading the file: https://github.com/lambertjamesd/gb64/blob/master/src/save.c#L441

    const gameboyStateDataSize = calculateGameboyStateDataSize(isGbc);

    const resizedRawArrayBuffer = SaveFilesUtil.resizeRawSave(rawArrayBuffer, sramLength, GAMEBOY_STATE_DATA_FILL_VALUE);
    const gameboyStateDataPadding = Util.getFilledArrayBuffer(gameboyStateDataSize, GAMEBOY_STATE_DATA_FILL_VALUE);

    const gameboyStateData = Util.concatArrayBuffers([resizedRawArrayBuffer, gameboyStateDataPadding]);
    const compressedData = pako.gzip(gameboyStateData); // Don't use deflate() because gb64 uses a tiny zlib library that explicitly expects gzip: https://github.com/lambertjamesd/gb64/blob/391b553966ef1ff45368bad8bb28fea119aa20de/src/save.c#L260

    headerDataView.setUint32(COMPRESSED_SIZE_OFFSET, compressedData.byteLength, LITTLE_ENDIAN);

    const paddingArrayBuffer = Util.getFilledArrayBuffer(FILE_LENGTH - HEADER_SIZE - compressedData.byteLength, FILE_PADDING_VALUE);

    const flashCartArrayBuffer = Util.concatArrayBuffers([headerArrayBuffer, compressedData, paddingArrayBuffer]);

    return new Gb64EmulatorSaveData(flashCartArrayBuffer, rawArrayBuffer, gameboyStateData);
  }

  static createWithNewSize(gb64EmulatorSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(gb64EmulatorSaveData.getRawArrayBuffer(), newSize);

    return new Gb64EmulatorSaveData(gb64EmulatorSaveData.getFlashCartArrayBuffer(), newRawSaveData, gb64EmulatorSaveData.gameboyStateDataArrayBuffer());
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

  constructor(flashCartArrayBuffer, rawArrayBuffer, gameboyStateDataArrayBuffer) {
    this.flashCartArrayBuffer = flashCartArrayBuffer;
    this.rawArrayBuffer = rawArrayBuffer;
    this.gameboyStateDataArrayBuffer = gameboyStateDataArrayBuffer;
  }

  getRawArrayBuffer() {
    return this.rawArrayBuffer;
  }

  getFlashCartArrayBuffer() {
    return this.flashCartArrayBuffer;
  }

  getGameboyStateDataArrayBuffer() {
    return this.gameboyStateDataArrayBuffer;
  }
}
