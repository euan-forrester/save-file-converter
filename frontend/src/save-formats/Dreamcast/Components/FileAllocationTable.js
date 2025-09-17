/* eslint-disable no-bitwise */

/*
Dreamcast file allocation table block

Format taken from https://mc.pp.se/dc/vms/flashmem.html

Each 16 bit value indicates the block number of the next block in the file.
*/

import Util from '../../../util/util';

import DreamcastBasics from './Basics';

const {
  LITTLE_ENDIAN,
  BLOCK_SIZE,
  SAVE_AREA_SIZE_IN_BLOCKS,
} = DreamcastBasics;

const UNALLOCATED_BLOCK = 0xFFFC;
const LAST_BLOCK_IN_FILE = 0xFFFA;

const PADDING_VALUE = 0x00;

export default class DreamcastFileAllocationTable {
  static UNALLOCATED_BLOCK = UNALLOCATED_BLOCK;

  static LAST_BLOCK_IN_FILE = LAST_BLOCK_IN_FILE;

  static writeFileAllocationTable() {
    const arrayBuffer = Util.getFilledArrayBuffer(BLOCK_SIZE, PADDING_VALUE);

    return arrayBuffer;
  }

  static readFileAllocationTable(arrayBuffer) {
    const dataView = new DataView(arrayBuffer);

    const nextBlockInFile = new Array(SAVE_AREA_SIZE_IN_BLOCKS);

    for (let i = 0; i < SAVE_AREA_SIZE_IN_BLOCKS; i += 1) {
      const offset = i * 2;
      nextBlockInFile[i] = dataView.getUint16(offset, LITTLE_ENDIAN);

      if ((nextBlockInFile[i] >= SAVE_AREA_SIZE_IN_BLOCKS) && (nextBlockInFile[i] !== UNALLOCATED_BLOCK) && (nextBlockInFile[i] !== LAST_BLOCK_IN_FILE)) {
        throw new Error(`Found invalid value 0x${nextBlockInFile[i].toString(16)} in file allocation table at offset ${offset}`);
      }
    }

    return nextBlockInFile;
  }
}
