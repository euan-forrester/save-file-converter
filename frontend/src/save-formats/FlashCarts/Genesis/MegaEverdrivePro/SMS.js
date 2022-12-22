import SaveFilesUtil from '../../../../util/SaveFiles';

export default class GenesisMegaEverdriveProSmsFlashCartSaveData {
  static createFromFlashCartData(flashCartArrayBuffer) {
    return new GenesisMegaEverdriveProSmsFlashCartSaveData(flashCartArrayBuffer, flashCartArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    return new GenesisMegaEverdriveProSmsFlashCartSaveData(rawArrayBuffer, rawArrayBuffer);
  }

  static createWithNewSize(flashCartSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(flashCartSaveData.getRawArrayBuffer(), newSize);

    return GenesisMegaEverdriveProSmsFlashCartSaveData.createFromRawData(newRawSaveData);
  }

  static getFlashCartFileExtension() {
    return 'srm';
  }

  static getRawFileExtension() {
    return null; // SMS saves have many possible extensions, and we just want to keep whatever the original extension was
  }

  static requiresRom() {
    return null;
  }

  static adjustOutputSizesPlatform() {
    return 'sms';
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
