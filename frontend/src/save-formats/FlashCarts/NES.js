import SaveFilesUtil from '../../util/SaveFiles';

export default class NesFlashCartSaveData {
  static createFromFlashCartData(flashCartArrayBuffer) {
    return new NesFlashCartSaveData(flashCartArrayBuffer, flashCartArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    return new NesFlashCartSaveData(rawArrayBuffer, rawArrayBuffer);
  }

  static createWithNewSize(nesFlashCartSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(nesFlashCartSaveData.getRawArrayBuffer(), newSize);

    return NesFlashCartSaveData.createFromRawData(newRawSaveData);
  }

  static getFlashCartFileExtension() {
    return 'srm';
  }

  static getRawFileExtension() {
    return null; // NES saves have many possible extensions, and we just want to keep whatever the original extension was
  }

  static requiresRomClass() {
    return null;
  }

  static adjustOutputSizesPlatform() {
    return 'nes';
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
