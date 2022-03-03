/*
The MiSTer saves NES data as a regular raw file, but most files appear to be expanded out to 32kB, instead of the usual ~8kB, with garbage data.
Some MiSTER NES saves are larger than 32kB -- I've seen a few 128kB ones.

Loading these larger files straight in an emulator seems to work fine. But let's pad out an emulator file to 32kB when converting to MiSTer just to be nice
*/

import PaddingUtil from '../../util/Padding';

const MISTER_MINIMUM_FILE_SIZE = 32768;
const MISTER_PADDING_VALUE = 0x00; // Not sure what to choose for padding, given that actual MiSTer files are filled with garbage data

function padArrayBuffer(inputArrayBuffer) {
  const padding = {
    value: MISTER_PADDING_VALUE,
    count: Math.max(MISTER_MINIMUM_FILE_SIZE - inputArrayBuffer.byteLength, 0),
  };

  return PaddingUtil.addPaddingToEnd(inputArrayBuffer, padding);
}

export default class MisterNesSaveData {
  static getMisterFileExtension() {
    return 'sav';
  }

  static getRawFileExtension() {
    return 'srm';
  }

  static createFromMisterData(misterArrayBuffer) {
    // Just copy it straight over, because we don't know what size to truncate to: not all NES saves are 8kB
    return new MisterNesSaveData(misterArrayBuffer, misterArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    // Pad our file out to the minimum MiSTer size, just to be nice
    return new MisterNesSaveData(rawArrayBuffer, padArrayBuffer(rawArrayBuffer));
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
