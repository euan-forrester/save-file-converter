/*
The MiSTer saves SNES data as just the raw data of the correct size: no transformation or padding required
*/

export default class MisterSnesSaveData {
  static getMisterFileExtension() {
    return 'sav';
  }

  static getRawFileExtension() {
    return 'srm';
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

  getRawArrayBuffer() {
    return this.rawArrayBuffer;
  }

  getMisterArrayBuffer() {
    return this.misterArrayBuffer;
  }
}
