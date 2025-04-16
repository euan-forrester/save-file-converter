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
0x0014-0x0017: RTC bias (value added to RTC) read from SRAM at time of format. See https://gitlab.collabora.com/sebastianfricke/linux/-/blob/7a24a61a5051a1454f42b370da76691cb59d9385/drivers/rtc/rtc-gamecube.c
0x0018-0x001B: Language code read from SRAM. Values: https://www.gc-forever.com/yagcd/chap10.html#sec10.5
0x001C-0x001F: VI DTV status register value. Contains information about progressive scan and/or whether component cables plugged in etc: https://www.gc-forever.com/yagcd/chap5.html#sec5
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
const RTC_BIAS_OFFSET = 0x0014;
const LANGUAGE_CODE_OFFSET = 0x0018;
const VI_DTV_STATUS_OFFSET = 0x001C;
const MEMCARD_SLOT_OFFSET = 0x0020;
const MEMCARD_SLOT_A = 0;
const MEMCARD_SLOT_B = 1;
const MEMCARD_SIZE_OFFSET = 0x0022;
const ENCODING_OFFSET = 0x0024;

const CHECKSUM_OFFSET = 0x01FC;
const CHECKSUM_INVERSE_OFFSET = 0x01FE;
const CHECKSUMMED_DATA_BEGIN_OFFSET = 0; // Checksummed data offset and size are taken from https://github.com/dolphin-emu/dolphin/blob/4f210df86a2d2362ef8087cf81b817b18c3d32e9/Source/Core/Core/HW/GCMemcard/GCMemcard.cpp#L1284
const CHECKSUMMED_DATA_SIZE = CHECKSUM_OFFSET - CHECKSUMMED_DATA_BEGIN_OFFSET;

function getBlock(arrayBuffer, blockNumber) {
  const startOffset = blockNumber * BLOCK_SIZE;
  return arrayBuffer.slice(startOffset, startOffset + BLOCK_SIZE);
}

// Taken from https://github.com/dolphin-emu/dolphin/blob/4f210df86a2d2362ef8087cf81b817b18c3d32e9/Source/Core/Core/HW/GCMemcard/GCMemcard.cpp#L328
function calculateChecksums(arrayBuffer, beginOffset, length) {
  let checksum = 0;
  let checksumInverse = 0;

  const dataView = new DataView(arrayBuffer);

  for (let i = 0; i < length; i += 2) {
    checksum += dataView.getUint16(beginOffset + i, LITTLE_ENDIAN);
    checksumInverse += dataView.getUint16(beginOffset + i, LITTLE_ENDIAN) ^ 0xFFFF;

    // Need to make sure we're always constrained to 16 bits
    checksum &= 0xFFFF;
    checksumInverse &= 0xFFFF;
  }

  if (checksum === 0xFFFF) {
    checksum = 0;
  }

  if (checksumInverse === 0xFFFF) {
    checksumInverse = 0;
  }

  return {
    checksum,
    checksumInverse,
  };
}

function getVolumeInfo(headerBlock) {
  const dataView = new DataView(headerBlock);

  const formatOsTimeCode = dataView.getBigUint64(FORMAT_OSTIME_OFFSET, LITTLE_ENDIAN);
  const rtcBias = dataView.getUint32(RTC_BIAS_OFFSET, LITTLE_ENDIAN);
  const languageCode = dataView.getUint32(LANGUAGE_CODE_OFFSET, LITTLE_ENDIAN);
  const viDtvStatus = dataView.getUint32(VI_DTV_STATUS_OFFSET, LITTLE_ENDIAN);
  const memcardSlot = dataView.getUint16(MEMCARD_SLOT_OFFSET, LITTLE_ENDIAN);
  const memcardSizeMegabits = dataView.getUint16(MEMCARD_SIZE_OFFSET, LITTLE_ENDIAN);
  const encodingCode = dataView.getUint16(ENCODING_OFFSET, LITTLE_ENDIAN);
  const checksum = dataView.getUint16(CHECKSUM_OFFSET, LITTLE_ENDIAN);
  const checksumInverse = dataView.getUint16(CHECKSUM_INVERSE_OFFSET, LITTLE_ENDIAN);

  const calculatedChecksums = calculateChecksums(headerBlock, CHECKSUMMED_DATA_BEGIN_OFFSET, CHECKSUMMED_DATA_SIZE);

  if (checksum !== calculatedChecksums.checksum) {
    throw new Error(`Checksum does not match data. Read checksum 0x${checksum.toString(16)} but calculated checksum 0x${calculatedChecksums.checksum.toString(16)}`);
  }

  if (checksumInverse !== calculatedChecksums.checksumInverse) {
    throw new Error(`Checksum inverse does not match data. Read checksum inverse 0x${checksumInverse.toString(16)} `
      + `but calculated checksum inverse 0x${calculatedChecksums.checksumInverse.toString(16)}`);
  }

  return {
    formatOsTimeCode,
    formatTime: GameCubeUtil.getDateFromOsTime(formatOsTimeCode),
    rtcBias,
    languageCode,
    language: GameCubeUtil.getLanguageString(languageCode),
    viDtvStatus,
    memcardSlot,
    memcardSizeMegabits,
    encodingCode,
    encodingString: GameCubeUtil.getEncodingString(encodingCode),
    checksum,
    checksumInverse,
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
