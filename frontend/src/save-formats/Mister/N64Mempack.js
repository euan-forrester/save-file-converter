/*
The MiSTer saves N64 mempack data as just a raw memory card image: no transformation requuired
*/

import N64MempackSaveData from '../N64/Mempack';

export default class MisterN64MempackSaveData {
  static getMisterFileExtension() {
    return 'cpk';
  }

  static getRawFileExtension() {
    return 'mpk';
  }

  static adjustOutputSizesPlatform() {
    return null; // File size is always one memory card
  }

  static createWithNewSize(misterSaveData) {
    return misterSaveData;
  }

  static createFromMisterData(misterArrayBuffer) {
    const n64MempackSaveData = N64MempackSaveData.createFromN64MempackData(misterArrayBuffer); // Parse the data so we can display an error if it's not in the correct format

    return new MisterN64MempackSaveData(n64MempackSaveData.getArrayBuffer(), n64MempackSaveData.getArrayBuffer());
  }

  static createFromRawData(rawArrayBuffer) {
    const n64MempackSaveData = N64MempackSaveData.createFromN64MempackData(rawArrayBuffer); // Parse the data so we can display an error if it's not in the correct format

    return new MisterN64MempackSaveData(n64MempackSaveData.getArrayBuffer(), n64MempackSaveData.getArrayBuffer());
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
