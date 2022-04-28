/*
Swaps the endianness of N64 save data
*/

import N64Util from '../../util/N64';

export default class N64FlashCartSaveData {
  static createFromFlashCartData(flashCartArrayBuffer) {
    return new N64FlashCartSaveData(flashCartArrayBuffer, N64Util.endianSwap(flashCartArrayBuffer, 'bigToLittleEndian'));
  }

  static createFromRawData(rawArrayBuffer) {
    return new N64FlashCartSaveData(N64Util.endianSwap(rawArrayBuffer, 'littleToBigEndian'), rawArrayBuffer);
  }

  constructor(flashCartArrayBuffer, rawArrayBuffer) {
    this.flashCartArrayBuffer = flashCartArrayBuffer;
    this.rawArrayBuffer = rawArrayBuffer;
  }

  getRawArrayBuffer() {
    return this.rawArrayBuffer;
  }

  getFlashCartArrayBuffer() {
    return this.flashCartArrayBuffer;
  }
}
