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

First a quick note that every individual original memory card has a unique 12-byte "flash ID". It's written to the GameCube's SRAM when the card is mounted.
When writing an image to an official memcard if the flash ID doesn't match the card's then the card will be corrupted: https://github.com/suloku/gcmm/blob/95c737c2af0ebecfa2ef02a8c6c30496d0036e87/source/main.c#L41
The serial number (see below) and flash ID is ignored in emulators and the memcard pro. Memcard images from these sources typically have a serial and/or flash ID that's all 0x00
Example flash IDs can be found in the tests for this module.

0x0000-0x000B: Serial number. This is the memory card's flash ID mangled with the format time (see getSerial() below)
0x000C-0x0013: Time of format of the card (64 bit value, as an OSTime: see GameCubeUtil.getDateFromOsTime())
0x0014-0x0017: RTC bias (value added to RTC) read from SRAM at time of format. See https://gitlab.collabora.com/sebastianfricke/linux/-/blob/7a24a61a5051a1454f42b370da76691cb59d9385/drivers/rtc/rtc-gamecube.c
0x0018-0x001B: Language code read from SRAM. Values: https://www.gc-forever.com/yagcd/chap10.html#sec10.5
0x001C-0x001F: VI DTV status register value. Contains information about progressive scan and/or whether component cables plugged in etc: https://www.gc-forever.com/yagcd/chap5.html#sec5
0x0020-0x0021: Slot number (0: Slot A, 1: Slot B)
0x0022-0x0023: Size of memcard in megabits
0x0024-0x0025: Encoding (0: ASCII, 1: shift-jis)
0x0026-0x01F9: padding (0xFF)
0x01FA-0x01FB: Update counter: https://github.com/bodgit/gc/blob/main/header.go#L32 (initialized to 0xFFFF: https://github.com/bodgit/gc/blob/98581357d5ae1e6c1c7579358eeebcf0d16fc9a9/memcard.go#L266). Used to determine whether to use the main or backup directory or blockmap
0x01FC-0x01FD: Additive checksum
0x01FE-0x01FF: Inverse checksum
0x0200-0x3DFF: padding (0xFF)
*/

import Util from '../../util/util';

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

const HEADER_PADDING_VALUE = 0xFF;
const BLOCK_PADDING_VALUE = 0x00;

const SERIAL_OFFSET = 0x0000;
const SERIAL_LENGTH = 12;
const FORMAT_OSTIME_OFFSET = 0x000C;
const RTC_BIAS_OFFSET = 0x0014;
const LANGUAGE_CODE_OFFSET = 0x0018;
const VI_DTV_STATUS_OFFSET = 0x001C;
const MEMCARD_SLOT_OFFSET = 0x0020;
const MEMCARD_SLOT_A = 0;
const MEMCARD_SLOT_B = 1;
const MEMCARD_SIZE_OFFSET = 0x0022;
const ENCODING_OFFSET = 0x0024;
const UPDATE_COUNTER_OFFSET = 0x1FA;
const CHECKSUM_OFFSET = 0x01FC;
const CHECKSUM_INVERSE_OFFSET = 0x01FE;
const CHECKSUMMED_DATA_BEGIN_OFFSET = 0; // Checksummed data offset and size are taken from https://github.com/dolphin-emu/dolphin/blob/4f210df86a2d2362ef8087cf81b817b18c3d32e9/Source/Core/Core/HW/GCMemcard/GCMemcard.cpp#L1284
const CHECKSUMMED_DATA_SIZE = CHECKSUM_OFFSET - CHECKSUMMED_DATA_BEGIN_OFFSET;

function getBlock(arrayBuffer, blockNumber) {
  const startOffset = blockNumber * BLOCK_SIZE;
  return arrayBuffer.slice(startOffset, startOffset + BLOCK_SIZE);
}

function createBlock() {
  return Util.getFilledArrayBuffer(BLOCK_SIZE, BLOCK_PADDING_VALUE);
}

// Taken from https://github.com/dolphin-emu/dolphin/blob/4f210df86a2d2362ef8087cf81b817b18c3d32e9/Source/Core/Core/HW/GCMemcard/GCMemcard.cpp#L1210
function getSerial(cardFlashId, formatTime) {
  const serialArrayBuffer = new ArrayBuffer(SERIAL_LENGTH);
  const serialUint8Array = new Uint8Array(serialArrayBuffer);
  const cardFlashIdUint8Array = new Uint8Array(cardFlashId);

  let rand = formatTime;

  for (let i = 0; i < SERIAL_LENGTH; i += 1) {
    rand = (((rand * 0x0000000041c64e6dn) + 0x0000000000003039n) >> 16n);
    serialUint8Array[i] = (cardFlashIdUint8Array[i] + Number(rand & 0xFFFFFFFFn)) & 0xFF;
    rand = (((rand * 0x0000000041c64e6dn) + 0x0000000000003039n) >> 16n);
    rand &= 0x0000000000007fffn;
  }

  return serialArrayBuffer;
}

// Taken from https://github.com/dolphin-emu/dolphin/blob/4f210df86a2d2362ef8087cf81b817b18c3d32e9/Source/Core/Core/HW/Sram.cpp#L50
function getCardFlashId(serialArrayBuffer, formatTime) {
  const cardFlashIdArrayBuffer = new ArrayBuffer(SERIAL_LENGTH);
  const cardFlashIdUint8Array = new Uint8Array(cardFlashIdArrayBuffer);
  const serialUint8Array = new Uint8Array(serialArrayBuffer);

  let rand = formatTime;

  for (let i = 0; i < SERIAL_LENGTH; i += 1) {
    rand = (((rand * 0x0000000041c64e6dn) + 0x0000000000003039n) >> 16n);
    cardFlashIdUint8Array[i] = serialUint8Array[i] - Number(rand & 0xFFn);
    rand = (((rand * 0x0000000041c64e6dn) + 0x0000000000003039n) >> 16n);
    rand &= 0x0000000000007fffn;
  }

  return cardFlashIdArrayBuffer;
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

  const serial = headerBlock.slice(SERIAL_OFFSET, SERIAL_OFFSET + SERIAL_LENGTH);
  const formatOsTimeCode = dataView.getBigUint64(FORMAT_OSTIME_OFFSET, LITTLE_ENDIAN);
  const rtcBias = dataView.getUint32(RTC_BIAS_OFFSET, LITTLE_ENDIAN);
  const languageCode = dataView.getUint32(LANGUAGE_CODE_OFFSET, LITTLE_ENDIAN);
  const viDtvStatus = dataView.getUint32(VI_DTV_STATUS_OFFSET, LITTLE_ENDIAN);
  const memcardSlot = dataView.getUint16(MEMCARD_SLOT_OFFSET, LITTLE_ENDIAN);
  const memcardSizeMegabits = dataView.getUint16(MEMCARD_SIZE_OFFSET, LITTLE_ENDIAN);
  const encodingCode = dataView.getUint16(ENCODING_OFFSET, LITTLE_ENDIAN);
  const updateCounter = dataView.getUint16(UPDATE_COUNTER_OFFSET, LITTLE_ENDIAN);
  const checksum = dataView.getUint16(CHECKSUM_OFFSET, LITTLE_ENDIAN);
  const checksumInverse = dataView.getUint16(CHECKSUM_INVERSE_OFFSET, LITTLE_ENDIAN);

  const cardFlashId = getCardFlashId(serial, formatOsTimeCode);

  const calculatedChecksums = calculateChecksums(headerBlock, CHECKSUMMED_DATA_BEGIN_OFFSET, CHECKSUMMED_DATA_SIZE);

  if (checksum !== calculatedChecksums.checksum) {
    throw new Error(`File may be corrupt. Read checksum 0x${checksum.toString(16)} but calculated checksum 0x${calculatedChecksums.checksum.toString(16)}`);
  }

  if (checksumInverse !== calculatedChecksums.checksumInverse) {
    throw new Error(`File may be corrupt. Read checksum inverse 0x${checksumInverse.toString(16)} but calculated checksum inverse 0x${calculatedChecksums.checksumInverse.toString(16)}`);
  }

  return {
    serial,
    cardFlashId,
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
    updateCounter,
    checksum,
    checksumInverse,
  };
}

function createHeaderBlock(volumeInfo) {
  const serialArrayBuffer = getSerial(volumeInfo.cardFlashId, volumeInfo.formatOsTimeCode);

  let headerArrayBuffer = Util.getFilledArrayBuffer(BLOCK_SIZE, HEADER_PADDING_VALUE);
  headerArrayBuffer = Util.setArrayBufferPortion(headerArrayBuffer, serialArrayBuffer, SERIAL_OFFSET, 0, SERIAL_LENGTH);

  const headerDataView = new DataView(headerArrayBuffer);

  headerDataView.setBigUint64(FORMAT_OSTIME_OFFSET, volumeInfo.formatOsTimeCode, LITTLE_ENDIAN);
  headerDataView.setUint32(RTC_BIAS_OFFSET, volumeInfo.rtcBias, LITTLE_ENDIAN);
  headerDataView.setUint32(LANGUAGE_CODE_OFFSET, volumeInfo.languageCode, LITTLE_ENDIAN);
  headerDataView.setUint32(VI_DTV_STATUS_OFFSET, volumeInfo.viDtvStatus, LITTLE_ENDIAN);
  headerDataView.setUint16(MEMCARD_SLOT_OFFSET, volumeInfo.memcardSlot, LITTLE_ENDIAN);
  headerDataView.setUint16(MEMCARD_SIZE_OFFSET, volumeInfo.memcardSizeMegabits, LITTLE_ENDIAN);
  headerDataView.setUint16(ENCODING_OFFSET, volumeInfo.encodingCode, LITTLE_ENDIAN);
  headerDataView.setUint16(UPDATE_COUNTER_OFFSET, volumeInfo.updateCounter, LITTLE_ENDIAN);

  const { checksum, checksumInverse } = calculateChecksums(headerArrayBuffer, CHECKSUMMED_DATA_BEGIN_OFFSET, CHECKSUMMED_DATA_SIZE);

  headerDataView.setUint16(CHECKSUM_OFFSET, checksum, LITTLE_ENDIAN);
  headerDataView.setUint16(CHECKSUM_INVERSE_OFFSET, checksumInverse, LITTLE_ENDIAN);

  return headerArrayBuffer;
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

  static createFromSaveFiles(saveFiles, volumeInfo) {
    const headerBlock = createHeaderBlock(volumeInfo);

    const totalSizeBytes = ((volumeInfo.memcardSizeMegabits / 8) * 1024 * 1024);

    let memcardArrayBuffer = headerBlock;

    while (memcardArrayBuffer.byteLength < totalSizeBytes) {
      memcardArrayBuffer = Util.concatArrayBuffers([memcardArrayBuffer, createBlock()]);
    }

    return new GameCubeSaveData(memcardArrayBuffer, saveFiles, volumeInfo);
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
