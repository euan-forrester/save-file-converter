/*
The MiSTer saves NES data as a regular raw file. If the NES ROM has an iNES header, then the MiSTer core will make a 32kB save.
If it's a NES 2.0 headered ROM, then the MiSTer core will make a correct (usually 8kB) sized save.

If we made a file smaller than 32kB, the MiSTer core will leave the rest of the memory uninitialized (which shouldn't cause any harm),
but let's be friendly and pad out our file to 32kB. Beyond that mark, the MiSTer core will start mirroring addresses (whatever that means :))

Loading these too-large 32kB files straight in an emulator seems to work fine. Since we don't know what the actual size should be (even
though it's usually 8kB) then let's just leave them alone.

There are some games that will cause the MiSTer core to make a larger (e.g. 128kB) save.
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
