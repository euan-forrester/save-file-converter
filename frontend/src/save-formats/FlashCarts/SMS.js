import SaveFilesUtil from '../../util/SaveFiles';

export default class SmsFlashCartSaveData {
  static createFromFlashCartData(flashCartArrayBuffer) {
    return new SmsFlashCartSaveData(flashCartArrayBuffer, flashCartArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    return new SmsFlashCartSaveData(rawArrayBuffer, rawArrayBuffer);
  }

  static createWithNewSize(nesFlashCartSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(nesFlashCartSaveData.getRawArrayBuffer(), newSize);

    return SmsFlashCartSaveData.createFromRawData(newRawSaveData);
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
