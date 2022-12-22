import SaveFilesUtil from '../../../util/SaveFiles';

export default class GbaFlashCartSaveData {
  static createFromFlashCartData(flashCartArrayBuffer) {
    return new GbaFlashCartSaveData(flashCartArrayBuffer, flashCartArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    return new GbaFlashCartSaveData(rawArrayBuffer, rawArrayBuffer);
  }

  static createWithNewSize(gbaFlashCartSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(gbaFlashCartSaveData.getRawArrayBuffer(), newSize);

    return GbaFlashCartSaveData.createFromRawData(newRawSaveData);
  }

  static getFlashCartFileExtension() {
    return null; // GBA saves have many possible extensions, and we just want to keep whatever the original extension was
  }

  static getRawFileExtension() {
    return null; // GBA saves have many possible extensions, and we just want to keep whatever the original extension was
  }

  static requiresRom() {
    return null;
  }

  static adjustOutputSizesPlatform() {
    return 'gba';
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
