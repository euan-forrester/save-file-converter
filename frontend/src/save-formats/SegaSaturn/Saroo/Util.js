/* eslint-disable no-bitwise */

import ArrayUtil from '../../../util/Array';
import Util from '../../../util/util';

function getByteAndBitForBlockNum(blockNum) {
  return {
    byteNum: Math.floor(blockNum / 8),
    bitNum: blockNum % 8,
  };
}

function isBlockOccupied(blockNum, bitmapUint8Array) {
  const { byteNum, bitNum } = getByteAndBitForBlockNum(blockNum);

  return ((bitmapUint8Array[byteNum] & (1 << bitNum)) !== 0);
}

function setBlockOccupied(blockNum, bitmapUint8Array) {
  const { byteNum, bitNum } = getByteAndBitForBlockNum(blockNum);

  if (byteNum > bitmapUint8Array.length) {
    throw new Error(`Cannot address block number ${blockNum} in an occupancy bitmap of size ${bitmapUint8Array.length} bytes`);
  }

  bitmapUint8Array[byteNum] |= (1 << bitNum); // eslint-disable-line no-param-reassign
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

  static createBlockOccupancyBitmap(usedBlocks, bitmapSize) {
    const bitmapArrayBuffer = Util.getFilledArrayBuffer(bitmapSize, 0x00);
    const bitmapUint8Array = new Uint8Array(bitmapArrayBuffer);

    usedBlocks.forEach((blockNum) => setBlockOccupied(blockNum, bitmapUint8Array));

    return bitmapArrayBuffer;
  }
}
