/*
Swaps the endianness of N64 save data
*/

import N64Util from '../../../util/N64';
import SaveFilesUtil from '../../../util/SaveFiles';

export default class N64FlashCartSaveData {
  static createFromFlashCartData(flashCartArrayBuffer) {
    return new N64FlashCartSaveData(flashCartArrayBuffer, N64Util.endianSwap(flashCartArrayBuffer, 'bigToLittleEndian'));
  }

  static createFromRawData(rawArrayBuffer) {
    return new N64FlashCartSaveData(N64Util.endianSwap(rawArrayBuffer, 'littleToBigEndian'), rawArrayBuffer);
  }

  static createWithNewSize(n64FlashCartSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(n64FlashCartSaveData.getRawArrayBuffer(), newSize);

    return N64FlashCartSaveData.createFromRawData(newRawSaveData);
  }

  static getFlashCartFileExtension() {
    return null; // N64 saves have many possible extensions, and we just want to keep whatever the original extension was
  }

  static getRawFileExtension() {
    return null; // N64 saves have many possible extensions, and we just want to keep whatever the original extension was
  }

  static requiresRomClass() {
    return null;
  }

  static adjustOutputSizesPlatform() {
    return 'n64'; // Apparently N64 Everdrives will ignore a save that's the wrong size, and just overwrite it
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
