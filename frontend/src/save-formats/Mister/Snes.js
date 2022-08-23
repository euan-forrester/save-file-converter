/*
The MiSTer saves SNES data as just the raw data of the correct size: no transformation or padding required
*/

import SaveFilesUtil from '../../util/SaveFiles';

export default class MisterSnesSaveData {
  static getMisterFileExtension() {
    return 'sav';
  }

  static getRawFileExtension() {
    return 'srm';
  }

  static adjustOutputSizesPlatform() {
    return 'snes';
  }

  static createWithNewSize(misterSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(misterSaveData.getRawArrayBuffer(), newSize);

    return MisterSnesSaveData.createFromRawData(newRawSaveData);
  }

  static createFromMisterData(misterArrayBuffer) {
    return new MisterSnesSaveData(misterArrayBuffer, misterArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    return new MisterSnesSaveData(rawArrayBuffer, rawArrayBuffer);
  }

  // This constructor creates a new object from a binary representation of a MiSTer save data file
  constructor(rawArrayBuffer, misterArrayBuffer) {
    this.rawArrayBuffer = rawArrayBuffer;
    this.misterArrayBuffer = misterArrayBuffer;
  }

  getRawSaveSize() {
    return this.rawArrayBuffer.byteLength;
  }

  getRawArrayBuffer() {
    return this.rawArrayBuffer;
  }

  getMisterArrayBuffer() {
    return this.misterArrayBuffer;
  }
}
