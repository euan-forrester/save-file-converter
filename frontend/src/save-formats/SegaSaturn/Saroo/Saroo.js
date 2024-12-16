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
0x40 - 0x7F: Block occupancy bitmap

Archive entry format:
0x00 - 0x0A: Archive name, 11 bytes
0x0C - 0x0F: Archive byte size, 4 bytes
0x10 - 0x19: Archive comment, 10 bytes
0x1A: 00
0x1B: Language code
0x1C - 0x1F: Archive date encoding, 4 bytes
0x3E - 0x3F: The block number of the next save
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

const GAME_ID_LENGTH = 0x10;
const GAME_ID_ENCODING = 'US-ASCII';

const NUM_RESERVED_SLOTS = 1;
const NUM_SLOTS = SLOT_SIZE / GAME_ID_LENGTH; // In theory, the reserved slot can store this many game IDs

const SLOT_MAGIC = 'SaroSave';
const SLOT_MAGIC_OFFSET = 0;
const SLOT_MAGIC_ENCODING = 'US-ASCII';

const SLOT_TOTAL_SIZE_OFFSET = 0x08;
const SLOT_BLOCK_SIZE_OFFSET = 0x0C;
const SLOT_FREE_BLOCKS_OFFSET = 0x0E;
const SLOT_GAME_ID_OFFSET = 0x20;
const SLOT_FIRST_SAVE_BLOCK_OFFSET = 0x3E; // This contains 0x00 if there's no save
const SLOT_BITMAP_OFFSET = 0x40;
const SLOT_BITMAP_LENGTH = 64;

const NUM_RESERVED_BLOCKS = 1; // The first block in a slot contains the slot information: magic, total size, block size, bitmap, etc

const ARCHIVE_ENTRY_NAME_OFFSET = 0x00;
const ARCHIVE_ENTRY_SAVE_SIZE_OFFSET = 0x0C;
const ARCHIVE_ENTRY_COMMENT_OFFSET = 0x10;
const ARCHIVE_ENTRY_LANGUAGE_OFFSET = 0x1B;
const ARCHIVE_ENTRY_DATE_OFFSET = 0x1C;
const ARCHIVE_ENTRY_NEXT_SAVE_BLOCK_OFFSET = 0x3E;

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
    return [];
  }

  const totalSize = slotDataView.getUint32(SLOT_TOTAL_SIZE_OFFSET, LITTLE_ENDIAN);
  const blockSize = slotDataView.getUint16(SLOT_BLOCK_SIZE_OFFSET, LITTLE_ENDIAN);
  const freeBlocks = slotDataView.getUint16(SLOT_FREE_BLOCKS_OFFSET, LITTLE_ENDIAN);
  const gameId = Util.readNullTerminatedString(slotUint8Array, SLOT_GAME_ID_OFFSET, GAME_ID_ENCODING, GAME_ID_LENGTH);
  let nextSaveBlockNum = slotDataView.getUint16(SLOT_FIRST_SAVE_BLOCK_OFFSET, LITTLE_ENDIAN);
  const bitmap = slotArrayBuffer.slice(SLOT_BITMAP_OFFSET, SLOT_BITMAP_OFFSET + SLOT_BITMAP_LENGTH);

  const { blockOccupancy, usedBlocks } = SegaSaturnSarooUtil.getBlockOccupancy(bitmap, totalSize, blockSize);

  console.log(`Found slot with total size: ${totalSize}, block size: ${blockSize}, free blocks: ${freeBlocks}, game ID: ${gameId}, first save block num: ${nextSaveBlockNum}`);
  console.log('Used blocks: ', usedBlocks);

  const saveFiles = [];

  while (nextSaveBlockNum >= NUM_RESERVED_BLOCKS) {
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

    const rawDataBlockList = getRawDataBlockList(nextSaveBlockNum, blockSize, saveSize, blockOccupancy);
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

  return saveFiles;
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

    const saveFiles = validSlotNums.map((slotNum) => getSaveFiles(slotNum, arrayBuffer)).flat();

    return new SarooSegaSaturnSaveData(arrayBuffer, saveFiles);
  }

  static createFromSaveFiles(/* saveFiles, size */) {
    /*
    // Setup and make sure we have enough space for the files

    let segaCdArrayBuffer = SegaCdUtil.makeEmptySave(size);
    const initialFreeBlocks = SegaCdUtil.getTotalAvailableBlocks(segaCdArrayBuffer); // If we call SegaCdUtil.getNumFreeBlocks() it will subtract one because of the extra block that's reserved for the first file's directory entry

    const requiredBlocksForSaves = saveFiles.reduce((accumulatedBlocks, saveFile) => accumulatedBlocks + getRequiredBlocks(saveFile), 0);
    const requiredBlocksForDirectoryEntries = Math.ceil(saveFiles.length / 2);
    const requiredReservedBlocks = ((saveFiles.length % 2) === 0) ? 1 : 0; // We can store 2 directory entries in a block. We always need room for the next future directory entry. So, if there are an odd number of save files we can store the next one in our last block. But if there are an even number of save files we need to reserve the next block

    const requiredBlocks = requiredBlocksForSaves + requiredBlocksForDirectoryEntries + requiredReservedBlocks;

    if (requiredBlocks > initialFreeBlocks) {
      throw new Error(`The specified save files require a total of ${requiredBlocks} blocks of free space, but Sega CD save data of ${size} bytes only has ${initialFreeBlocks} free blocks`);
    }

    // Write the files
    */

    // return new SegaSaturnSaveData(segaSaturnArrayBuffer, saveFiles);
  }

  // This constructor creates a new object from a binary representation of Sega Saturn save data
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
