/* eslint-disable no-bitwise */

/*
The format for a memory card image

The format is somewhat described here: https://www.gc-forever.com/yagcd/chap12.html#sec12 but with errors and omissions

Overall the format is fairly similar to the N64 mempack format, with the first 5 blocks being reserved and there being 2 pairs of blocks with identical information in them

Block 0: Header
Block 1: Directory
Block 2: Directory backup (repeat of block 1)
Block 3: Block allocation map
Block 4: Block allocation map backup (repeat of block 3)
*/

import Util from '../../util/util';

// import GameCubeUtil from './Util';

import GameCubeHeader from './Components/Header';
import GameCubeBasics from './Components/Basics';

const { BLOCK_SIZE } = GameCubeBasics;

const HEADER_BLOCK_NUMBER = 0;
/*
const DIRECTORY_BLOCK_NUMBER = 1;
const DIRECTORY_BACKUP_BLOCK_NUMBER = 2;
const BLOCK_ALLOCATION_MAP_BLOCK_NUMBER = 3;
const BLOCK_ALLOCATION_MAP_BACKUP_BLOCK_NUMBER = 4;
*/

const BLOCK_PADDING_VALUE = 0x00;

function getBlock(arrayBuffer, blockNumber) {
  const startOffset = blockNumber * BLOCK_SIZE;
  return arrayBuffer.slice(startOffset, startOffset + BLOCK_SIZE);
}

function createBlock() {
  return Util.getFilledArrayBuffer(BLOCK_SIZE, BLOCK_PADDING_VALUE);
}

function readSaveFiles() {
  return [];
}

export default class GameCubeSaveData {
  static createWithNewSize(/* gameCubeSaveData, newSize */) {
    /*
    const newRawSaveData = SegaSaturnUtil.resize(gameCubeSaveData.getArrayBuffer(), newSize);

    return GameCubeSaveData.createFromGameCubeData(newRawSaveData);
    */
  }

  static createFromGameCubeData(arrayBuffer) {
    const headerBlock = getBlock(arrayBuffer, HEADER_BLOCK_NUMBER);
    const volumeInfo = GameCubeHeader.readHeader(headerBlock);

    const saveFiles = readSaveFiles(arrayBuffer);

    return new GameCubeSaveData(arrayBuffer, saveFiles, volumeInfo);
  }

  static createFromSaveFiles(saveFiles, volumeInfo) {
    const headerBlock = GameCubeHeader.writeHeader(volumeInfo);

    const totalSizeBytes = ((volumeInfo.memcardSizeMegabits / 8) * 1024 * 1024);

    let memcardArrayBuffer = headerBlock;

    while (memcardArrayBuffer.byteLength < totalSizeBytes) {
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
