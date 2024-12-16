/* eslint-disable no-bitwise */

import ArrayUtil from '../../../util/Array';

function isBlockOccupied(blockNum, bitmapUint8Array) {
  const byteNum = Math.floor(blockNum / 8);
  const bitNum = blockNum % 8;

  return ((bitmapUint8Array[byteNum] & (1 << bitNum)) !== 0);
}

export default class SegaSaturnSarooUtil {
  static getBlockOccupancy(bitmapArrayBuffer, totalSize, blockSize) {
    const bitmapUint8Array = new Uint8Array(bitmapArrayBuffer);

    const numBlocks = Math.min(totalSize / blockSize, bitmapArrayBuffer.byteLength * 8);
    const blockOccupancy = ArrayUtil.createSequentialArray(0, numBlocks).map((blockNum) => isBlockOccupied(blockNum, bitmapUint8Array));
    const usedBlocks = blockOccupancy.reduce((blockList, blockIsOccupied, blockNum) => {
      if (blockIsOccupied) {
        blockList.push(blockNum);
      }
      return blockList;
    }, []);

    return {
      blockOccupancy,
      usedBlocks,
    };
  }
}
