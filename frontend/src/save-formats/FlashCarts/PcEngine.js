import PcEngineUtil from '../../util/PcEngine';

export default class PcEngineFlashCartSaveData {
  static createFromFlashCartData(flashCartArrayBuffer) {
    PcEngineUtil.verifyPcEngineData(flashCartArrayBuffer);
    return new PcEngineFlashCartSaveData(flashCartArrayBuffer, flashCartArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    PcEngineUtil.verifyPcEngineData(rawArrayBuffer);
    return new PcEngineFlashCartSaveData(rawArrayBuffer, rawArrayBuffer);
  }

  static getFlashCartFileExtension() {
    return 'srm'; // Unsure what the best extension for PCE saves is
  }

  static getRawFileExtension() {
    return null; // Unsure what the best extension for PCE saves is
  }

  static requiresRom() {
    return null;
  }

  static adjustOutputSizesPlatform() {
    return null;
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
