import SegaCdUtil from '../../../../util/SegaCd';

export default class GenesisMegaEverdriveProSegaCdFlashCartSaveData {
  static createFromFlashCartData(flashCartArrayBuffer) {
    return new GenesisMegaEverdriveProSegaCdFlashCartSaveData(flashCartArrayBuffer, flashCartArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    return new GenesisMegaEverdriveProSegaCdFlashCartSaveData(rawArrayBuffer, rawArrayBuffer);
  }

  static createWithNewSize(flashCartSaveData, newSize) {
    const newRawSaveData = SegaCdUtil.resize(flashCartSaveData.getRawArrayBuffer(), newSize);

    return GenesisMegaEverdriveProSegaCdFlashCartSaveData.createFromRawData(newRawSaveData);
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
    return 'segacd';
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
