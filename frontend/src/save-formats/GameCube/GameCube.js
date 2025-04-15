/* eslint-disable no-bitwise */

/*
The format for a memory card image

The format is somewhat described here: https://www.gc-forever.com/yagcd/chap12.html#sec12 but with errors and omissions

Overall the format is fairly similar to the N64 mempack format, with the first 5 blocks being reserved and there being 2 pairs of blocks with identical information in them

Block 0: Header
Block 1: Directory
Block 2: Directory backup (repeat of block 1)
Block 3: Block allocation map
Block 4: Block allocation map backup (repeat of block 3)

Header: https://github.com/dolphin-emu/dolphin/blob/ee27f03a4387baca6371a06068274135ff9547a5/Source/Core/Core/HW/GCMemcard/GCMemcard.h#L160

0x0000-0x000B: Serial number: https://github.com/dolphin-emu/dolphin/blob/4f210df86a2d2362ef8087cf81b817b18c3d32e9/Source/Core/Core/HW/GCMemcard/GCMemcard.cpp#L1210
0x000C-0x0013: Time of format of the card (64 bit value, as an OSTime: see GameCubeUtil.getDateFromOsTime())
0x0014-0x0017: SRAM bias at time of format
0x0018-0x001B: SRAM language
0x001C-0x001F: VI DTV status register value
0x0020-0x0021: Slot number (0: Slot A, 1: Slot B)
0x0022-0x0023: Size of memcard in megabits
0x0024-0x0025: Encoding (0: ASCII, 1: shift-jis)
0x0026-0x01FB: padding (0xFF)
0x01FA-0x01FB: May be update counter, or may be part of the 0xFF padding above (check what memcard pro does)
0x01FC-0x01FD: Additive checksum
0x01FE-0x01FF: Inverse checksum
0x0200-0x3DFF: padding (0xFF)
*/

import GameCubeUtil from './Util';

const LITTLE_ENDIAN = false;

const BLOCK_SIZE = 0x2000;

const HEADER_BLOCK_NUMBER = 0;
/*
const DIRECTORY_BLOCK_NUMBER = 1;
const DIRECTORY_BACKUP_BLOCK_NUMBER = 2;
const BLOCK_ALLOCATION_MAP_BLOCK_NUMBER = 3;
const BLOCK_ALLOCATION_MAP_BACKUP_BLOCK_NUMBER = 4;
*/

/*
const HEADER_PADDING_VALUE = 0xFF;
*/

/*
const SERIAL_OFFSET = 0x0000;
const SERIAL_LENGTH = 12;
*/
const FORMAT_OSTIME_OFFSET = 0x000C;

const MEMCARD_SLOT_OFFSET = 0x0020;
const MEMCARD_SLOT_A = 0;
const MEMCARD_SLOT_B = 1;
const MEMCARD_SIZE_OFFSET = 0x0022;
const ENCODING_OFFSET = 0x0024;

function getBlock(arrayBuffer, blockNumber) {
  const startOffset = blockNumber * BLOCK_SIZE;
  return arrayBuffer.slice(startOffset, startOffset + BLOCK_SIZE);
}

function getVolumeInfo(headerBlock) {
  const dataView = new DataView(headerBlock);

  const formatOsTimeCode = dataView.getBigUint64(FORMAT_OSTIME_OFFSET, LITTLE_ENDIAN);
  const memcardSlot = dataView.getUint16(MEMCARD_SLOT_OFFSET, LITTLE_ENDIAN);
  const memcardSizeMegabits = dataView.getUint16(MEMCARD_SIZE_OFFSET, LITTLE_ENDIAN);
  const encodingCode = dataView.getUint16(ENCODING_OFFSET, LITTLE_ENDIAN);

  return {
    formatOsTimeCode,
    formatTime: GameCubeUtil.getDateFromOsTime(formatOsTimeCode),
    memcardSlot,
    memcardSizeMegabits,
    encodingCode,
    encodingString: GameCubeUtil.getEncodingString(encodingCode),
  };
}

function readSaveFiles() {
  return [];
}

export default class GameCubeSaveData {
  static MEMCARD_SLOT_A = MEMCARD_SLOT_A;

  static MEMCARD_SLOT_B = MEMCARD_SLOT_B;

  static createWithNewSize(/* gameCubeSaveData, newSize */) {
    /*
    const newRawSaveData = SegaSaturnUtil.resize(gameCubeSaveData.getArrayBuffer(), newSize);

    return GameCubeSaveData.createFromGameCubeData(newRawSaveData);
    */
  }

  static createFromGameCubeData(arrayBuffer) {
    const headerBlock = getBlock(arrayBuffer, HEADER_BLOCK_NUMBER);
    const volumeInfo = getVolumeInfo(headerBlock);

    const saveFiles = readSaveFiles(arrayBuffer);

    return new GameCubeSaveData(arrayBuffer, saveFiles, volumeInfo);
  }

  static createFromSaveFiles(saveFiles) {
    return new GameCubeSaveData(undefined, saveFiles, undefined);
  }

  constructor(arrayBuffer, saveFiles, volumeInfo) {
    this.arrayBuffer = arrayBuffer;
    this.saveFiles = saveFiles;
    this.volumeInfo = volumeInfo;
  }

  getSaveFiles() {
    return this.saveFiles;
  }

  getVolumeInfo() {
    return this.volumeInfo;
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
