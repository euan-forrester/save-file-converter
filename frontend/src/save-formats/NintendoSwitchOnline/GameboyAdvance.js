// GBA saves on NSO are just raw files

import SaveFilesUtil from '../../util/SaveFiles';

export default class GbaNsoSaveData {
  static createFromNsoData(nsoArrayBuffer) {
    return new GbaNsoSaveData(nsoArrayBuffer, nsoArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    return new GbaNsoSaveData(rawArrayBuffer, rawArrayBuffer);
  }

  static createWithNewSize(nsoSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(nsoSaveData.getRawArrayBuffer(), newSize);

    return GbaNsoSaveData.createFromRawData(newRawSaveData);
  }

  static getNsoFileExtension() {
    return 'sram';
  }

  static getRawFileExtension() {
    return 'srm';
  }

  static adjustOutputSizesPlatform() {
    return 'gba';
  }

  constructor(nsoArrayBuffer, rawArrayBuffer) {
    this.nsoArrayBuffer = nsoArrayBuffer;
    this.rawArrayBuffer = rawArrayBuffer;
  }

  getRawArrayBuffer() {
    return this.rawArrayBuffer;
  }

  getNsoArrayBuffer() {
    return this.nsoArrayBuffer;
  }
}
