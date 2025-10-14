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

The exception is writing a game to the user save area: it starts at block 0 and must be written contiguously going forward
*/

import Util from '../../util/util';
import ArrayUtil from '../../util/Array';

import DreamcastBasics from './Components/Basics';
import DreamcastSystemInfo from './Components/SystemInfo';
import DreamcastFileAllocationTable from './Components/FileAllocationTable';
import DreamcastDirectory from './Components/Directory';
import DreamcastDirectoryEntry from './Components/DirectoryEntry';

const {
  BLOCK_SIZE,
  TOTAL_SIZE,
  MAX_DIRECTORY_ENTRIES,
  DIRECTORY_END_BLOCK_NUMBER,
  SAVE_AREA_BLOCK_NUMBER,
  SAVE_AREA_SIZE_IN_BLOCKS,
  SYSTEM_INFO_SIZE_IN_BLOCKS,
  EXTRA_AREA_SIZE_IN_BLOCKS,
  FILE_TYPE_GAME,
  MAX_NUM_GAMES,
  DEFAULT_GAME_BLOCK,
  DEFAULT_MAX_GAME_SIZE,
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

  const blockNumbers = ArrayUtil.createReverseSequentialArray(blockNumber, sizeInBlocks);

  return concatBlocks(blockNumbers, arrayBuffer);
}

function getBlocksForward(blockNumber, sizeInBlocks, arrayBuffer) {
  // Some files are built incorrectly and arrange their blocks starting at the one closest to the beginning of the file

  return arrayBuffer.slice(blockNumber * BLOCK_SIZE, (blockNumber + sizeInBlocks) * BLOCK_SIZE);
}

function createBlocksForward(arrayBuffer) {
  // Split our array buffer into blocks

  const numBlocks = Math.ceil(arrayBuffer.byteLength / BLOCK_SIZE);
  const blocks = ArrayUtil.createSequentialArray(0, numBlocks).map((i) => arrayBuffer.slice(i * BLOCK_SIZE, (i + 1) * BLOCK_SIZE));

  if (blocks[blocks.length - 1].byteLength < BLOCK_SIZE) {
    const paddingLength = BLOCK_SIZE - blocks[blocks.length - 1].byteLength;

    blocks[blocks.length - 1] = Util.concatArrayBuffers([blocks[blocks.length - 1], Util.getFilledArrayBuffer(paddingLength, FILL_VALUE)]);
  }

  return blocks;
}

function createBlocks(arrayBuffer) {
  // Similar to getBlocks() we will split our array buffer into blocks and then reverse them

  return createBlocksForward(arrayBuffer).reverse();
}

function getBlockNumbers(directoryEntry, fileAllocationTable) {
  const blockNumbers = [];
  let currentBlockNumber = directoryEntry.firstBlockNumber;

  do {
    if ((currentBlockNumber < 0) || (currentBlockNumber >= fileAllocationTable.length)) {
      throw new Error(`Save file ${directoryEntry.filename} appears to be corrupted: it references invalid block ${currentBlockNumber}`);
    }

    if (fileAllocationTable[currentBlockNumber] === DreamcastFileAllocationTable.UNALLOCATED_BLOCK) {
      throw new Error(`Save file ${directoryEntry.filename} appears to be corrupted: save file appears to contain a block that is unallocated`);
    }

    if (fileAllocationTable[currentBlockNumber] === DreamcastFileAllocationTable.BLOCK_PHYSICALLY_DAMAGED) {
      throw new Error(`Save file ${directoryEntry.filename} appears to be corrupted: save file appears to contain a block that is physically damaged`);
    }

    blockNumbers.push(currentBlockNumber);
    currentBlockNumber = fileAllocationTable[currentBlockNumber];
  } while (currentBlockNumber !== DreamcastFileAllocationTable.LAST_BLOCK_IN_FILE);

  if (blockNumbers.length !== directoryEntry.fileSizeInBlocks) {
    throw new Error(`Save file ${directoryEntry.filename} appears to be corrupted: expected to find ${directoryEntry.fileSizeInBlocks} blocks `
      + `but instead found ${blockNumbers.length} blocks when traversing file allocation table`);
  }

  return blockNumbers;
}

function getSaveFileWithBlockInfo(saveFile, currentBlockNumber) {
  const fileSizeInBlocks = Math.ceil(saveFile.rawData.byteLength / BLOCK_SIZE);

  return {
    ...saveFile,
    firstBlockNumber: currentBlockNumber,
    fileSizeInBlocks,
  };
}

function getGameFilesWithBlockInfo(gameFiles) {
  let currentBlockNumber = DEFAULT_GAME_BLOCK; // Start at the beginning of the save area and work towards the end of the file

  return gameFiles.map((saveFile) => {
    const saveFileWithBlockInfo = getSaveFileWithBlockInfo(saveFile, currentBlockNumber);

    currentBlockNumber += saveFileWithBlockInfo.fileSizeInBlocks;

    return saveFileWithBlockInfo;
  });
}

function getDataFilesWithBlockInfo(dataFiles) {
  let currentBlockNumber = SAVE_AREA_BLOCK_NUMBER; // Start at the end of the save area and work towards the beginning of the file

  return dataFiles.map((saveFile) => {
    const saveFileWithBlockInfo = getSaveFileWithBlockInfo(saveFile, currentBlockNumber);

    currentBlockNumber -= saveFileWithBlockInfo.fileSizeInBlocks;

    return saveFileWithBlockInfo;
  });
}

function splitArray(array, predicate) {
  return array.reduce(
    (accumulator, currentValue) => {
      if (predicate(currentValue)) {
        accumulator[0].push(currentValue); // Add to the first array if predicate is true
      } else {
        accumulator[1].push(currentValue); // Add to the second array if predicate is false
      }
      return accumulator;
    },
    [[], []],
  );
}

export default class DreamcastSaveData {
  static createFromDreamcastData(arrayBuffer) {
    if (arrayBuffer.byteLength < TOTAL_SIZE) {
      throw new Error('This does not appear to be a Dreamcast VMU image');
    }

    // In theory a dreamcast image can be any number of blocks, with the final block specifying the system info and thus
    // how the rest of the file is laid out.
    // In practice I think all dreamcast images are the same size, but we may as well not assume they are

    const finalBlockNumber = Math.floor(arrayBuffer.byteLength / BLOCK_SIZE) - 1;

    const volumeInfo = DreamcastSystemInfo.readSystemInfo(getBlocks(finalBlockNumber, SYSTEM_INFO_SIZE_IN_BLOCKS, arrayBuffer));

    const fileIsLaidOutForward = (volumeInfo.directory.blockNumber === DIRECTORY_END_BLOCK_NUMBER); // The file allocation table is typically just a single block long so it's not helpful as a hint. Thus we use the directory as a hint: if the last block is how it's specified then we know the file is laid out non-standard aka forwards

    let fileAllocationTableBlocks = getBlocks(volumeInfo.fileAllocationTable.blockNumber, volumeInfo.fileAllocationTable.sizeInBlocks, arrayBuffer);
    let directoryBlocks = getBlocks(volumeInfo.directory.blockNumber, volumeInfo.directory.sizeInBlocks, arrayBuffer);

    if (fileIsLaidOutForward) {
      fileAllocationTableBlocks = getBlocksForward(volumeInfo.fileAllocationTable.blockNumber, volumeInfo.fileAllocationTable.sizeInBlocks, arrayBuffer);
      directoryBlocks = getBlocksForward(volumeInfo.directory.blockNumber, volumeInfo.directory.sizeInBlocks, arrayBuffer);
    }

    const fileAllocationTable = DreamcastFileAllocationTable.readFileAllocationTable(fileAllocationTableBlocks, volumeInfo.largestBlockNumber);
    const directoryEntries = DreamcastDirectory.readDirectory(directoryBlocks);

    const saveFiles = directoryEntries.map((directoryEntry) => {
      const blockNumberList = getBlockNumbers(directoryEntry, fileAllocationTable);
      const rawData = concatBlocks(blockNumberList, arrayBuffer);
      const comments = DreamcastDirectoryEntry.getComments(directoryEntry.fileHeaderBlockNumber, rawData);

      return {
        ...directoryEntry,
        ...comments,
        blockNumberList,
        rawData,
      };
    });

    return new DreamcastSaveData(arrayBuffer, saveFiles, volumeInfo);
  }

  static createFromSaveFiles(saveFiles, volumeInfo) {
    if (saveFiles.length > MAX_DIRECTORY_ENTRIES) {
      throw new Error(`Unable to fit ${saveFiles.length} saves into a single VMU image. Max is ${MAX_DIRECTORY_ENTRIES}`);
    }

    const [gameFiles, dataFiles] = splitArray(saveFiles, (saveFile) => saveFile.fileType === FILE_TYPE_GAME);

    if (gameFiles.length > MAX_NUM_GAMES) {
      throw new Error(`Unable to fit ${gameFiles.length} games into a single VMU image. Max is ${MAX_NUM_GAMES}`);
    }

    // We may want to check that the size of the game is <= DEFAULT_MAX_GAME_SIZE as well? Or do we want to allow homebrew
    // games that are larger for devices like the VMU Pro?

    const gameFilesWithBlockInfo = getGameFilesWithBlockInfo(gameFiles);
    const dataFilesWithBlockInfo = getDataFilesWithBlockInfo(dataFiles);

    const saveFilesWithBlockInfo = [...gameFilesWithBlockInfo, ...dataFilesWithBlockInfo];

    const totalBlocks = saveFilesWithBlockInfo.reduce(((accumulator, x) => accumulator + x.fileSizeInBlocks), 0);
    if (totalBlocks > SAVE_AREA_SIZE_IN_BLOCKS) {
      throw new Error(`Save files contain a total of ${totalBlocks} blocks of data but a VMU image can only hold ${SAVE_AREA_SIZE_IN_BLOCKS} blocks`);
    }

    const maxGameSize = gameFiles.reduce((maxBlocks, saveFile) => Math.max(maxBlocks, saveFile.fileSizeInBlocks), DEFAULT_MAX_GAME_SIZE);

    const systemInfo = DreamcastSystemInfo.writeSystemInfo({ ...volumeInfo, maxGameSize });
    const fileAllocationTable = DreamcastFileAllocationTable.writeFileAllocationTable(gameFilesWithBlockInfo, dataFilesWithBlockInfo);
    const directory = DreamcastDirectory.writeDirectory(saveFilesWithBlockInfo);

    const systemInfoBlocks = createBlocks(systemInfo);
    const fileAllocationTableBlocks = createBlocks(fileAllocationTable);
    const directoryBlocks = createBlocks(directory);
    const extraAreaArrayBuffer = Util.getFilledArrayBuffer(EXTRA_AREA_SIZE_IN_BLOCKS * BLOCK_SIZE, FILL_VALUE); // Blocks 0 - 199 are for the save area, but the directory begins on block 241 leaving 41 blocks unused in between
    const gameFileBlocks = gameFiles.map((saveFile) => createBlocksForward(saveFile.rawData)).flat(); // We write our game files from the front of the file to the back
    const dataFileBlocks = dataFiles.reverse().map((saveFile) => createBlocks(saveFile.rawData)).flat(); // We write our data files from the back of the file to the front

    const blocksUsed = systemInfoBlocks.length + fileAllocationTableBlocks.length + directoryBlocks.length + EXTRA_AREA_SIZE_IN_BLOCKS + dataFileBlocks.length + gameFileBlocks.length;
    const paddingArrayBuffer = Util.getFilledArrayBuffer(TOTAL_SIZE - (BLOCK_SIZE * blocksUsed), FILL_VALUE);

    const memcardArrayBuffer = Util.concatArrayBuffers([
      ...gameFileBlocks,
      paddingArrayBuffer,
      ...dataFileBlocks,
      extraAreaArrayBuffer,
      ...directoryBlocks,
      ...fileAllocationTableBlocks,
      ...systemInfoBlocks,
    ]);

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
