/*
Like all platforms, the Mister interfaces with Sega CD data via its BIOS, meaning that all saves are the same.

The main thing with Sega CD saves is distinguishing whether they are for the internal backup RAM or for the RAM cartridge.
Resizing is the other trick, since the size is encoded within the data.

I've also seen Mister Sega CD saves that are padded at the end, so we can clean that up.
*/

// import PaddingUtil from '../../util/Padding';
import SegaCdUtil from '../../util/SegaCd';

export default class MisterSegaCdSaveData {
  static getMisterFileExtension() {
    return 'sav';
  }

  static getRawFileExtension() {
    return 'srm';
  }

  static adjustOutputSizesPlatform() {
    return 'segacd';
  }

  static createFromMisterData(misterArrayBuffer) {
    return new MisterSegaCdSaveData(SegaCdUtil.truncateToActualSize(misterArrayBuffer), misterArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    return new MisterSegaCdSaveData(rawArrayBuffer, rawArrayBuffer);
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
