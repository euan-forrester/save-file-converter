import SaveFilesUtil from '../../util/SaveFiles';

export default class GbFlashCartSaveData {
  static createFromFlashCartData(flashCartArrayBuffer) {
    return new GbFlashCartSaveData(flashCartArrayBuffer, flashCartArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    return new GbFlashCartSaveData(rawArrayBuffer, rawArrayBuffer);
  }

  static createWithNewSize(gbFlashCartSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(gbFlashCartSaveData.getRawArrayBuffer(), newSize);

    return GbFlashCartSaveData.createFromRawData(newRawSaveData);
  }

  static getFlashCartFileExtension() {
    return null; // GB/C saves have many possible extensions, and we just want to keep whatever the original extension was
  }

  static getRawFileExtension() {
    return null; // GB/C saves have many possible extensions, and we just want to keep whatever the original extension was
  }

  static requiresRom() {
    return null;
  }

  static adjustOutputSizesPlatform() {
    return 'gb';
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
