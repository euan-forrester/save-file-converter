/* eslint-disable no-bitwise */

/*
The format for a memory card image

Taken from https://mc.pp.se/dc/vms/flashmem.html

Blocks 0-199:   User save area
Blocks 200-240: Not used
Blocks 241-253: Directory
Block  254:     File allocation table
Block  255:     System information
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
  SYSTEM_INFO_BLOCK_NUMBER,
  SYSTEM_INFO_SIZE_IN_BLOCKS,
} = DreamcastBasics;

const FILL_VALUE = 0x00;

function getBlocks(arrayBuffer, blockNumber, sizeInBlocks) {
  // The starting block as specified in the SystemInfo block is the one closest to the end of the file.
  // We fill each block starting at the end of the block closest to the beginning of the file.
  // So to make a contiguous blob of data here we need to concat our blocks starting from the end of the file

  const startingBlockNumber = blockNumber - sizeInBlocks + 1;
  const blockNumbers = ArrayUtil.createSequentialArray(startingBlockNumber, sizeInBlocks).reverse();
  const blocks = blockNumbers.map((i) => arrayBuffer.slice(i * BLOCK_SIZE, (i + 1) * BLOCK_SIZE));

  return Util.concatArrayBuffers(blocks);
}

export default class DreamcastSaveData {
  static createFromDreamcastData(arrayBuffer) {
    if (arrayBuffer.byteLength < TOTAL_SIZE) {
      throw new Error('This does not appear to be a Dreamcast VMU image');
    }

    const volumeInfo = DreamcastSystemInfo.readSystemInfo(getBlocks(arrayBuffer, SYSTEM_INFO_BLOCK_NUMBER, SYSTEM_INFO_SIZE_IN_BLOCKS));
    const nextBlockInFile = DreamcastFileAllocationTable.readFileAllocationTable(getBlocks(arrayBuffer, volumeInfo.fileAllocationTable.blockNumber, volumeInfo.fileAllocationTable.sizeInBlocks));
    const directoryEntries = DreamcastDirectory.readDirectory(getBlocks(arrayBuffer, volumeInfo.directory.blockNumber, volumeInfo.directory.sizeInBlocks));

    const saveFiles = directoryEntries;

    console.log('Next block in file 0:', nextBlockInFile[0]);

    return new DreamcastSaveData(arrayBuffer, saveFiles, volumeInfo);
  }

  static createFromSaveFiles(saveFiles, volumeInfo) {
    const memcardArrayBuffer = Util.getFilledArrayBuffer(TOTAL_SIZE, FILL_VALUE);

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
