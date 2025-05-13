/* eslint-disable no-bitwise */

/*
The directory entry format is reused in a few different gamecube file type

Here's the structure as assembled from reading
- https://github.com/dolphin-emu/dolphin/blob/ee27f03a4387baca6371a06068274135ff9547a5/Source/Core/Core/HW/GCMemcard/GCMemcard.h#L350
- https://www.gc-forever.com/yagcd/chap12.html#sec12.4

0x0000-0x0001: Additive checksum
0x0002-0x0003: Inverse checksum
0x0004-0x0005: Update counter (signed (!))
0x0006-0x0007: Number of free blocks
0x0008-0x0009: Last allocated block
0x000A-0x1FFF: Table of allocated blocks
*/

import Util from '../../../util/util';
import ArrayUtil from '../../../util/Array';

import GameCubeUtil from '../Util';

import GameCubeBasics from './Basics';

const {
  LITTLE_ENDIAN,
  BLOCK_SIZE,
  NUM_RESERVED_BLOCKS,
} = GameCubeBasics;

const NUM_BLOCK_ALLOCATION_TABLE_ENTRIES = 0xFFB; // https://github.com/dolphin-emu/dolphin/blob/ee27f03a4387baca6371a06068274135ff9547a5/Source/Core/Core/HW/GCMemcard/GCMemcard.h#L107
const BLOCK_ALLOCATION_TABLE_ENTRY_SIZE = 2;

const DEFAULT_UPDATE_COUNTER = 0;

const CHECKSUM_OFFSET = 0x0000;
const CHECKSUM_INVERSE_OFFSET = 0x0002;
const UPDATE_COUNTER_OFFSET = 0x0004;
const NUM_FREE_BLOCKS_OFFSET = 0x0006;
const LAST_ALLOCATED_BLOCK_OFFSET = 0x0008;
const BLOCK_ALLOCATION_TABLE_OFFSET = 0x000A;

const CHECKSUMMED_DATA_BEGIN_OFFSET = UPDATE_COUNTER_OFFSET; // Checksummed data offset and size are taken from https://github.com/dolphin-emu/dolphin/blob/ee27f03a4387baca6371a06068274135ff9547a5/Source/Core/Core/HW/GCMemcard/GCMemcard.cpp#L634
const CHECKSUMMED_DATA_SIZE = BLOCK_SIZE - CHECKSUMMED_DATA_BEGIN_OFFSET;

const TABLE_ENTRY_BLOCK_IS_FREE = 0x0000;
const TABLE_ENTRY_LAST_BLOCK = 0xFFFF;

export default class GameCubeBlockAllocationTable {
  static TABLE_ENTRY_BLOCK_IS_FREE = TABLE_ENTRY_BLOCK_IS_FREE;

  static TABLE_ENTRY_LAST_BLOCK = TABLE_ENTRY_LAST_BLOCK;

  static writeBlockAllocationTable(saveFiles, numTotalBlocks) {
    const arrayBuffer = Util.getFilledArrayBuffer(BLOCK_SIZE, TABLE_ENTRY_BLOCK_IS_FREE);
    const dataView = new DataView(arrayBuffer);

    let numBlocksUsed = 0;

    const nextBlockNumberLists = saveFiles.map((saveFile) => {
      const nextBlockNumberList = saveFile.blockList.map((block, i) => numBlocksUsed + i + 1);
      numBlocksUsed += saveFile.blockList.length;

      if (nextBlockNumberList.length > 0) {
        nextBlockNumberList.pop();
        nextBlockNumberList.push(TABLE_ENTRY_LAST_BLOCK);
      }

      return nextBlockNumberList;
    });

    let currentOffset = 0;

    nextBlockNumberLists.forEach((nextBlockNumberList) => {
      nextBlockNumberList.forEach((nextBlockNumber) => {
        dataView.setUint16(currentOffset, nextBlockNumber, LITTLE_ENDIAN);
        currentOffset += BLOCK_ALLOCATION_TABLE_ENTRY_SIZE;
      });
    });

    // Lastly, set our update counter and then finally checksums

    dataView.setUint16(NUM_FREE_BLOCKS_OFFSET, numTotalBlocks - numBlocksUsed, LITTLE_ENDIAN);
    dataView.setUint16(LAST_ALLOCATED_BLOCK_OFFSET, numBlocksUsed + NUM_RESERVED_BLOCKS, LITTLE_ENDIAN);

    dataView.setInt16(UPDATE_COUNTER_OFFSET, DEFAULT_UPDATE_COUNTER, LITTLE_ENDIAN); // GameCube BIOS compares these as signed values: https://github.com/dolphin-emu/dolphin/blob/ee27f03a4387baca6371a06068274135ff9547a5/Source/Core/Core/HW/GCMemcard/GCMemcard.h#L359

    const { checksum, checksumInverse } = GameCubeUtil.calculateChecksums(arrayBuffer, CHECKSUMMED_DATA_BEGIN_OFFSET, CHECKSUMMED_DATA_SIZE);

    dataView.setUint16(CHECKSUM_OFFSET, checksum, LITTLE_ENDIAN);
    dataView.setUint16(CHECKSUM_INVERSE_OFFSET, checksumInverse, LITTLE_ENDIAN);

    return arrayBuffer;
  }

  static readBlockAllocationTable(arrayBuffer) {
    const dataView = new DataView(arrayBuffer);

    const checksum = dataView.getUint16(CHECKSUM_OFFSET, LITTLE_ENDIAN);
    const checksumInverse = dataView.getUint16(CHECKSUM_INVERSE_OFFSET, LITTLE_ENDIAN);
    const updateCounter = dataView.getInt16(UPDATE_COUNTER_OFFSET, LITTLE_ENDIAN); // GameCube BIOS compares these as signed values: https://github.com/dolphin-emu/dolphin/blob/ee27f03a4387baca6371a06068274135ff9547a5/Source/Core/Core/HW/GCMemcard/GCMemcard.h#L359
    const numFreeBlocks = dataView.getUint16(NUM_FREE_BLOCKS_OFFSET, LITTLE_ENDIAN);
    const lastAllocatedBlock = dataView.getUint16(LAST_ALLOCATED_BLOCK_OFFSET, LITTLE_ENDIAN);

    const blockAllocationTable = ArrayUtil.createSequentialArray(0, NUM_BLOCK_ALLOCATION_TABLE_ENTRIES).map((i) => (
      dataView.getUint16(BLOCK_ALLOCATION_TABLE_OFFSET + (i * BLOCK_ALLOCATION_TABLE_ENTRY_SIZE), LITTLE_ENDIAN)
    ));

    const calculatedChecksums = GameCubeUtil.calculateChecksums(arrayBuffer, CHECKSUMMED_DATA_BEGIN_OFFSET, CHECKSUMMED_DATA_SIZE);

    if ((checksum !== calculatedChecksums.checksum) || (checksumInverse !== calculatedChecksums.checksumInverse)) {
      // The block is corrupted
      return null;
    }

    return {
      updateCounter,
      numFreeBlocks,
      lastAllocatedBlock,
      blockAllocationTable,
    };
  }
}
