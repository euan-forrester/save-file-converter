/* eslint-disable no-bitwise */

/*
Dreamcast file allocation table block

Format taken from https://mc.pp.se/dc/vms/flashmem.html

Each 16 bit value indicates the block number of the next block in the file.
*/

import Util from '../../../util/util';
import ArrayUtil from '../../../util/Array';

import DreamcastBasics from './Basics';

const {
  LITTLE_ENDIAN,
  BLOCK_SIZE,
  SAVE_AREA_BLOCK_NUMBER,
  SAVE_AREA_SIZE_IN_BLOCKS,
  SYSTEM_INFO_BLOCK_NUMBER,
  FILE_ALLOCATION_TABLE_BLOCK_NUMBER,
  DIRECTORY_BLOCK_NUMBER,
  DIRECTORY_SIZE_IN_BLOCKS,
} = DreamcastBasics;

const LAST_SAVE_AREA_BLOCK_NUMBER = SAVE_AREA_SIZE_IN_BLOCKS - SAVE_AREA_BLOCK_NUMBER - 1;

const UNALLOCATED_BLOCK = 0xFFFC;
const LAST_BLOCK_IN_FILE = 0xFFFA;

const PADDING_VALUE = 0x00;

export default class DreamcastFileAllocationTable {
  static UNALLOCATED_BLOCK = UNALLOCATED_BLOCK;

  static LAST_BLOCK_IN_FILE = LAST_BLOCK_IN_FILE;

  static writeFileAllocationTable(saveFilesWithBlockInfo) {
    const arrayBuffer = Util.getFilledArrayBuffer(BLOCK_SIZE, PADDING_VALUE); // The portion of the table that corresponds to the padding between the save area and the directory is filled with 0x00 rather than UNALLOCATED_BLOCK
    const dataView = new DataView(arrayBuffer);

    dataView.setUint16(SYSTEM_INFO_BLOCK_NUMBER * 2, LAST_BLOCK_IN_FILE, LITTLE_ENDIAN);
    dataView.setUint16(FILE_ALLOCATION_TABLE_BLOCK_NUMBER * 2, LAST_BLOCK_IN_FILE, LITTLE_ENDIAN);
    dataView.setUint16((DIRECTORY_BLOCK_NUMBER - DIRECTORY_SIZE_IN_BLOCKS + 1) * 2, LAST_BLOCK_IN_FILE, LITTLE_ENDIAN);

    ArrayUtil.createReverseSequentialArray(DIRECTORY_BLOCK_NUMBER, DIRECTORY_SIZE_IN_BLOCKS - 1).map((i) => dataView.setUint16(i * 2, i - 1, LITTLE_ENDIAN));

    let lastUnusedBlockNumber = SAVE_AREA_SIZE_IN_BLOCKS - SAVE_AREA_BLOCK_NUMBER - 1;

    saveFilesWithBlockInfo.forEach((saveFile) => {
      ArrayUtil.createReverseSequentialArray(saveFile.firstBlockNumber, saveFile.fileSizeInBlocks - 1).map((i) => dataView.setUint16(i * 2, i - 1, LITTLE_ENDIAN));
      dataView.setUint16((saveFile.firstBlockNumber - saveFile.fileSizeInBlocks + 1) * 2, LAST_BLOCK_IN_FILE, LITTLE_ENDIAN);

      lastUnusedBlockNumber = saveFile.firstBlockNumber - saveFile.fileSizeInBlocks;
    });

    ArrayUtil.createSequentialArray(SAVE_AREA_BLOCK_NUMBER, lastUnusedBlockNumber - SAVE_AREA_BLOCK_NUMBER + 1).map((i) => dataView.setUint16(i * 2, UNALLOCATED_BLOCK, LITTLE_ENDIAN));

    return arrayBuffer;
  }

  static readFileAllocationTable(arrayBuffer) {
    const dataView = new DataView(arrayBuffer);

    const nextBlockInFile = new Array(SAVE_AREA_SIZE_IN_BLOCKS);

    for (let i = 0; i < SAVE_AREA_SIZE_IN_BLOCKS; i += 1) {
      const offset = i * 2;
      nextBlockInFile[i] = dataView.getUint16(offset, LITTLE_ENDIAN);

      if ((nextBlockInFile[i] > LAST_SAVE_AREA_BLOCK_NUMBER) && (nextBlockInFile[i] !== UNALLOCATED_BLOCK) && (nextBlockInFile[i] !== LAST_BLOCK_IN_FILE)) {
        throw new Error(`Found invalid value 0x${nextBlockInFile[i].toString(16)} in file allocation table at offset ${offset}`);
      }
    }

    return nextBlockInFile;
  }
}
