/* eslint-disable no-bitwise */

/*
This is the SS_MEMS.BIN file created by the Saroo, which the official save converter describes as "SAROO extend save": https://github.com/tpunix/SAROO/blob/master/tools/savetool/main.c#L131

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
0x40 - ????: Block list (terminated with ARCHIVE_ENTRY_BLOCK_LIST_END)
*/

import Util from '../../../util/util';
import ArrayUtil from '../../../util/Array';

import SegaSaturnSaveData from '../SegaSaturn';
import SegaSaturnUtil from '../Util';

import SegaSaturnSarooUtil from './Util';

const LITTLE_ENDIAN = false;

const BLOCK_SIZE = 1024;

const MAGIC = 'SaroMems';
const MAGIC_OFFSET = 0;
const MAGIC_ENCODING = 'US-ASCII';

const TOTAL_SIZE_OFFSET = 0x08;
const FREE_BLOCKS_OFFSET = 0x0C;
const BITMAP_OFFSET = 0x10;
const BITMAP_LENGTH = BLOCK_SIZE - BITMAP_OFFSET; // Note that the bitmap is "missing" the first 16 bytes, which are used by the header. 16 bytes * 8 = 128 blocks not included in the bitmap. Hence the file has 8064 blocks instead of 8192

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
const ARCHIVE_ENTRY_BLOCK_LIST_END = 0x0000;

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

  console.log(`Found save: ${directoryName} with starting block ${startingBlockNum}`);

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
  let blockListCurrentOffset = ARCHIVE_ENTRY_BLOCK_LIST_OFFSET;
  let blockListEntry = archiveEntryBlockDataView.getUint16(blockListCurrentOffset);

  while (blockListEntry !== ARCHIVE_ENTRY_BLOCK_LIST_END) {
    rawDataBlockList.push(blockListEntry);
    blockListCurrentOffset += 2;
    blockListEntry = archiveEntryBlockDataView.getUint16(blockListCurrentOffset);
  }

  const rawDataBlocks = rawDataBlockList.map((blockNum) => getBlock(arrayBuffer, blockNum));
  const rawData = Util.concatArrayBuffers(rawDataBlocks).slice(0, saveSize);

  console.log(`Found save: languageCode: ${SegaSaturnUtil.getLanguageString(languageCode)}, comment: ${comment}, date: ${SegaSaturnUtil.getDate(dateCode).toUTCString()}, size: ${saveSize}`);

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

export default class SarooSegaSaturnExtendSaveData {
  static createWithNewSize(/* segaSaturnSaveData, newSize */) {
    /*
    const newRawSaveData = SegaSaturnUtil.resize(segaSaturnSaveData.getArrayBuffer(), newSize);

    return SarooSegaSaturnExtendSaveData.createFromSegaSaturnData(newRawSaveData);
    */
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

    return new SarooSegaSaturnExtendSaveData(arrayBuffer, saveFiles, volumeInfo);
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

    // return new SarooSegaSaturnExtendSaveData(segaSaturnArrayBuffer, saveFiles);
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
