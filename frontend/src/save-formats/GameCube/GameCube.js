/* eslint-disable no-bitwise */

/*
The format for a memory card image

The format is somewhat described here: https://www.gc-forever.com/yagcd/chap12.html#sec12 but with errors and omissions

Overall the format is fairly similar to the N64 mempack format, with the first 5 blocks being reserved and there being 2 pairs of blocks with identical information in them

Block 0: Header
Block 1: Directory
Block 2: Directory backup (repeat of block 1)
Block 3: Block allocation table
Block 4: Block allocation table backup (repeat of block 3)
*/

import Util from '../../util/util';

import GameCubeUtil from './Util';

import GameCubeBasics from './Components/Basics';
import GameCubeHeader from './Components/Header';
import GameCubeDirectory from './Components/Directory';
import GameCubeDirectoryEntry from './Components/DirectoryEntry';
import GameCubeBlockAllocationTable from './Components/BlockAllocationTable';

const { BLOCK_SIZE, NUM_RESERVED_BLOCKS } = GameCubeBasics;

const HEADER_BLOCK_NUMBER = 0;
const DIRECTORY_BLOCK_NUMBER = 1;
const DIRECTORY_BACKUP_BLOCK_NUMBER = 2;
const BLOCK_ALLOCATION_TABLE_BLOCK_NUMBER = 3;
const BLOCK_ALLOCATION_TABLE_BACKUP_BLOCK_NUMBER = 4;

const BLOCK_PADDING_VALUE = 0x00;

function getBlock(arrayBuffer, blockNumber) {
  const startOffset = blockNumber * BLOCK_SIZE;
  return arrayBuffer.slice(startOffset, startOffset + BLOCK_SIZE);
}

function createBlock() {
  return Util.getFilledArrayBuffer(BLOCK_SIZE, BLOCK_PADDING_VALUE);
}

function getActiveBlock(mainInfo, backupInfo) {
  // If the update counter is equal on the two blocks we're supposed to pick the first one:
  // https://github.com/dolphin-emu/dolphin/blob/ee27f03a4387baca6371a06068274135ff9547a5/Source/Core/Core/HW/GCMemcard/GCMemcard.cpp#L156
  // Dolphin sometimes picks one or the other:
  // https://github.com/dolphin-emu/dolphin/blob/ee27f03a4387baca6371a06068274135ff9547a5/Source/Core/Core/HW/GCMemcard/GCMemcardDirectory.cpp#L468
  // https://github.com/dolphin-emu/dolphin/blob/ee27f03a4387baca6371a06068274135ff9547a5/Source/Core/Core/HW/GCMemcard/GCMemcardDirectory.cpp#L590

  // The updateCounter is compared as a 16-bit signed value by the GameCube BIOS, with no protection against overflow: https://github.com/dolphin-emu/dolphin/blob/ee27f03a4387baca6371a06068274135ff9547a5/Source/Core/Core/HW/GCMemcard/GCMemcard.cpp#L252
  // That's only 32767 updates. My childhood memory card that I didn't use very much is 1% of the way there at 333.

  // There are some interesting rules about when the GameCube BIOS considers the whole card to be corrupted:
  // https://github.com/dolphin-emu/dolphin/blob/ee27f03a4387baca6371a06068274135ff9547a5/Source/Core/Core/HW/GCMemcard/GCMemcard.cpp#L152

  // I think it makes sense to be a bit more lenient here, and so allow this tool to potentially "fix" a corrupted card.
  // So let's ignore the rule about 2 corrupted blocks -> whole card considered corrupted.

  // As for the rule about a mismatch in block counts from the directory entry vs the block allocation table, let's ignore that one as well
  // until we get feedback that fixing the error would be helpful to users. In general, we tend to parse and re-create a memory card image
  // when returning it to users and so whatever we output will be free of inconsistencies like this. I guess if there's an inconsistency
  // there it's hard to know whether to prefer the directory entry or the block allocation table (i.e. assume directory entry is correct and so
  // use the other block allocation table, which is what we will do by default). Might need somewhat complex logic there,
  // and I'd like to get feedback that it would be helpful before adding this complexity.

  // It's worth noting in all this that Dolphin has considered but never implemented "fixing" corrupted images.
  // I suspect there is not much demand for this.

  if ((mainInfo !== null) && (backupInfo !== null)) {
    // If both blocks were not corrupted, then return the one with the higher updateCounter
    // (while preferring the first one if the updateCounter is equal)

    if (backupInfo.updateCounter > mainInfo.updateCounter) {
      return backupInfo;
    }

    return mainInfo;
  }

  // If one block is corrupted, then return the other one

  if (backupInfo !== null) {
    return backupInfo;
  }

  if (mainInfo !== null) {
    return mainInfo;
  }

  // If both are corrupted then the card is considered corrupted

  throw new Error('This memory card image appears to be corrupted');
}

function getBlockNumberList(saveStartBlock, blockAllocationTable) {
  let nextBlockNum = saveStartBlock;

  const blockNumberList = [];

  do {
    const currentBlockNum = nextBlockNum;
    const currentBlockTableEntry = blockAllocationTable[currentBlockNum - NUM_RESERVED_BLOCKS];

    if (currentBlockTableEntry === GameCubeBlockAllocationTable.TABLE_ENTRY_BLOCK_IS_FREE) {
      throw new Error('File appears to be corrupted: block list for file contains entry marked as free');
    }

    blockNumberList.push(currentBlockNum);

    nextBlockNum = currentBlockTableEntry;
  } while (nextBlockNum !== GameCubeBlockAllocationTable.TABLE_ENTRY_LAST_BLOCK);

  return blockNumberList;
}

function getSaveData(saveStartBlock, blockAllocationTable, arrayBuffer) {
  const blockNumberList = getBlockNumberList(saveStartBlock, blockAllocationTable);

  const blockList = blockNumberList.map((blockNumber) => getBlock(arrayBuffer, blockNumber));

  return {
    blockNumberList,
    rawData: Util.concatArrayBuffers(blockList),
  };
}

function readSaveFiles(directoryEntries, blockAllocationTable, arrayBuffer, encoding) {
  return directoryEntries.map((directoryEntry) => {
    const saveData = getSaveData(directoryEntry.saveStartBlock, blockAllocationTable, arrayBuffer);

    const comments = GameCubeDirectoryEntry.getComments(directoryEntry.commentStart, saveData.rawData, encoding);

    return {
      ...directoryEntry,
      comments,
      ...saveData,
    };
  });
}

export default class GameCubeSaveData {
  static createWithNewSize(/* gameCubeSaveData, newSize */) {
    /*
    const newRawSaveData = SegaSaturnUtil.resize(gameCubeSaveData.getArrayBuffer(), newSize);

    return GameCubeSaveData.createFromGameCubeData(newRawSaveData);
    */
  }

  static createFromGameCubeData(arrayBuffer) {
    if (arrayBuffer.byteLength < (NUM_RESERVED_BLOCKS * BLOCK_SIZE)) {
      throw new Error('This does not appear to be a GameCube memory card image');
    }

    const headerInfo = GameCubeHeader.readHeader(getBlock(arrayBuffer, HEADER_BLOCK_NUMBER));

    const { numTotalBytes, numTotalBlocks } = GameCubeUtil.getTotalSizes(headerInfo.memcardSizeMegabits);

    if (arrayBuffer.byteLength < numTotalBytes) {
      throw new Error('This does not appear to be a GameCube memory card image');
    }

    const directoryInfo = getActiveBlock(
      GameCubeDirectory.readDirectory(getBlock(arrayBuffer, DIRECTORY_BLOCK_NUMBER)),
      GameCubeDirectory.readDirectory(getBlock(arrayBuffer, DIRECTORY_BACKUP_BLOCK_NUMBER)),
    );

    const blockAllocationTableInfo = getActiveBlock(
      GameCubeBlockAllocationTable.readBlockAllocationTable(getBlock(arrayBuffer, BLOCK_ALLOCATION_TABLE_BLOCK_NUMBER)),
      GameCubeBlockAllocationTable.readBlockAllocationTable(getBlock(arrayBuffer, BLOCK_ALLOCATION_TABLE_BACKUP_BLOCK_NUMBER)),
    );

    const volumeInfo = {
      ...headerInfo,
      numTotalBlocks,
      numUsedBlocks: numTotalBlocks - blockAllocationTableInfo.numFreeBlocks,
      numFreeBlocks: blockAllocationTableInfo.numFreeBlocks,
      lastAllocatedBlock: blockAllocationTableInfo.lastAllocatedBlock,
    };

    const saveFiles = readSaveFiles(directoryInfo.directoryEntries, blockAllocationTableInfo.blockAllocationTable, arrayBuffer, headerInfo.encodingString);

    return new GameCubeSaveData(arrayBuffer, saveFiles, volumeInfo);
  }

  static createFromSaveFiles(saveFiles, volumeInfo) {
    // Begin by dividing up the data from our save files into blocks, so we know how many there are

    let currentBlock = NUM_RESERVED_BLOCKS;

    const saveFilesWithBlockInfo = saveFiles.map((saveFile) => {
      const saveStartBlock = currentBlock;

      const blockList = [];

      for (let currentOffset = 0; currentOffset < saveFile.rawData.byteLength; currentOffset += BLOCK_SIZE) {
        blockList.push(saveFile.rawData.slice(currentOffset, currentOffset + BLOCK_SIZE));
      }

      if (blockList.length > 0) {
        let finalBlock = blockList.pop();

        finalBlock = Util.padArrayBuffer(finalBlock, BLOCK_SIZE, BLOCK_PADDING_VALUE);

        blockList.push(finalBlock);
      }

      currentBlock += blockList.length;

      return {
        ...saveFile,
        saveStartBlock,
        saveSizeBlocks: blockList.length,
        blockList,
      };
    });

    // The memord card image is the reserved blocks, followed by the data blocks, followed by empty blocks

    const { numTotalBytes, numTotalBlocks } = GameCubeUtil.getTotalSizes(volumeInfo.memcardSizeMegabits);

    const headerBlock = GameCubeHeader.writeHeader(volumeInfo);
    const directoryBlock = GameCubeDirectory.writeDirectory(saveFilesWithBlockInfo);
    const blockAllocationTableBlock = GameCubeBlockAllocationTable.writeBlockAllocationTable(saveFilesWithBlockInfo, numTotalBlocks);

    let memcardArrayBuffer = Util.concatArrayBuffers([headerBlock, directoryBlock, directoryBlock, blockAllocationTableBlock, blockAllocationTableBlock]);

    saveFilesWithBlockInfo.forEach((saveFile) => { memcardArrayBuffer = Util.concatArrayBuffers([memcardArrayBuffer, ...saveFile.blockList]); });

    if (memcardArrayBuffer.byteLength > numTotalBytes) {
      throw new Error(`Unable to create a ${volumeInfo.memcardSizeMegabit} card for these save files. Requires ${memcardArrayBuffer.byteLength} bytes but card is only ${numTotalBytes} bytes`);
    }

    // Fill in the rest of the file with empty blocks until it's big enough

    while (memcardArrayBuffer.byteLength < numTotalBytes) {
      memcardArrayBuffer = Util.concatArrayBuffers([memcardArrayBuffer, createBlock()]);
    }

    return new GameCubeSaveData(memcardArrayBuffer, saveFiles, volumeInfo);
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
