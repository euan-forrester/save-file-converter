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

import DreamcastBasics from './Components/Basics';
import DreamcastSystemInfo from './Components/SystemInfo';
import DreamcastFileAllocationTable from './Components/FileAllocationTable';

const {
  BLOCK_SIZE,
  TOTAL_SIZE,
  SYSTEM_INFO_BLOCK_NUMBER,
  SYSTEM_INFO_SIZE_IN_BLOCKS,
} = DreamcastBasics;

const FILL_VALUE = 0x00;

function getBlocks(arrayBuffer, blockNumber, sizeInBlocks) {
  const startOffset = blockNumber * BLOCK_SIZE;
  return arrayBuffer.slice(startOffset, startOffset + (BLOCK_SIZE * sizeInBlocks));
}

export default class DreamcastSaveData {
  static createFromDreamcastData(arrayBuffer) {
    if (arrayBuffer.byteLength < TOTAL_SIZE) {
      throw new Error('This does not appear to be a Dreamcast VMU image');
    }

    const volumeInfo = DreamcastSystemInfo.readSystemInfo(getBlocks(arrayBuffer, SYSTEM_INFO_BLOCK_NUMBER, SYSTEM_INFO_SIZE_IN_BLOCKS));
    const nextBlockInFile = DreamcastFileAllocationTable.readFileAllocationTable(getBlocks(arrayBuffer, volumeInfo.fileAllocationTable.blockNumber, volumeInfo.fileAllocationTable.sizeInBlocks));
    // const directoryEntries = DreamcastDirectory.readDirectory(getBlocks(arrayBuffer, volumeInfo.directory.blockNumber, volumeInfo.directoyr.sizeInBlocks));

    const saveFiles = [];

    console.log('Next block in file 0:', nextBlockInFile[0]);
    // console.log('Directory entry 0:', directoryEntries[0]);

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
