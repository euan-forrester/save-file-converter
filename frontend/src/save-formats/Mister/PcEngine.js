/*
The MiSTer saves PC Engine data as just the raw data of the correct size: no transformation or padding required

We can do a little checking to make sure it's in the correct format
*/

import PcEngineUtil from '../../util/PcEngine';

export default class MisterPcEngineSaveData {
  static getMisterFileExtension() {
    return 'sav';
  }

  static getRawFileExtension() {
    return 'sav';
  }

  static adjustOutputSizesPlatform() {
    return null; // Not sure if anything writes out BRAM that's larger/smaller than the real one
  }

  static createWithNewSize(misterSaveData) {
    return misterSaveData;
  }

  static createFromMisterData(misterArrayBuffer) {
    PcEngineUtil.verifyPcEngineData(misterArrayBuffer);
    return new MisterPcEngineSaveData(misterArrayBuffer, misterArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    PcEngineUtil.verifyPcEngineData(rawArrayBuffer);
    return new MisterPcEngineSaveData(rawArrayBuffer, rawArrayBuffer);
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
