import SaveFilesUtil from '../../util/SaveFiles';

export default class SnesFlashCartSaveData {
  static createFromFlashCartData(flashCartArrayBuffer) {
    return new SnesFlashCartSaveData(flashCartArrayBuffer, flashCartArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    return new SnesFlashCartSaveData(rawArrayBuffer, rawArrayBuffer);
  }

  static createWithNewSize(snesFlashCartSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(snesFlashCartSaveData.getRawArrayBuffer(), newSize);

    return SnesFlashCartSaveData.createFromRawData(newRawSaveData);
  }

  static getFlashCartFileExtension() {
    return 'srm';
  }

  static getRawFileExtension() {
    return null; // SNES saves have many possible extensions, and we just want to keep whatever the original extension was
  }

  static requiresRomClass() {
    return null;
  }

  static adjustOutputSizesPlatform() {
    return 'snes';
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
