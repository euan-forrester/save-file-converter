import SaveFilesUtil from '../../../util/SaveFiles';

export default class SuperGameboyFlashCartSaveData {
  static createFromFlashCartData(flashCartArrayBuffer) {
    return new SuperGameboyFlashCartSaveData(flashCartArrayBuffer, flashCartArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    return new SuperGameboyFlashCartSaveData(rawArrayBuffer, rawArrayBuffer);
  }

  static createWithNewSize(gbFlashCartSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(gbFlashCartSaveData.getRawArrayBuffer(), newSize);

    return SuperGameboyFlashCartSaveData.createFromRawData(newRawSaveData);
  }

  static getFlashCartFileExtension() {
    return null; // GB saves have many possible extensions, and we just want to keep whatever the original extension was
  }

  static getRawFileExtension() {
    return null; // GB saves have many possible extensions, and we just want to keep whatever the original extension was
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
