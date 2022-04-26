/* eslint-disable no-bitwise */

/*
Based on the Goomba Save Manager, specifically:
- Ignore the first 4 bytes of the file (they specify the type of save): https://github.com/libertyernie/goombasav/blob/master/main.c#L127
- Format for the header: https://github.com/libertyernie/goombasav/blob/master/goombasav.h#L101
- Criteria for "cleaning" the data first: https://github.com/libertyernie/goombasav/blob/master/goombasav.c#L330
*/

import Util from '../../util/util';
import PaddingUtil from '../../util/Padding';
import lzo from '../../../lib/minlzo-js/lzo1x';

const LITTLE_ENDIAN = true;

const GOOMBA_MAGIC = 0x57A731D8; // Goomba (GB/GBC) save
// const POCKETNES_MAGIC = 0x57A731D7; // Pocket NES save
// const SMSADVANCE_MAGIC = 0x57A731dC; // SMS Advance save
const MAGIC_OFFSET = 0; // Offset relative to the start of the file
const MAGIC_LENGTH = 4;

// These offsets are relative to the start of a "state header"

const SIZE_OFFSET = 0; // Header + data size

const TYPE_OFFSET = 2;
const TYPE_SAVE_STATE = 0;
const TYPE_SRAM_SAVE = 1;
const TYPE_CONFIG_DATA = 2;
const TYPE_PALETTE = 5;

const UNCOMPRESSED_SIZE_OFFSET = 4;
const FRAME_COUNT_OFFSET = 8;
const ROM_CHECKSUM_OFFSET = 12;

const GAME_TITLE_OFFSET = 16;
const GAME_TITLE_LENGTH = 32;
const GAME_TITLE_ENCODING = 'US-ASCII';

const FILE_TYPE_NAMES = {
  TYPE_SAVE_STATE: 'Save state',
  TYPE_SRAM_SAVE: 'SRAM save',
  TYPE_CONFIG_DATA: 'Config data',
  TYPE_PALETTE: 'Palette',
};

const STATE_HEADER_LENGTH = GAME_TITLE_OFFSET + GAME_TITLE_LENGTH;

const GOOMBA_AND_POCKET_NES_CONFIG_DATA_SIZE = 0x30;
const SMS_ADVANCE_CONFIG_DATA_SIZE = 0x34;

const GOOMBA_AND_POCKET_NES_CONFIG_DATA_SRAM_CHECKSUM_OFFSET = 12;
const SMS_ADVANCE_CONFIG_DATA_SRAM_OFFSET = 16;

const LARGEST_GBC_SAVE_SIZE = 0x10000; // This is just used as a hint to the decompression algorithm so it can allocate memory. Value copied from https://github.com/libertyernie/goombasav/blob/master/goombasav.c#L349

const GOOMBA_COLOR_AVAILABLE_SIZE = 0xE000; // Not sure why this is named this, but when a file is "unclean" then there's uncompressed data here: Value copied from https://github.com/libertyernie/goombasav/blob/master/goombasav.h#L29
const GOOMBA_COLOR_SRAM_SIZE = 0x10000; // Value copied from https://github.com/libertyernie/goombasav/blob/master/goombasav.h#L28

const GOOMBA_CONFIG_DATA_SIZE_OFFSET = 0;
const GOOMBA_CONFIG_DATA_TYPE_OFFSET = 2;
const GOOMBA_CONFIG_DATA_BORDER_COLOR_OFFSET = 4;
const GOOMBA_CONFIG_DATA_PALETTE_BANK_OFFSET = 5;
const GOOMBA_CONFIG_DATA_SRAM_ROM_CHECKSUM_OFFSET = 8;
const GOOMBA_CONFIG_DATA_RESERVED_OFFSET = 16;
const GOOMBA_CONFIG_DATA_RESERVED_LENGTH = 32;
const GOOMBA_CONFIG_DATA_RESERVED_DATA = 'CFG';
const GOOMBA_CONFIG_DATA_RESERVED_ENCODING = 'US-ASCII';
const GOOMBA_CONFIG_DATA_LENGTH = GOOMBA_CONFIG_DATA_RESERVED_OFFSET + GOOMBA_CONFIG_DATA_RESERVED_LENGTH;

const GOOMBA_CONFIG_DATA_DEFAULT_BORDER_COLOR = 0;
const GOOMBA_CONFIG_DATA_DEFAULT_PALETTE_BANK = 0;

function lzoDecompress(arrayBuffer, uncompressedSize) {
  const state = {
    inputBuffer: new Uint8Array(arrayBuffer),
    outputBuffer: null,
  };

  lzo.setOutputEstimate(uncompressedSize);

  const returnVal = lzo.decompress(state);

  if (returnVal === lzo.OK) {
    return Util.bufferToArrayBuffer(state.outputBuffer);
  }

  throw new Error(`Encountered error ${returnVal} when trying to decompress LZO buffer`);
}

function lzoCompress(arrayBuffer) {
  const state = {
    inputBuffer: new Uint8Array(arrayBuffer),
    outputBuffer: null,
  };

  const returnVal = lzo.compress(state);

  if (returnVal === lzo.OK) {
    return Util.bufferToArrayBuffer(state.outputBuffer);
  }

  throw new Error(`Encountered error ${returnVal} when trying to compress buffer with LZO`);
}

function readStateHeader(arrayBuffer) {
  const dataView = new DataView(arrayBuffer);
  const uint8Array = new Uint8Array(arrayBuffer);

  return {
    size: dataView.getUint16(SIZE_OFFSET, LITTLE_ENDIAN),
    type: dataView.getUint16(TYPE_OFFSET, LITTLE_ENDIAN),
    uncompressedSize: dataView.getUint32(UNCOMPRESSED_SIZE_OFFSET, LITTLE_ENDIAN),
    frameCount: dataView.getUint32(FRAME_COUNT_OFFSET, LITTLE_ENDIAN),
    romChecksum: dataView.getUint32(ROM_CHECKSUM_OFFSET, LITTLE_ENDIAN),
    gameTitle: Util.readNullTerminatedString(uint8Array, GAME_TITLE_OFFSET, GAME_TITLE_ENCODING, GAME_TITLE_LENGTH),
  };
}

function createStateHeaderArrayBuffer(stateHeader) {
  const arrayBuffer = new ArrayBuffer(STATE_HEADER_LENGTH);
  const dataView = new DataView(arrayBuffer);
  const uint8Array = new Uint8Array(arrayBuffer);

  const textEncoder = new TextEncoder(GAME_TITLE_ENCODING);

  uint8Array.fill(0);

  dataView.setUint16(SIZE_OFFSET, stateHeader.size, LITTLE_ENDIAN);
  dataView.setUint16(TYPE_OFFSET, stateHeader.type, LITTLE_ENDIAN);
  dataView.setUint32(UNCOMPRESSED_SIZE_OFFSET, stateHeader.uncompressedSize, LITTLE_ENDIAN);
  dataView.setUint32(FRAME_COUNT_OFFSET, stateHeader.frameCount, LITTLE_ENDIAN);
  dataView.setUint32(ROM_CHECKSUM_OFFSET, stateHeader.romChecksum, LITTLE_ENDIAN);

  const encodedGameTitle = textEncoder.encode(stateHeader.gameTitle).slice(0, GAME_TITLE_LENGTH - 1);

  uint8Array.set(encodedGameTitle, GAME_TITLE_OFFSET);

  return arrayBuffer;
}

// Taken from https://github.com/libertyernie/goombasav/blob/master/goombasav.c#L155
function stateHeaderIsPlausible(stateHeader) {
  switch (stateHeader.type) {
    case TYPE_SAVE_STATE:
    case TYPE_SRAM_SAVE:
    case TYPE_CONFIG_DATA:
    case TYPE_PALETTE:
      // Type is okay: fall through
      break;

    default:
      return false;
  }

  if (stateHeader.size < STATE_HEADER_LENGTH) {
    return false;
  }

  if ((stateHeader.uncompressedSize === 0) && (stateHeader.type !== TYPE_CONFIG_DATA)) {
    return false;
  }

  return true;
}

// Taken from https://github.com/libertyernie/goombasav/blob/master/goombasav.c#L249
//
// This is descrived as "checksum of rom using SRAM e000-ffff"
// here https://github.com/libertyernie/goombasav/blob/master/goombasav.h#L80
//
// So it's a checksum of the ROM, but from a portion of the SRAM towards the end?
function getSramRomChecksumFromConfigData(arrayBuffer) {
  const dataView = new DataView(arrayBuffer);

  let currentByte = MAGIC_LENGTH;

  if (arrayBuffer.byteLength < (MAGIC_LENGTH + STATE_HEADER_LENGTH)) {
    throw new Error('File is too short to contain a state header');
  }

  let stateHeader = readStateHeader(arrayBuffer.slice(currentByte, currentByte + STATE_HEADER_LENGTH));

  while (stateHeaderIsPlausible(stateHeader)) {
    if (stateHeader.type === TYPE_CONFIG_DATA) {
      if (stateHeader.size === GOOMBA_AND_POCKET_NES_CONFIG_DATA_SIZE) {
        return dataView.getUint32(currentByte + GOOMBA_AND_POCKET_NES_CONFIG_DATA_SRAM_CHECKSUM_OFFSET, LITTLE_ENDIAN);
      }

      if (stateHeader.size === SMS_ADVANCE_CONFIG_DATA_SIZE) {
        return dataView.getUint32(currentByte + SMS_ADVANCE_CONFIG_DATA_SRAM_OFFSET, LITTLE_ENDIAN);
      }

      throw new Error(`Unrecognized config data type: size of ${stateHeader.size} is unknown`);
    }

    currentByte += stateHeader.size;

    if ((currentByte + STATE_HEADER_LENGTH) > arrayBuffer.byteLength) {
      break;
    }

    stateHeader = readStateHeader(arrayBuffer.slice(currentByte, currentByte + STATE_HEADER_LENGTH));
  }

  throw new Error('No config data found in file');
}

function createMagicArrayBuffer(magic, length) {
  const arrayBuffer = new ArrayBuffer(length);
  const dataView = new DataView(arrayBuffer);

  dataView.setUint32(0, magic, LITTLE_ENDIAN);

  return arrayBuffer;
}

// Based on https://github.com/libertyernie/goombasav/blob/master/goombasav.h#L61
function createEmptyGoombaConfigDataArrayBuffer() {
  const arrayBuffer = new ArrayBuffer(GOOMBA_CONFIG_DATA_LENGTH);
  const dataView = new DataView(arrayBuffer);
  const uint8Array = new Uint8Array(arrayBuffer);

  const textEncoder = new TextEncoder(GOOMBA_CONFIG_DATA_RESERVED_ENCODING);

  uint8Array.fill(0);

  dataView.setUint16(GOOMBA_CONFIG_DATA_SIZE_OFFSET, GOOMBA_CONFIG_DATA_LENGTH, LITTLE_ENDIAN);
  dataView.setUint16(GOOMBA_CONFIG_DATA_TYPE_OFFSET, TYPE_CONFIG_DATA, LITTLE_ENDIAN);
  dataView.setUint8(GOOMBA_CONFIG_DATA_BORDER_COLOR_OFFSET, GOOMBA_CONFIG_DATA_DEFAULT_BORDER_COLOR);
  dataView.setUint8(GOOMBA_CONFIG_DATA_PALETTE_BANK_OFFSET, GOOMBA_CONFIG_DATA_DEFAULT_PALETTE_BANK);
  dataView.setUint32(GOOMBA_CONFIG_DATA_SRAM_ROM_CHECKSUM_OFFSET, 0, LITTLE_ENDIAN); // Checksum here gets set to 0 so that the file is "clean"

  const encodedReservedData = textEncoder.encode(GOOMBA_CONFIG_DATA_RESERVED_DATA).slice(0, GOOMBA_CONFIG_DATA_RESERVED_LENGTH - 1);

  uint8Array.set(encodedReservedData, GOOMBA_CONFIG_DATA_RESERVED_LENGTH);

  return arrayBuffer;
}

function createGoombaArrayBuffer(rawArrayBuffer, romInternalName, romChecksum) {
  const magicArrayBuffer = createMagicArrayBuffer(GOOMBA_MAGIC, MAGIC_LENGTH);
  const compressedSaveDataArrayBuffer = lzoCompress(rawArrayBuffer);

  const stateHeader = {
    size: compressedSaveDataArrayBuffer.byteLength + STATE_HEADER_LENGTH,
    type: TYPE_SRAM_SAVE,
    uncompressedSize: rawArrayBuffer.byteLength,
    frameCount: 0,
    romChecksum,
    gameTitle: romInternalName,
  };

  const stateHeaderArrayBuffer = createStateHeaderArrayBuffer(stateHeader);

  const configDataArrayBuffer = createEmptyGoombaConfigDataArrayBuffer();

  const unpaddedGoombaArrayBuffer = Util.concatArrayBuffers([magicArrayBuffer, stateHeaderArrayBuffer, compressedSaveDataArrayBuffer, configDataArrayBuffer]);

  const padding = {
    count: Math.max(GOOMBA_COLOR_SRAM_SIZE - unpaddedGoombaArrayBuffer.byteLength, 0),
    value: 0,
  };

  return PaddingUtil.addPaddingToEnd(unpaddedGoombaArrayBuffer, padding);
}

export default class GoombaEmulatorSaveData {
  static createFromGoombaData(goombaArrayBuffer) {
    return new GoombaEmulatorSaveData(goombaArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer, gbRom) {
    const romInternalName = gbRom.getInternalName();
    const romChecksum = GoombaEmulatorSaveData.calculateRomChecksum(gbRom.getRomArrayBuffer());

    return GoombaEmulatorSaveData.createFromRawDataInternal(rawArrayBuffer, romInternalName, romChecksum);
  }

  // This function split out so that we can call it from tests. We can't include a retail ROM
  // with our tests (we need the entire ROM to calculate the checksum), so this allows us to fill in those values
  static createFromRawDataInternal(rawArrayBuffer, romInternalName, romChecksum) {
    const goombaArrayBuffer = createGoombaArrayBuffer(rawArrayBuffer, romInternalName, romChecksum);

    return new GoombaEmulatorSaveData(goombaArrayBuffer);
  }

  // Taken from https://github.com/masterhou/goombacolor/blob/master/src/sram.c#L258
  //
  // Note that this only looks (sporadically) at the first 16kB of the file
  static calculateRomChecksum(romArrayBuffer) {
    let sum = 0;
    let currentByte = 0;
    const totalBytes = romArrayBuffer.byteLength;

    const romUint8Array = new Uint8Array(romArrayBuffer);
    const lastByte = romUint8Array[totalBytes - 1];

    for (let i = 0; i < 128; i += 1) {
      if (currentByte < totalBytes) {
        sum += (romUint8Array[currentByte] | (romUint8Array[currentByte + 1] << 8) | (romUint8Array[currentByte + 2] << 16) | (romUint8Array[currentByte + 3] << 24));
      } else {
        sum += (lastByte | (lastByte << 8) | (lastByte << 16) | (lastByte << 24));
      }

      sum >>>= 0; // Convert to unsigned: https://stackoverflow.com/a/1822769

      currentByte += 128;
    }

    return sum;
  }

  constructor(goombaArrayBuffer) {
    const goombaDataView = new DataView(goombaArrayBuffer);

    const magic = goombaDataView.getUint32(MAGIC_OFFSET, LITTLE_ENDIAN);

    if (magic !== GOOMBA_MAGIC) {
      throw new Error(`File appears to be corrupted: expected 0x${GOOMBA_MAGIC.toString(16)} but found 0x${magic.toString(16)}`);
    }

    const stateHeader = readStateHeader(goombaArrayBuffer.slice(MAGIC_LENGTH, MAGIC_LENGTH + STATE_HEADER_LENGTH));

    if (stateHeader.type !== TYPE_SRAM_SAVE) {
      throw new Error(`File appears to be ${FILE_TYPE_NAMES[stateHeader.type]} instead of ${FILE_TYPE_NAMES[TYPE_SRAM_SAVE]}`);
    }

    // The save editor makes the case that compressed size is the size stored in the file minus the header:
    // https://github.com/libertyernie/goombasav/blob/master/goombasav.c#L348
    // https://github.com/libertyernie/goombasav/blob/master/goombasav.c#L405
    //
    // And that uncompressed size is incorrectly stored in goomba (but not goomba color) files:
    // https://github.com/libertyernie/goombasav/blob/master/goombasav.c#L405

    const sramRomChecksum = getSramRomChecksumFromConfigData(goombaArrayBuffer);

    let needsCleaning = false;

    if (sramRomChecksum === 0) {
      // File is clean
    } else if (sramRomChecksum === stateHeader.romChecksum) {
      // File is unclean, and needs to be cleaned
      // https://github.com/libertyernie/goombasav/blob/master/goombasav.c#L342
      needsCleaning = true;
    } else {
      // File is unclean, but it shouldn't affect the data we're interested in
      // https://github.com/libertyernie/goombasav/blob/master/goombasav.c#L345
    }

    this.compressedSize = stateHeader.size - STATE_HEADER_LENGTH;
    this.uncompressedSize = stateHeader.uncompressedSize;
    this.frameCount = stateHeader.frameCount;
    this.romChecksum = stateHeader.romChecksum;
    this.gameTitle = stateHeader.gameTitle;

    // It seems that the compressed and/or uncompressed size might be incorrect for goomba (rather than goomba color) files. The save editor just goes until the end of the file: https://github.com/libertyernie/goombasav/blob/master/goombasav.c#L350
    const compressedDataOffset = MAGIC_LENGTH + STATE_HEADER_LENGTH;
    this.rawArrayBuffer = needsCleaning
      ? goombaArrayBuffer.slice(GOOMBA_COLOR_AVAILABLE_SIZE, GOOMBA_COLOR_SRAM_SIZE) // Based on https://github.com/libertyernie/goombasav/blob/master/goombasav.c#L308
      : lzoDecompress(goombaArrayBuffer.slice(compressedDataOffset/* , compressedDataOffset + this.compressedSize */), LARGEST_GBC_SAVE_SIZE/* this.uncompressedSize */);
    this.goombaArrayBuffer = goombaArrayBuffer;
  }

  getRawArrayBuffer() {
    return this.rawArrayBuffer;
  }

  getGoombaArrayBuffer() {
    return this.goombaArrayBuffer;
  }

  getCompressedSize() {
    return this.compressedSize;
  }

  getUncompressedSize() {
    return this.uncompressedSize;
  }

  getGameTitle() {
    return this.gameTitle;
  }

  getRomChecksum() {
    return this.romChecksum;
  }

  getFrameCount() {
    return this.frameCount;
  }
}
