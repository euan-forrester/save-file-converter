/* eslint-disable no-bitwise */

/*
The format for a memory card image

Taken from https://mc.pp.se/dc/vms/flashmem.html

Official documentation here: https://segaxtreme.net/resources/maple-bus-1-0-function-type-specifications-ft1-storage-function.195/

Blocks 0-199:   User save area
Blocks 200-240: Not used
Blocks 241-253: Directory
Block  254:     File allocation table
Block  255:     System information

Note that the file is written back-to-front: we first write the blocks nearest the end of the file.
But within each block we write it from the end of the block closest to the start of the file.
This applies to all sections, but most notably to the Directory and User save area sections.
*/

import Util from '../../util/util';
import ArrayUtil from '../../util/Array';

import DreamcastBasics from './Components/Basics';
import DreamcastSystemInfo from './Components/SystemInfo';
import DreamcastFileAllocationTable from './Components/FileAllocationTable';
import DreamcastDirectory from './Components/Directory';

const {
  BLOCK_SIZE,
  TOTAL_SIZE,
  MAX_DIRECTORY_ENTRIES,
  SAVE_AREA_BLOCK_NUMBER,
  SAVE_AREA_SIZE_IN_BLOCKS,
  DIRECTORY_BLOCK_NUMBER,
  DIRECTORY_SIZE_IN_BLOCKS,
  SYSTEM_INFO_BLOCK_NUMBER,
  SYSTEM_INFO_SIZE_IN_BLOCKS,
} = DreamcastBasics;

const FILL_VALUE = 0x00;

function concatBlocks(blockNumbers, arrayBuffer) {
  const blocks = blockNumbers.map((i) => arrayBuffer.slice(i * BLOCK_SIZE, (i + 1) * BLOCK_SIZE));

  return Util.concatArrayBuffers(blocks);
}

function getBlocks(blockNumber, sizeInBlocks, arrayBuffer) {
  // The starting block is the one closest to the end of the file.
  // However, we fill each block starting at the end of the block closest to the beginning of the file.
  // So to make a contiguous blob of data here we need to concat our blocks starting from the end of the file

  const startingBlockNumber = blockNumber - sizeInBlocks + 1;
  const blockNumbers = ArrayUtil.createSequentialArray(startingBlockNumber, sizeInBlocks).reverse();

  return concatBlocks(blockNumbers, arrayBuffer);
}

function createBlocks(arrayBuffer) {
  // Similar to getBlocks() we will split our array buffer into blocks and then reverse them

  const numBlocks = Math.ceil(arrayBuffer.byteLength / BLOCK_SIZE);
  const blocks = ArrayUtil.createSequentialArray(0, numBlocks).map((i) => arrayBuffer.slice(i * BLOCK_SIZE, (i + 1) * BLOCK_SIZE));

  if (blocks[blocks.length - 1].byteLength < BLOCK_SIZE) {
    const paddingLength = BLOCK_SIZE - blocks[blocks.length - 1].byteLength;

    blocks[blocks.length - 1] = Util.concatArrayBuffers([blocks[blocks.length - 1], Util.getFilledArrayBuffer(paddingLength, FILL_VALUE)]);
  }

  return blocks.reverse();
}

function getBlockNumbers(directoryEntry, fileAllocationTable) {
  const blockNumbers = [];
  let currentBlockNumber = directoryEntry.firstBlockNumber;

  do {
    if (fileAllocationTable[currentBlockNumber] === DreamcastFileAllocationTable.UNALLOCATED_BLOCK) {
      throw new Error('Save file appears to be corrupted: save file appears to contain a block that is unallocated');
    }

    blockNumbers.push(currentBlockNumber);
    currentBlockNumber = fileAllocationTable[currentBlockNumber];
  } while (currentBlockNumber !== DreamcastFileAllocationTable.LAST_BLOCK_IN_FILE);

  if (blockNumbers.length !== directoryEntry.fileSizeInBlocks) {
    throw new Error(`Save file appears to be corrupted: expected to find ${directoryEntry.fileSizeInBlocks} blocks for file `
      + `${directoryEntry.filename} but instead found ${blockNumbers.length} blocks when traversing file allocation table`);
  }

  return blockNumbers;
}

function getSaveFilesWithBlockInfo(saveFiles) {
  let currentBlockNumber = SAVE_AREA_SIZE_IN_BLOCKS + SAVE_AREA_BLOCK_NUMBER - 1; // Start at the end of the save area and work towards the beginning of the file

  return saveFiles.map((saveFile) => {
    const fileSizeInBlocks = Math.ceil(saveFile.rawData.byteLength / BLOCK_SIZE);

    const saveFileWithBlockInfo = {
      ...saveFile,
      firstBlockNumber: currentBlockNumber,
      fileSizeInBlocks,
    };

    currentBlockNumber -= fileSizeInBlocks;

    return saveFileWithBlockInfo;
  });
}

export default class DreamcastSaveData {
  static createFromDreamcastData(arrayBuffer) {
    if (arrayBuffer.byteLength < TOTAL_SIZE) {
      throw new Error('This does not appear to be a Dreamcast VMU image');
    }

    const volumeInfo = DreamcastSystemInfo.readSystemInfo(getBlocks(SYSTEM_INFO_BLOCK_NUMBER, SYSTEM_INFO_SIZE_IN_BLOCKS, arrayBuffer));
    const fileAllocationTable = DreamcastFileAllocationTable.readFileAllocationTable(getBlocks(volumeInfo.fileAllocationTable.blockNumber, volumeInfo.fileAllocationTable.sizeInBlocks, arrayBuffer));
    const directoryEntries = DreamcastDirectory.readDirectory(getBlocks(volumeInfo.directory.blockNumber, volumeInfo.directory.sizeInBlocks, arrayBuffer));

    const saveFiles = directoryEntries.map((directoryEntry) => {
      const blockNumberList = getBlockNumbers(directoryEntry, fileAllocationTable);

      return {
        ...directoryEntry,
        blockNumberList,
        rawData: concatBlocks(blockNumberList, arrayBuffer),
      };
    });

    return new DreamcastSaveData(arrayBuffer, saveFiles, volumeInfo);
  }

  static createFromSaveFiles(saveFiles, volumeInfo) {
    if (saveFiles.length > MAX_DIRECTORY_ENTRIES) {
      throw new Error(`Unable to fit ${saveFiles.length} saves into a single VMU image. Max is ${MAX_DIRECTORY_ENTRIES}`);
    }

    const saveFilesWithBlockInfo = getSaveFilesWithBlockInfo(saveFiles);

    const totalBlocks = saveFilesWithBlockInfo.reduce(((accumulator, x) => accumulator + x.fileSizeInBlocks), 0);
    if (totalBlocks > SAVE_AREA_SIZE_IN_BLOCKS) {
      throw new Error(`Save files contain a total of ${totalBlocks} blocks of data but a VMU image can only hold ${SAVE_AREA_SIZE_IN_BLOCKS} blocks`);
    }

    const systemInfo = DreamcastSystemInfo.writeSystemInfo(volumeInfo);
    const fileAllocationTable = DreamcastFileAllocationTable.writeFileAllocationTable(saveFilesWithBlockInfo);
    const directory = DreamcastDirectory.writeDirectory(saveFilesWithBlockInfo);

    // Blocks 0 - 199 are for the save area, but the directory begins on block 241 leaving 41 blocks unused in between
    const numPaddingBlocks = DIRECTORY_BLOCK_NUMBER - DIRECTORY_SIZE_IN_BLOCKS - SAVE_AREA_SIZE_IN_BLOCKS - SAVE_AREA_BLOCK_NUMBER + 1;

    const systemInfoBlocks = createBlocks(systemInfo);
    const fileAllocationTableBlocks = createBlocks(fileAllocationTable);
    const directoryBlocks = createBlocks(directory);
    const paddingBlocks = Util.getFilledArrayBuffer(numPaddingBlocks * BLOCK_SIZE, FILL_VALUE);
    const saveFileBlocks = saveFiles.map((saveFile) => createBlocks(saveFile.rawData)).reverse().flat(); // We write our save files from the back of the file to the front

    const blocksUsed = systemInfoBlocks.length + fileAllocationTableBlocks.length + directoryBlocks.length + numPaddingBlocks + saveFileBlocks.length;
    const fileStartPaddingArrayBuffer = Util.getFilledArrayBuffer(TOTAL_SIZE - (BLOCK_SIZE * blocksUsed), FILL_VALUE);

    const memcardArrayBuffer = Util.concatArrayBuffers([fileStartPaddingArrayBuffer, ...saveFileBlocks, paddingBlocks, ...directoryBlocks, ...fileAllocationTableBlocks, ...systemInfoBlocks]);

    return new DreamcastSaveData(memcardArrayBuffer, saveFiles, volumeInfo);
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
