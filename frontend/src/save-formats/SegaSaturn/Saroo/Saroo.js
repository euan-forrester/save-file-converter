/* eslint-disable no-bitwise */

/*
This is the SS_SAVE.BIN file created by the Saroo, which the official save converter describes as "SAROO save file": https://github.com/tpunix/SAROO/blob/master/tools/savetool/main.c#L131

It's parsed by https://github.com/tpunix/SAROO/blob/master/tools/savetool/sr_bup.c

The file is divided into slots of 0x10000 bytes, one per game (this is double the Saturn's internal memory size, per game). Slot 0 is reserved.

It appears that the file expands as necessary to fit new slots.

Reserved slot format:

0x00 - 0x0F: Magic
0x10 - 0x1F: Game ID 1 (corresponds to the save slot beginning at 0x10000)
0x20 - 0x2F: Game ID 2 (corresponds to the save slot beginning at 0x20000)
(etc)

Save slot format:
0x00 - 0x07: Magic
0x08 - 0x11: Total size
0x0C - 0x0D: Block size
0x0E - 0x0F: Free blocks
0x10 - 0x1F: Unused
0x20 - 0x2F: Game ID
0x30 - 0x3D: Unused
0x3E - 0x3F: Block number of the first save
0x40 - 0x7F: Block occupancy bitmap for the entire slot (includes the slot header block and archive entry blocks)

Archive entry format:
0x00 - 0x0A: Archive name, 11 bytes
0x0C - 0x0F: Archive byte size, 4 bytes
0x10 - 0x19: Archive comment, 10 bytes
0x1A: 00
0x1B: Language code
0x1C - 0x1F: Archive date encoding, 4 bytes
0x3E - 0x3F: The block number of the next save
0x40 - 0x7F: Block occupancy bitmap for the data for this save (does not include the archive entry block)
*/

import Util from '../../../util/util';
import ArrayUtil from '../../../util/Array';

import SegaSaturnSaveData from '../SegaSaturn';
import SegaSaturnUtil from '../Util';
import SegaSaturnSarooUtil from './Util';

const LITTLE_ENDIAN = false;

const MAGIC = 'Saroo Save File'; // 16 bytes long, the same as the length of a game ID in the reserved slot
const MAGIC_OFFSET = 0;
const MAGIC_ENCODING = 'US-ASCII';

const SLOT_SIZE = 0x10000;
const DEFAULT_BLOCK_SIZE = 0x80;

const BITMAP_LENGTH = 64;

const GAME_ID_LENGTH = 0x10;
const GAME_ID_ENCODING = 'US-ASCII';

const NUM_RESERVED_SLOTS = 1;
const NUM_SLOTS = SLOT_SIZE / GAME_ID_LENGTH; // In theory, the reserved slot can store this many game IDs

const FILL_VALUE = 0x00;

const SLOT_MAGIC = 'SaroSave';
const SLOT_MAGIC_OFFSET = 0;
const SLOT_MAGIC_ENCODING = 'US-ASCII';

const SLOT_TOTAL_SIZE_OFFSET = 0x08;
const SLOT_BLOCK_SIZE_OFFSET = 0x0C;
const SLOT_FREE_BLOCKS_OFFSET = 0x0E;
const SLOT_GAME_ID_OFFSET = 0x20;
const SLOT_FIRST_SAVE_BLOCK_OFFSET = 0x3E; // This contains NO_NEXT_SAVE if there's no first save
const SLOT_BITMAP_OFFSET = 0x40;

const NUM_RESERVED_BLOCKS = 1; // The first block in a slot contains the slot information: magic, total size, block size, bitmap, etc

const ARCHIVE_ENTRY_NAME_OFFSET = 0x00;
const ARCHIVE_ENTRY_SAVE_SIZE_OFFSET = 0x0C;
const ARCHIVE_ENTRY_COMMENT_OFFSET = 0x10;
const ARCHIVE_ENTRY_LANGUAGE_OFFSET = 0x1B;
const ARCHIVE_ENTRY_DATE_OFFSET = 0x1C;
const ARCHIVE_ENTRY_NEXT_SAVE_BLOCK_OFFSET = 0x3E; // This contains NO_NEXT_SAVE if there's no next save
const ARCHIVE_ENTRY_BITMAP_OFFSET = 0x40;

const NO_NEXT_SAVE = 0;

function slotContainsValidSaves(slotNum, arrayBuffer) {
  // Reserved slots can't contain valid saves

  if (slotNum < NUM_RESERVED_SLOTS) {
    return false;
  }

  // A slot contains a valid save if there's text in its game ID spot in the reserved slot,
  // and if the file is big enough to hold the data for that slot

  const dataView = new DataView(arrayBuffer);
  const dummy = dataView.getUint32(slotNum * GAME_ID_LENGTH, LITTLE_ENDIAN); // Anything non-zero in the first 4 bytes is sufficient to say there's text there: https://github.com/tpunix/SAROO/blob/master/tools/savetool/sr_bup.c#L397

  return (dummy !== 0) && (arrayBuffer.byteLength >= ((slotNum + 1) * SLOT_SIZE));
}

function getSlot(slotNum, arrayBuffer) {
  return arrayBuffer.slice(slotNum * SLOT_SIZE, (slotNum + 1) * SLOT_SIZE);
}

function getBlock(slotArrayBuffer, blockSize, blockNumber) {
  return slotArrayBuffer.slice(blockNumber * blockSize, (blockNumber + 1) * blockSize);
}

// Based on get_next_block() from https://github.com/tpunix/SAROO/blob/master/tools/savetool/sr_bup.c#L74
// It just finds the next occupied block in sequential order and returns it
//
// I don't think that this deals with fragmentation correctly. When adding a new save it just finds the first free block
// https://github.com/tpunix/SAROO/blob/master/tools/savetool/sr_bup.c#L279 and then keeps finding the next available
// free block https://github.com/tpunix/SAROO/blob/master/tools/savetool/sr_bup.c#L296 but they're not linked together
// in any way. And, the occupancy bitmap doesn't provide any ability to link blocks together
//
// We'll just replicate the functionality from that tool here.
function getNextBlockNum(blockNum, blockOccupancy) {
  const subsequentBlockOccupancy = blockOccupancy.slice(blockNum);
  const subsequentBlockIndex = subsequentBlockOccupancy.find((blockIsOccupied) => blockIsOccupied);

  if (subsequentBlockIndex !== undefined) {
    return subsequentBlockIndex + blockNum;
  }

  throw new Error('No further block is occupied');
}

// Based on access_data() from https://github.com/tpunix/SAROO/blob/master/tools/savetool/sr_bup.c#L97
// Read the save data one block at a time and concat them all together
function getRawDataBlockList(blockNum, blockSize, saveSize, blockOccupancy) {
  const blockIndexes = ArrayUtil.createSequentialArray(0, Math.ceil(saveSize / blockSize));

  let currentBlockNum = blockNum;

  return blockIndexes.map(() => {
    currentBlockNum = getNextBlockNum(currentBlockNum, blockOccupancy);
    return currentBlockNum;
  });
}

function getRawData(blockList, blockSize, saveSize, slotArrayBuffer) {
  const blocks = blockList.map((blockNum) => getBlock(slotArrayBuffer, blockSize, blockNum));

  return Util.concatArrayBuffers(blocks).slice(0, saveSize);
}

function getSaveFiles(slotNum, arrayBuffer) {
  const slotArrayBuffer = getSlot(slotNum, arrayBuffer);
  const slotDataView = new DataView(slotArrayBuffer);
  const slotUint8Array = new Uint8Array(slotArrayBuffer);

  try {
    Util.checkMagic(slotArrayBuffer, SLOT_MAGIC_OFFSET, SLOT_MAGIC, SLOT_MAGIC_ENCODING);
  } catch (e) {
    // It's possible to have a slot with a valid game ID listed in the reserved block but completely blank data in its slot
    // In this case, we just return that there's no save files here
    return {
      gameId: null,
      saveFiles: [],
    };
  }

  const totalSize = slotDataView.getUint32(SLOT_TOTAL_SIZE_OFFSET, LITTLE_ENDIAN);
  const blockSize = slotDataView.getUint16(SLOT_BLOCK_SIZE_OFFSET, LITTLE_ENDIAN);
  const freeBlocks = slotDataView.getUint16(SLOT_FREE_BLOCKS_OFFSET, LITTLE_ENDIAN);
  const gameId = Util.readNullTerminatedString(slotUint8Array, SLOT_GAME_ID_OFFSET, GAME_ID_ENCODING, GAME_ID_LENGTH);
  let nextSaveBlockNum = slotDataView.getUint16(SLOT_FIRST_SAVE_BLOCK_OFFSET, LITTLE_ENDIAN);
  const slotBitmap = slotArrayBuffer.slice(SLOT_BITMAP_OFFSET, SLOT_BITMAP_OFFSET + BITMAP_LENGTH);

  const slotBlockOccupancy = SegaSaturnSarooUtil.getBlockOccupancy(slotBitmap, totalSize, blockSize);

  console.log(`Found slot with total size: ${totalSize}, block size: ${blockSize}, free blocks: ${freeBlocks}, game ID: ${gameId}, first save block num: ${nextSaveBlockNum}`);
  console.log('Used blocks: ', slotBlockOccupancy.usedBlocks);

  const saveFiles = [];

  while (nextSaveBlockNum !== NO_NEXT_SAVE) {
    const archiveEntryBlockArrayBuffer = getBlock(slotArrayBuffer, blockSize, nextSaveBlockNum);
    const archiveEntryBlockDataView = new DataView(archiveEntryBlockArrayBuffer);
    const archiveEntryBlockUint8Array = new Uint8Array(archiveEntryBlockArrayBuffer);

    const name = Util.readNullTerminatedString(archiveEntryBlockUint8Array, ARCHIVE_ENTRY_NAME_OFFSET, SegaSaturnSaveData.ARCHIVE_ENTRY_NAME_ENCODING, SegaSaturnSaveData.ARCHIVE_ENTRY_NAME_LENGTH);
    const languageCode = archiveEntryBlockDataView.getUint8(ARCHIVE_ENTRY_LANGUAGE_OFFSET);
    const comment = Util.readNullTerminatedString(
      archiveEntryBlockUint8Array,
      ARCHIVE_ENTRY_COMMENT_OFFSET,
      SegaSaturnSaveData.ARCHIVE_ENTRY_COMMENT_ENCODING,
      SegaSaturnSaveData.ARCHIVE_ENTRY_COMMENT_LENGTH,
    );
    const dateCode = archiveEntryBlockDataView.getUint32(ARCHIVE_ENTRY_DATE_OFFSET, LITTLE_ENDIAN);
    const saveSize = archiveEntryBlockDataView.getUint32(ARCHIVE_ENTRY_SAVE_SIZE_OFFSET, LITTLE_ENDIAN);

    const saveFileBitmap = archiveEntryBlockArrayBuffer.slice(ARCHIVE_ENTRY_BITMAP_OFFSET, ARCHIVE_ENTRY_BITMAP_OFFSET + BITMAP_LENGTH);
    const saveFileBlockOccupancy = SegaSaturnSarooUtil.getBlockOccupancy(saveFileBitmap, totalSize, blockSize);

    const rawDataBlockList = getRawDataBlockList(nextSaveBlockNum, blockSize, saveSize, saveFileBlockOccupancy.blockOccupancy);
    const rawData = getRawData(rawDataBlockList, blockSize, saveSize, slotArrayBuffer);

    nextSaveBlockNum = archiveEntryBlockDataView.getUint16(ARCHIVE_ENTRY_NEXT_SAVE_BLOCK_OFFSET, LITTLE_ENDIAN);

    console.log(`Found save with name ${name}, comment ${comment}, language: ${SegaSaturnUtil.getLanguageString(languageCode)}`);
    console.log(`date: ${SegaSaturnUtil.getDate(dateCode).toUTCString()}, size: ${saveSize}, next save block num ${nextSaveBlockNum}`);

    saveFiles.push({
      name,
      languageCode,
      language: SegaSaturnUtil.getLanguageString(languageCode),
      comment,
      dateCode,
      date: SegaSaturnUtil.getDate(dateCode),
      blockList: rawDataBlockList,
      saveSize,
      rawData,
    });
  }

  if (saveFiles.length === 0) {
    console.log('No save found for this game');
  }

  return {
    gameId,
    saveFiles,
  };
}

function getVolumeInfo(arrayBuffer) {
  // Not much I can think of to say about the volume as a whole, since each slot is more like a mini-volume
  // with a max size and number of free blocks and etc
  return {
    totalSlots: Math.floor(arrayBuffer.byteLength / SLOT_SIZE),
  };
}

function createReservedSlot(gameSaveFiles) {
  // The reserved slot is the magic, followed by the ID of every game that has a save. The game IDs have the same length as the magic

  let reservedSlot = Util.getFilledArrayBuffer(SLOT_SIZE, FILL_VALUE);

  reservedSlot = Util.setMagic(reservedSlot, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);

  gameSaveFiles.forEach((gameInfo, index) => {
    reservedSlot = Util.setString(reservedSlot, (index + 1) * GAME_ID_LENGTH, gameInfo.gameId, GAME_ID_ENCODING, GAME_ID_LENGTH);
  });

  return reservedSlot;
}

function createGameSlot(gameInfo) {
  // First calculate how many blocks we need for all of our saves and create our block occupancy bitmap

  let nextSaveBlockNum = NUM_RESERVED_BLOCKS;

  const saveFilesWithBlocksNeeded = gameInfo.saveFiles.map((saveFile) => {
    const numDataBlocksNeeded = Math.ceil(saveFile.rawData.byteLength / DEFAULT_BLOCK_SIZE);
    const startingBlockNum = nextSaveBlockNum;

    nextSaveBlockNum += (numDataBlocksNeeded + 1);

    return {
      ...saveFile,
      numDataBlocksNeeded,
      nextSaveBlockNum,
      usedBlocks: ArrayUtil.createSequentialArray(startingBlockNum + 1, numDataBlocksNeeded), // Cheating, because we know we're going to lay everything out sequentially
    };
  });

  if (saveFilesWithBlocksNeeded.length > 0) {
    saveFilesWithBlocksNeeded[saveFilesWithBlocksNeeded.length - 1].nextSaveBlockNum = NO_NEXT_SAVE;
  }

  let numUsedBlocks = NUM_RESERVED_BLOCKS; // First block is the header

  saveFilesWithBlocksNeeded.forEach((saveFile) => {
    numUsedBlocks += (saveFile.numDataBlocksNeeded + 1); // +1 for the archive entry block for this save
  });

  const totalBlocks = Math.floor(SLOT_SIZE / DEFAULT_BLOCK_SIZE);
  const freeBlocks = totalBlocks - numUsedBlocks;

  if (freeBlocks < 0) {
    throw new Error(`Not enough space to contain ${gameInfo.saveFiles.length} saves. Need ${numUsedBlocks} blocks but only have ${totalBlocks} blocks`);
  }

  const slotUsedBlocks = ArrayUtil.createSequentialArray(0, numUsedBlocks); // Cheating, because we know we're going to lay everything out sequentially
  const slotBlockOccupancyBitmapArrayBuffer = SegaSaturnSarooUtil.createBlockOccupancyBitmap(slotUsedBlocks, BITMAP_LENGTH);

  // Now we can create our header block that contains the number of used blocks and the slot block occupancy bitmap

  let headerBlock = Util.getFilledArrayBuffer(DEFAULT_BLOCK_SIZE, FILL_VALUE);
  headerBlock = Util.setMagic(headerBlock, SLOT_MAGIC_OFFSET, SLOT_MAGIC, SLOT_MAGIC_ENCODING);
  headerBlock = Util.setString(headerBlock, SLOT_GAME_ID_OFFSET, gameInfo.gameId, GAME_ID_ENCODING, GAME_ID_LENGTH);
  headerBlock = Util.setArrayBufferPortion(headerBlock, slotBlockOccupancyBitmapArrayBuffer, SLOT_BITMAP_OFFSET, 0, BITMAP_LENGTH);

  const headerBlockDataView = new DataView(headerBlock);

  headerBlockDataView.setUint32(SLOT_TOTAL_SIZE_OFFSET, SLOT_SIZE, LITTLE_ENDIAN);
  headerBlockDataView.setUint16(SLOT_BLOCK_SIZE_OFFSET, DEFAULT_BLOCK_SIZE, LITTLE_ENDIAN);
  headerBlockDataView.setUint16(SLOT_FREE_BLOCKS_OFFSET, freeBlocks);
  headerBlockDataView.setUint16(SLOT_FIRST_SAVE_BLOCK_OFFSET, gameInfo.saveFiles.length > 0 ? NUM_RESERVED_BLOCKS : NO_NEXT_SAVE); // If there's a first save file, it goes in the next block

  // Next we can create the archive block for each save, and append the data (rounded up to the next block)

  const allSlotPortions = [headerBlock];

  saveFilesWithBlocksNeeded.forEach((saveFile) => {
    const saveFileBlockOccupancyBitmapArrayBuffer = SegaSaturnSarooUtil.createBlockOccupancyBitmap(saveFile.usedBlocks, BITMAP_LENGTH);

    let archiveEntryBlock = Util.getFilledArrayBuffer(DEFAULT_BLOCK_SIZE, FILL_VALUE);

    archiveEntryBlock = Util.setString(
      archiveEntryBlock,
      ARCHIVE_ENTRY_NAME_OFFSET,
      saveFile.name,
      SegaSaturnSaveData.ARCHIVE_ENTRY_NAME_ENCODING,
      SegaSaturnSaveData.ARCHIVE_ENTRY_NAME_LENGTH,
    );
    archiveEntryBlock = Util.setString(
      archiveEntryBlock,
      ARCHIVE_ENTRY_COMMENT_OFFSET,
      saveFile.comment,
      SegaSaturnSaveData.ARCHIVE_ENTRY_COMMENT_ENCODING,
      SegaSaturnSaveData.ARCHIVE_ENTRY_COMMENT_LENGTH,
    );

    archiveEntryBlock = Util.setArrayBufferPortion(archiveEntryBlock, saveFileBlockOccupancyBitmapArrayBuffer, ARCHIVE_ENTRY_BITMAP_OFFSET, 0, BITMAP_LENGTH);

    const archiveEntryBlockDataView = new DataView(archiveEntryBlock);

    archiveEntryBlockDataView.setUint32(ARCHIVE_ENTRY_SAVE_SIZE_OFFSET, saveFile.rawData.byteLength, LITTLE_ENDIAN);
    archiveEntryBlockDataView.setUint8(ARCHIVE_ENTRY_LANGUAGE_OFFSET, saveFile.languageCode);
    archiveEntryBlockDataView.setUint32(ARCHIVE_ENTRY_DATE_OFFSET, saveFile.dateCode, LITTLE_ENDIAN);
    archiveEntryBlockDataView.setUint16(ARCHIVE_ENTRY_NEXT_SAVE_BLOCK_OFFSET, saveFile.nextSaveBlockNum, LITTLE_ENDIAN);

    allSlotPortions.push(archiveEntryBlock);
    allSlotPortions.push(saveFile.rawData);
    if ((saveFile.rawData.byteLength % DEFAULT_BLOCK_SIZE) !== 0) {
      // Round us out to the nearest block
      allSlotPortions.push(Util.getFilledArrayBuffer(DEFAULT_BLOCK_SIZE - (saveFile.rawData.byteLength % DEFAULT_BLOCK_SIZE), FILL_VALUE));
    }
  });

  // Fill in the rest of the empty space and combine everything to create the slot

  allSlotPortions.push(Util.getFilledArrayBuffer(freeBlocks * DEFAULT_BLOCK_SIZE, FILL_VALUE));

  return Util.concatArrayBuffers(allSlotPortions);
}

export default class SarooSegaSaturnSaveData {
  static createWithNewSize(/* segaSaturnSaveData, newSize */) {
    /*
    const newRawSaveData = SegaSaturnUtil.resize(segaSaturnSaveData.getArrayBuffer(), newSize);

    return SegaSaturnSaveData.createFromSegaSaturnData(newRawSaveData);
    */
  }

  static createFromSarooData(arrayBuffer) {
    Util.checkMagic(arrayBuffer, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);

    const allSlotNums = ArrayUtil.createSequentialArray(NUM_RESERVED_SLOTS, NUM_SLOTS - NUM_RESERVED_SLOTS);
    const firstInvalidSlotIndex = allSlotNums.findIndex((slotNum) => !slotContainsValidSaves(slotNum, arrayBuffer));
    const validSlotNums = (firstInvalidSlotIndex >= 0) ? allSlotNums.slice(0, firstInvalidSlotIndex) : allSlotNums;

    const gameSaveFiles = validSlotNums.map((slotNum) => getSaveFiles(slotNum, arrayBuffer));

    const volumeInfo = getVolumeInfo(arrayBuffer);

    return new SarooSegaSaturnSaveData(arrayBuffer, gameSaveFiles, volumeInfo);
  }

  static createFromSaveFiles(gameSaveFiles) {
    const reservedSlot = createReservedSlot(gameSaveFiles);

    const gameSlots = gameSaveFiles.map((gameInfo) => createGameSlot(gameInfo));

    const arrayBuffer = Util.concatArrayBuffers([reservedSlot].concat(gameSlots));

    const volumeInfo = getVolumeInfo(arrayBuffer);

    return new SarooSegaSaturnSaveData(arrayBuffer, gameSaveFiles, volumeInfo);
  }

  // This constructor creates a new object from a binary representation of Sega Saturn save data
  constructor(arrayBuffer, gameSaveFiles, volumeInfo) {
    this.arrayBuffer = arrayBuffer;
    this.gameSaveFiles = gameSaveFiles;
    this.saveFiles = gameSaveFiles.map((gameInfo) => gameInfo.saveFiles).flat();
    this.volumeInfo = volumeInfo;
  }

  getGameSaveFiles() {
    return this.gameSaveFiles;
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
