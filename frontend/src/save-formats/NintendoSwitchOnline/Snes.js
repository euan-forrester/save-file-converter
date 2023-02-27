// SNES saves on NSO are just raw save files

import SaveFilesUtil from '../../util/SaveFiles';

export default class SnesNsoSaveData {
  static createFromNsoData(nsoArrayBuffer) {
    return new SnesNsoSaveData(nsoArrayBuffer, nsoArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    return new SnesNsoSaveData(rawArrayBuffer, rawArrayBuffer);
  }

  static createWithNewSize(nsoSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(nsoSaveData.getRawArrayBuffer(), newSize);

    return SnesNsoSaveData.createFromRawData(newRawSaveData);
  }

  static getNsoFileExtension() {
    return 'sram';
  }

  static getRawFileExtension() {
    return 'srm';
  }

  static adjustOutputSizesPlatform() {
    return 'snes';
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
