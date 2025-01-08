/* eslint-disable no-bitwise */

/*
This is the SS_MEMS.BIN file created by the Saroo
The official save converter describes as "SAROO extend save": https://github.com/tpunix/SAROO/blob/master/tools/savetool/main.c#L131
The Saroo reads/writes here when the game wants to access a backup memory cart: https://github.com/tpunix/SAROO/issues/232

It's parsed by https://github.com/tpunix/SAROO/blob/master/tools/savetool/sr_mems.c

This file has 8064 blocks of 1024 bytes each (see below about the "missing" 128 blocks from the occupancy bitmap)

Block 0: Header

0x00 - 0x07:  Magic
0x08 - 0x0B:  Total size
0x0C - 0x0D:  Free block
0x0E - 0x0F:  Unused (listed as "first save", but not used and set to 0x00)
0x10 - 0x3FF: Block occupancy bitmap

Blocks 1 - 7: Directory entries

Directory entry:

0x00 - 0x0B: Name
0x0C - 0x0D: Unused (listed as save size and read as a uint32. But it's only 2 bytes from the starting block num. This appears to be a bug, and they also this is always set to 0x00: https://github.com/tpunix/SAROO/blob/master/tools/savetool/sr_mems.c#L314
0x0E - 0x0F: Archive entry block number

Archive entry:

0x00 - 0x0B: Name
0x0C - 0x0F: Size in bytes
0x10 - 0x1A: Comment
0x1B:        Language code
0x1C - 1x1F: Date code
0x40 - ????: Save data (if small enough to fit in this block), or list of blocks containing the save data (terminated with ARCHIVE_ENTRY_BLOCK_LIST_END)
*/

import Util from '../../../util/util';
import ArrayUtil from '../../../util/Array';

import SegaSaturnSaveData from '../SegaSaturn';
import SegaSaturnUtil from '../Util';

import SegaSaturnSarooUtil from './Util';

const LITTLE_ENDIAN = false;

const BLOCK_SIZE = 1024;
const TOTAL_BLOCKS = 8192; // The file is this many blocks long, but only 8064 are usable: see note below about the "missing" blocks
const FILL_VALUE = 0x00;

const HEADER_NUM_BLOCKS = 1;

const MAGIC = 'SaroMems';
const MAGIC_OFFSET = 0;
const MAGIC_ENCODING = 'US-ASCII';

const TOTAL_SIZE_OFFSET = 0x08;
const FREE_BLOCKS_OFFSET = 0x0C;
const BITMAP_OFFSET = 0x10;
const BITMAP_LENGTH = BLOCK_SIZE - BITMAP_OFFSET; // Note that the bitmap is "missing" 16 bytes, which are used by the header. 16 bytes * 8 = 128 blocks not included in the bitmap. Hence the file has 8064 blocks instead of 8192

const AVAILABLE_BLOCKS = BITMAP_LENGTH * 8;

const DIRECTORY_OFFSET = BLOCK_SIZE;
const DIRECTORY_NUM_BLOCKS = 7;
const DIRECTORY_ENTRY_NAME_OFFSET = 0x00;
const DIRECTORY_ENTRY_STARTING_BLOCK = 0x0E;
const DIRECTORY_ENTRY_LENGTH = 0x10;

const TOTAL_DIRECTORY_ENTRIES = (DIRECTORY_NUM_BLOCKS * BLOCK_SIZE) / DIRECTORY_ENTRY_LENGTH;

const ARCHIVE_ENTRY_NAME_OFFSET = 0x00;
const ARCHIVE_ENTRY_SIZE_OFFSET = 0x0C;
const ARCHIVE_ENTRY_COMMENT_OFFSET = 0x10;
const ARCHIVE_ENTRY_LANGUAGE_OFFSET = 0x1B;
const ARCHIVE_ENTRY_DATE_OFFSET = 0x1C;
const ARCHIVE_ENTRY_BLOCK_LIST_OFFSET = 0x40;
const ARCHIVE_ENTRY_BLOCK_LIST_ENTRY_SIZE = 2;
const ARCHIVE_ENTRY_BLOCK_LIST_END = 0x0000;

const ARCHIVE_ENTRY_BLOCK_LIST_AVAILABLE_SIZE = BLOCK_SIZE - ARCHIVE_ENTRY_BLOCK_LIST_OFFSET;
const ARCHIVE_ENTRY_MAX_NUM_BLOCKS = (ARCHIVE_ENTRY_BLOCK_LIST_AVAILABLE_SIZE / ARCHIVE_ENTRY_BLOCK_LIST_ENTRY_SIZE) - 1; // -1 for the end of list marker. We have space for a list of 479 blocks, which would support files of 479kB: much larger than the original Saturn's cart memory

const NUM_RESERVED_BLOCKS = HEADER_NUM_BLOCKS + DIRECTORY_NUM_BLOCKS;

function createEmptyBlock() {
  return Util.getFilledArrayBuffer(BLOCK_SIZE, FILL_VALUE);
}

function createHeaderBlock(volumeInfo) {
  const blockOccupancyBitmapArrayBuffer = SegaSaturnSarooUtil.createBlockOccupancyBitmap(volumeInfo.usedBlocks, BITMAP_LENGTH);

  let headerBlock = createEmptyBlock();
  headerBlock = Util.setMagic(headerBlock, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);
  headerBlock = Util.setArrayBufferPortion(headerBlock, blockOccupancyBitmapArrayBuffer, BITMAP_OFFSET, 0, BITMAP_LENGTH);

  const headerBlockDataView = new DataView(headerBlock);

  headerBlockDataView.setUint32(TOTAL_SIZE_OFFSET, volumeInfo.totalSize, LITTLE_ENDIAN);
  headerBlockDataView.setUint16(FREE_BLOCKS_OFFSET, volumeInfo.numFreeBlocks, LITTLE_ENDIAN);

  return headerBlock;
}

function createDirectoryEntry(saveFile, startingBlockNum) {
  let directoryEntry = Util.getFilledArrayBuffer(DIRECTORY_ENTRY_LENGTH, FILL_VALUE);
  directoryEntry = Util.setString(directoryEntry, DIRECTORY_ENTRY_NAME_OFFSET, saveFile.name, SegaSaturnSaveData.ARCHIVE_ENTRY_NAME_ENCODING, SegaSaturnSaveData.ARCHIVE_ENTRY_NAME_LENGTH);

  const directoryEntryDataView = new DataView(directoryEntry);

  directoryEntryDataView.setUint16(DIRECTORY_ENTRY_STARTING_BLOCK, startingBlockNum, LITTLE_ENDIAN);

  return directoryEntry;
}

function createDirectory(gameSaveFilesWithBlockList) {
  let currentBlockNum = NUM_RESERVED_BLOCKS;

  const directoryEntries = gameSaveFilesWithBlockList.map((saveFileWithBlockList) => {
    const saveFileStartingBlockNum = currentBlockNum;

    currentBlockNum += saveFileWithBlockList.blockList.length;

    return createDirectoryEntry(saveFileWithBlockList, saveFileStartingBlockNum);
  });

  const remainingDirectorySize = (TOTAL_DIRECTORY_ENTRIES - directoryEntries.length) * DIRECTORY_ENTRY_LENGTH;

  if (remainingDirectorySize > 0) {
    const remainingDirectoryArrayBuffer = Util.getFilledArrayBuffer(remainingDirectorySize, FILL_VALUE);

    return Util.concatArrayBuffers([...directoryEntries, remainingDirectoryArrayBuffer]);
  }

  return Util.concatArrayBuffers(directoryEntries);
}

function createBlockListForSaveFile(saveFile, startingBlockNum) {
  // First create the archive entry block

  let archiveEntry = createEmptyBlock();
  archiveEntry = Util.setString(archiveEntry, ARCHIVE_ENTRY_NAME_OFFSET, saveFile.name, SegaSaturnSaveData.ARCHIVE_ENTRY_NAME_ENCODING, SegaSaturnSaveData.ARCHIVE_ENTRY_NAME_LENGTH);
  archiveEntry = Util.setString(archiveEntry, ARCHIVE_ENTRY_COMMENT_OFFSET, saveFile.comment, SegaSaturnSaveData.ARCHIVE_ENTRY_COMMENT_ENCODING, SegaSaturnSaveData.ARCHIVE_ENTRY_COMMENT_LENGTH);

  const archiveEntryDataView = new DataView(archiveEntry);

  archiveEntryDataView.setUint32(ARCHIVE_ENTRY_SIZE_OFFSET, saveFile.rawData.byteLength, LITTLE_ENDIAN);
  archiveEntryDataView.setUint8(ARCHIVE_ENTRY_LANGUAGE_OFFSET, saveFile.languageCode);
  archiveEntryDataView.setUint32(ARCHIVE_ENTRY_DATE_OFFSET, saveFile.dateCode, LITTLE_ENDIAN);

  const blockList = [];

  // If the save data can fit within the archive block then it's found there
  // Otherwise, the rest of the archive block is a list of blocks which contain the save data

  if (saveFile.rawData.byteLength <= ARCHIVE_ENTRY_BLOCK_LIST_AVAILABLE_SIZE) {
    archiveEntry = Util.setArrayBufferPortion(archiveEntry, saveFile.rawData, ARCHIVE_ENTRY_BLOCK_LIST_OFFSET, 0, saveFile.rawData.byteLength);
    blockList.push(archiveEntry);
  } else {
    // If the file is too big to fit into the archive block then we need to fill in the block list,
    // and divide the file into blocks

    // Fill in the block list

    const numBlocks = Math.ceil(saveFile.rawData.byteLength / BLOCK_SIZE);

    if (numBlocks > ARCHIVE_ENTRY_MAX_NUM_BLOCKS) {
      throw new Error(`Not enough space to store file ${saveFile.name} - ${saveFile.comment}: requires ${numBlocks} but the maximum is ${ARCHIVE_ENTRY_MAX_NUM_BLOCKS}`);
    }

    for (let i = 0; i < numBlocks; i += 1) {
      const blockListEntryOffset = ARCHIVE_ENTRY_BLOCK_LIST_OFFSET + (ARCHIVE_ENTRY_BLOCK_LIST_ENTRY_SIZE * i);
      archiveEntryDataView.setUint16(blockListEntryOffset, startingBlockNum + 1 + i, LITTLE_ENDIAN); // +1 because of the archive entry block. We're cheating a bit here because we know we will lay everything our sequentially
    }

    const blockListEndOffset = ARCHIVE_ENTRY_BLOCK_LIST_OFFSET + (ARCHIVE_ENTRY_BLOCK_LIST_ENTRY_SIZE * numBlocks);
    archiveEntryDataView.setUint16(blockListEndOffset, ARCHIVE_ENTRY_BLOCK_LIST_END, LITTLE_ENDIAN);

    blockList.push(archiveEntry);

    // Now divide the data into blocks. We need to pad the data in the last block to be exactly a block size

    let rawDataPadded = saveFile.rawData;

    if ((saveFile.rawData % BLOCK_SIZE) !== 0) {
      const paddingBytes = BLOCK_SIZE - (saveFile.rawData.byteLength % BLOCK_SIZE);
      rawDataPadded = Util.concatArrayBuffers([rawDataPadded, Util.getFilledArrayBuffer(paddingBytes, FILL_VALUE)]);
    }

    for (let i = 0; i < numBlocks; i += 1) {
      const blockStartingOffset = i * BLOCK_SIZE;
      blockList.push(rawDataPadded.slice(blockStartingOffset, blockStartingOffset + BLOCK_SIZE));
    }
  }

  return {
    ...saveFile,
    blockList,
  };
}

function getBlock(arrayBuffer, blockNumber) {
  return arrayBuffer.slice(blockNumber * BLOCK_SIZE, (blockNumber + 1) * BLOCK_SIZE);
}

function getDirectoryArrayBuffer(arrayBuffer) {
  return arrayBuffer.slice(DIRECTORY_OFFSET, DIRECTORY_OFFSET + (DIRECTORY_NUM_BLOCKS * BLOCK_SIZE));
}

function getOccupiedDirectoryEntryIndexes(arrayBuffer) {
  const directoryArrayBuffer = getDirectoryArrayBuffer(arrayBuffer);
  const directoryUint8Array = new Uint8Array(directoryArrayBuffer);
  const allDirectoryEntryIndexes = ArrayUtil.createSequentialArray(0, TOTAL_DIRECTORY_ENTRIES);

  return allDirectoryEntryIndexes.filter((index) => (directoryUint8Array[index * DIRECTORY_ENTRY_LENGTH] !== 0)); // Test if first character of name is non-zero. Same as https://github.com/tpunix/SAROO/blob/master/tools/savetool/sr_mems.c#L308
}

function getSaveFile(arrayBuffer, directoryEntryIndex) {
  // First read the directory entry to get the name and block number of the archive entry block

  const directoryArrayBuffer = getDirectoryArrayBuffer(arrayBuffer);
  const directoryDataView = new DataView(directoryArrayBuffer);
  const directoryUint8Array = new Uint8Array(directoryArrayBuffer);

  const directoryEntryOffset = directoryEntryIndex * DIRECTORY_ENTRY_LENGTH;
  const directoryName = Util.readNullTerminatedString(
    directoryUint8Array,
    directoryEntryOffset + DIRECTORY_ENTRY_NAME_OFFSET,
    SegaSaturnSaveData.ARCHIVE_ENTRY_NAME_ENCODING,
    SegaSaturnSaveData.ARCHIVE_ENTRY_NAME_LENGTH,
  );
  const startingBlockNum = directoryDataView.getUint16(directoryEntryOffset + DIRECTORY_ENTRY_STARTING_BLOCK);

  // Now read the archive entry block to get all of the save file metadata

  const archiveEntryBlock = getBlock(arrayBuffer, startingBlockNum);
  const archiveEntryBlockDataView = new DataView(archiveEntryBlock);
  const archiveEntryBlockUint8Array = new Uint8Array(archiveEntryBlock);

  const name = Util.readNullTerminatedString(
    archiveEntryBlockUint8Array,
    ARCHIVE_ENTRY_NAME_OFFSET,
    SegaSaturnSaveData.ARCHIVE_ENTRY_NAME_ENCODING,
    SegaSaturnSaveData.ARCHIVE_ENTRY_NAME_LENGTH,
  );
  const comment = Util.readNullTerminatedString(
    archiveEntryBlockUint8Array,
    ARCHIVE_ENTRY_COMMENT_OFFSET,
    SegaSaturnSaveData.ARCHIVE_ENTRY_COMMENT_ENCODING,
    SegaSaturnSaveData.ARCHIVE_ENTRY_COMMENT_LENGTH,
  );
  const saveSize = archiveEntryBlockDataView.getUint32(ARCHIVE_ENTRY_SIZE_OFFSET, LITTLE_ENDIAN);
  const languageCode = archiveEntryBlockDataView.getUint8(ARCHIVE_ENTRY_LANGUAGE_OFFSET);
  const dateCode = archiveEntryBlockDataView.getUint32(ARCHIVE_ENTRY_DATE_OFFSET, LITTLE_ENDIAN);

  if (name !== directoryName) {
    throw new Error(`File appears to be corrupt: found directory entry with name ${directoryName} but the corresponding archive entry has name ${name}`);
  }

  const rawDataBlockList = [];
  let rawData = null;

  // Lastly we can get the actual save data
  // If the save data can fit within the archive block then it's found there
  // Otherwise, the rest of the archive block is a list of blocks which contain the save data

  if (saveSize <= ARCHIVE_ENTRY_BLOCK_LIST_AVAILABLE_SIZE) {
    rawData = archiveEntryBlock.slice(ARCHIVE_ENTRY_BLOCK_LIST_OFFSET, ARCHIVE_ENTRY_BLOCK_LIST_OFFSET + saveSize);
  } else {
    let blockListCurrentOffset = ARCHIVE_ENTRY_BLOCK_LIST_OFFSET;
    let blockListEntry = archiveEntryBlockDataView.getUint16(blockListCurrentOffset);

    while (blockListEntry !== ARCHIVE_ENTRY_BLOCK_LIST_END) {
      rawDataBlockList.push(blockListEntry);
      blockListCurrentOffset += ARCHIVE_ENTRY_BLOCK_LIST_ENTRY_SIZE;
      blockListEntry = archiveEntryBlockDataView.getUint16(blockListCurrentOffset);
    }

    const rawDataBlocks = rawDataBlockList.map((blockNum) => getBlock(arrayBuffer, blockNum));

    rawData = Util.concatArrayBuffers(rawDataBlocks).slice(0, saveSize);
  }

  return {
    name,
    languageCode,
    language: SegaSaturnUtil.getLanguageString(languageCode),
    comment,
    dateCode,
    date: SegaSaturnUtil.getDate(dateCode),
    blockList: rawDataBlockList,
    saveSize,
    rawData,
  };
}

export default class SarooSegaSaturnCartSaveData {
  static createWithNewSize(/* segaSaturnSaveData, newSize */) {
    /*
    const newRawSaveData = SegaSaturnUtil.resize(segaSaturnSaveData.getArrayBuffer(), newSize);

    return SarooSegaSaturnCartSaveData.createFromSegaSaturnData(newRawSaveData);
    */
  }

  static upsertGameSaveFiles(existingGameSaveFiles, newGameSaveFiles) {
    const existingCopy = Util.deepCopyArray(existingGameSaveFiles);

    // Merge in the new game save files into the existing game save files
    // Uses an 'upsert' style operation where missing records are inserted, and existing records are updated

    newGameSaveFiles.forEach((newSaveFile) => {
      const existingSaveFileIndex = existingCopy.findIndex((existing) => existing.name === newSaveFile.name);

      if (existingSaveFileIndex < 0) {
        // If this save file does not exist for this game, then add it
        existingCopy.push(newSaveFile);
      } else {
        // If this save file does exist for this game, then update it
        existingCopy[existingSaveFileIndex] = newSaveFile;
      }
    });

    return existingCopy;
  }

  static isCartSarooData(arrayBuffer) {
    try {
      SarooSegaSaturnCartSaveData.createFromSarooData(arrayBuffer);
      return true;
    } catch (e) {
      return false;
    }
  }

  static createFromSarooData(arrayBuffer) {
    const dataView = new DataView(arrayBuffer);

    Util.checkMagic(arrayBuffer, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);

    const totalSize = dataView.getUint32(TOTAL_SIZE_OFFSET, LITTLE_ENDIAN);
    const numFreeBlocks = dataView.getUint16(FREE_BLOCKS_OFFSET, LITTLE_ENDIAN);
    const bitmap = arrayBuffer.slice(BITMAP_OFFSET, BITMAP_OFFSET + BITMAP_LENGTH);

    const { usedBlocks } = SegaSaturnSarooUtil.getBlockOccupancy(bitmap, totalSize, BLOCK_SIZE);

    const occupiedDirectoryEntryIndexes = getOccupiedDirectoryEntryIndexes(arrayBuffer);
    const saveFiles = occupiedDirectoryEntryIndexes.map((index) => getSaveFile(arrayBuffer, index));

    const volumeInfo = {
      totalSize,
      numFreeBlocks,
      numUsedBlocks: usedBlocks.length,
      usedBlocks,
    };

    return new SarooSegaSaturnCartSaveData(arrayBuffer, saveFiles, volumeInfo);
  }

  static createFromSaveFiles(gameSaveFiles) {
    if (gameSaveFiles.length > TOTAL_DIRECTORY_ENTRIES) {
      throw new Error(`Not enough space to hold all saves. Requires ${gameSaveFiles.length} saves, but directory only has room for ${TOTAL_DIRECTORY_ENTRIES} saves`);
    }

    // First figure out how many blocks each save file requires

    let startingBlockNum = NUM_RESERVED_BLOCKS;

    const gameSaveFilesWithBlockList = gameSaveFiles.map((saveFile) => {
      const saveFileWithBlockList = createBlockListForSaveFile(saveFile, startingBlockNum);
      startingBlockNum += saveFileWithBlockList.blockList.length;
      return saveFileWithBlockList;
    });
    const gameBlocksList = gameSaveFilesWithBlockList.map((saveFileWithBlocks) => saveFileWithBlocks.blockList);
    const gameBlocks = Util.concatArrayBuffers(gameBlocksList.flat());

    // Now that we know how many blocks each save takes we can calculate the volume info and directory blocks

    const directoryBlocks = createDirectory(gameSaveFilesWithBlockList);

    const numUsedBlocks = NUM_RESERVED_BLOCKS + gameBlocksList.flat().length;
    const usedBlocks = ArrayUtil.createSequentialArray(0, numUsedBlocks); // Cheating, because we know we're going to lay everything out sequentially

    if (numUsedBlocks > AVAILABLE_BLOCKS) {
      throw new Error(`Not enough space to hold all saves. Requires ${numUsedBlocks} but we only have ${AVAILABLE_BLOCKS} of space`);
    }

    const volumeInfo = {
      totalSize: TOTAL_BLOCKS * BLOCK_SIZE,
      numFreeBlocks: AVAILABLE_BLOCKS - numUsedBlocks,
      numUsedBlocks,
      usedBlocks,
    };

    // With the volume info we can make the header block and the number of empty blocks we need to pad out the file

    const headerBlock = createHeaderBlock(volumeInfo);
    const emptyBlocks = Util.getFilledArrayBuffer((TOTAL_BLOCKS - numUsedBlocks) * BLOCK_SIZE, FILL_VALUE); // Note that we already checked that numUsedBlocks is <= AVAILABLE_BLOCKS, which is < TOTAL_BLOCKS. So we'll always have some number of bytes here

    // Concat all the portions to create the final file

    const arrayBuffer = Util.concatArrayBuffers([headerBlock, directoryBlocks, gameBlocks, emptyBlocks]);

    return new SarooSegaSaturnCartSaveData(arrayBuffer, gameSaveFiles, volumeInfo);
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
