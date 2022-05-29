/*
The MiSTer saves PC Engine data as just the raw data of the correct size: no transformation or padding required

We can do a little checking to make sure it's in the correct format
*/

import Util from '../../util/util';

const BRAM_SIZE = 2048;

const MAGIC = 'HUBM'; // Marker at the beginning that signifies correctly-formatted BRAM
const MAGIC_ENCODING = 'US-ASCII';
const MAGIC_OFFSET = 0;

function verifyPcEngineData(arrayBuffer) {
  if (arrayBuffer.byteLength !== BRAM_SIZE) {
    throw new Error(`File is the incorrect size: expected ${BRAM_SIZE} bytes but found ${arrayBuffer.byteLength} bytes`);
  }

  return Util.checkMagic(arrayBuffer, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);
}

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

  static createFromMisterData(misterArrayBuffer) {
    verifyPcEngineData(misterArrayBuffer);
    return new MisterPcEngineSaveData(misterArrayBuffer, misterArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    verifyPcEngineData(rawArrayBuffer);
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
