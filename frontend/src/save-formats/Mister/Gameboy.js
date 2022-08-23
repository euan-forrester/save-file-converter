/*
The MiSTer saves GB/GBC data as just the raw data of the correct size: no transformation or padding required
*/

import SaveFilesUtil from '../../util/SaveFiles';

export default class MisterGameboySaveData {
  static getMisterFileExtension() {
    return 'sav';
  }

  static getRawFileExtension() {
    return 'srm';
  }

  static adjustOutputSizesPlatform() {
    return 'gb';
  }

  static createWithNewSize(misterSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(misterSaveData.getRawArrayBuffer(), newSize);

    return MisterGameboySaveData.createFromRawData(newRawSaveData);
  }

  static createFromMisterData(misterArrayBuffer) {
    return new MisterGameboySaveData(misterArrayBuffer, misterArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    return new MisterGameboySaveData(rawArrayBuffer, rawArrayBuffer);
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
