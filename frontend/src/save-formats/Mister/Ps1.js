/*
The MiSTer saves PS1 data as just a raw memory card image: no transformation requuired
*/

import Ps1MemcardSaveData from '../PS1/Memcard';

export default class MisterPs1SaveData {
  static getMisterFileExtension() {
    return 'mcd';
  }

  static getRawFileExtension() {
    return 'mcr';
  }

  static adjustOutputSizesPlatform() {
    return null; // File size is always one memory card
  }

  static createWithNewSize(misterSaveData) {
    return misterSaveData;
  }

  static createFromMisterData(misterArrayBuffer) {
    const ps1MemcardSaveData = Ps1MemcardSaveData.createFromPs1MemcardData(misterArrayBuffer); // Parse the data so we can display an error if it's not in the correct format

    return new MisterPs1SaveData(ps1MemcardSaveData.getArrayBuffer(), ps1MemcardSaveData.getArrayBuffer());
  }

  static createFromRawData(rawArrayBuffer) {
    const ps1MemcardSaveData = Ps1MemcardSaveData.createFromPs1MemcardData(rawArrayBuffer); // Parse the data so we can display an error if it's not in the correct format

    return new MisterPs1SaveData(ps1MemcardSaveData.getArrayBuffer(), ps1MemcardSaveData.getArrayBuffer());
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
