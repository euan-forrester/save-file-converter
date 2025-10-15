/* eslint-disable no-bitwise */

/*
Dreamcast file allocation table block

Format taken from https://mc.pp.se/dc/vms/flashmem.html and https://segaxtreme.net/resources/maple-bus-1-0-function-type-specifications-ft1-storage-function.195/

Each 16 bit value indicates the block number of the next block in the file.

Special values:

- 0xFFFC: Block is unallocated
- 0xFFFA: This is the last block in a file
- 0xFFFF: This block is physically damaged
*/

import Util from '../../../util/util';
import ArrayUtil from '../../../util/Array';

import DreamcastBasics from './Basics';

const {
  LITTLE_ENDIAN,
  BLOCK_SIZE,
  DEFAULT_GAME_BLOCK,
  SAVE_AREA_BLOCK_NUMBER,
  SYSTEM_INFO_BLOCK_NUMBER,
  FILE_ALLOCATION_TABLE_BLOCK_NUMBER,
  DIRECTORY_BLOCK_NUMBER,
  DIRECTORY_SIZE_IN_BLOCKS,
} = DreamcastBasics;

const UNALLOCATED_BLOCK = 0xFFFC;
const LAST_BLOCK_IN_FILE = 0xFFFA;
const BLOCK_PHYSICALLY_DAMAGED = 0xFFFF;

const PADDING_VALUE = 0x00;

export default class DreamcastFileAllocationTable {
  static UNALLOCATED_BLOCK = UNALLOCATED_BLOCK;

  static LAST_BLOCK_IN_FILE = LAST_BLOCK_IN_FILE;

  static BLOCK_PHYSICALLY_DAMAGED = BLOCK_PHYSICALLY_DAMAGED;

  static writeFileAllocationTable(gameFilesWithBlockInfo, dataFilesWithBlockInfo) {
    const arrayBuffer = Util.getFilledArrayBuffer(BLOCK_SIZE, PADDING_VALUE); // The portion of the table that corresponds to the padding between the save area and the directory is filled with 0x00 rather than UNALLOCATED_BLOCK
    const dataView = new DataView(arrayBuffer);

    // Write out entries for the various system blocks

    dataView.setUint16(SYSTEM_INFO_BLOCK_NUMBER * 2, LAST_BLOCK_IN_FILE, LITTLE_ENDIAN);
    dataView.setUint16(FILE_ALLOCATION_TABLE_BLOCK_NUMBER * 2, LAST_BLOCK_IN_FILE, LITTLE_ENDIAN);
    dataView.setUint16((DIRECTORY_BLOCK_NUMBER - DIRECTORY_SIZE_IN_BLOCKS + 1) * 2, LAST_BLOCK_IN_FILE, LITTLE_ENDIAN);

    ArrayUtil.createReverseSequentialArray(DIRECTORY_BLOCK_NUMBER, DIRECTORY_SIZE_IN_BLOCKS - 1).forEach((i) => dataView.setUint16(i * 2, i - 1, LITTLE_ENDIAN));

    // Write out entries for games to the beginning of the table

    let lastUnusedGameBlockNumber = DEFAULT_GAME_BLOCK;

    gameFilesWithBlockInfo.forEach((saveFile) => {
      ArrayUtil.createSequentialArray(saveFile.firstBlockNumber, saveFile.fileSizeInBlocks - 1).forEach((i) => dataView.setUint16(i * 2, i + 1, LITTLE_ENDIAN));
      dataView.setUint16((saveFile.firstBlockNumber + saveFile.fileSizeInBlocks - 1) * 2, LAST_BLOCK_IN_FILE, LITTLE_ENDIAN);

      lastUnusedGameBlockNumber = saveFile.firstBlockNumber + saveFile.fileSizeInBlocks;
    });

    // Write out entries for data to the end of the table

    let lastUnusedDataBlockNumber = SAVE_AREA_BLOCK_NUMBER;

    dataFilesWithBlockInfo.forEach((saveFile) => {
      ArrayUtil.createReverseSequentialArray(saveFile.firstBlockNumber, saveFile.fileSizeInBlocks - 1).forEach((i) => dataView.setUint16(i * 2, i - 1, LITTLE_ENDIAN));
      dataView.setUint16((saveFile.firstBlockNumber - saveFile.fileSizeInBlocks + 1) * 2, LAST_BLOCK_IN_FILE, LITTLE_ENDIAN);

      lastUnusedDataBlockNumber = saveFile.firstBlockNumber - saveFile.fileSizeInBlocks;
    });

    const numUnallocatedBlocks = lastUnusedDataBlockNumber - lastUnusedGameBlockNumber + 1;
    ArrayUtil.createReverseSequentialArray(lastUnusedDataBlockNumber, numUnallocatedBlocks).forEach((i) => dataView.setUint16(i * 2, UNALLOCATED_BLOCK, LITTLE_ENDIAN));

    return arrayBuffer;
  }

  static readFileAllocationTable(arrayBuffer) {
    const numEntries = arrayBuffer.byteLength / 2;

    const dataView = new DataView(arrayBuffer);

    const nextBlockInFile = new Array(numEntries);

    for (let i = 0; i < numEntries; i += 1) {
      const offset = i * 2;
      nextBlockInFile[i] = dataView.getUint16(offset, LITTLE_ENDIAN);

      if ((nextBlockInFile[i] >= numEntries)
        && (nextBlockInFile[i] !== UNALLOCATED_BLOCK)
        && (nextBlockInFile[i] !== LAST_BLOCK_IN_FILE)
        && (nextBlockInFile[i] !== BLOCK_PHYSICALLY_DAMAGED)) {
        throw new Error(`Found invalid value 0x${nextBlockInFile[i].toString(16)} in file allocation table at offset ${offset}`);
      }
    }

    return nextBlockInFile;
  }
}
