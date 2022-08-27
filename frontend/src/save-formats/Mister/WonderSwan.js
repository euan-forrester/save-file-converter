/*
The MiSTer saves WonderSwan data with an extra sector of data at the end for realtime clock information

See https://github.com/MiSTer-devel/WonderSwan_MiSTer/issues/10 for more information
*/

import PaddingUtil from '../../util/Padding';
import MathUtil from '../../util/Math';

const MISTER_REALTIME_CLOCK_SIZE = 0x200;
const MISTER_PADDING_VALUE = 0x00;

function padArrayBuffer(inputArrayBuffer) {
  const padding = {
    value: MISTER_PADDING_VALUE,
    count: MISTER_REALTIME_CLOCK_SIZE,
  };

  return PaddingUtil.addPaddingToEnd(inputArrayBuffer, padding);
}

function removeRealtimeClockData(inputArrayBuffer) {
  if ((inputArrayBuffer.byteLength <= MISTER_REALTIME_CLOCK_SIZE) || !MathUtil.isPowerOf2(inputArrayBuffer.byteLength - MISTER_REALTIME_CLOCK_SIZE)) {
    throw new Error('File does not appear to be in the MiSTer WonderSwan format');
  }

  return PaddingUtil.removePaddingFromEnd(inputArrayBuffer, MISTER_REALTIME_CLOCK_SIZE);
}

export default class MisterWonderSwanSaveData {
  static getMisterFileExtension() {
    return 'sav';
  }

  static getRawFileExtension() {
    return 'sav';
  }

  static adjustOutputSizesPlatform() {
    return null; // No way to write WonderSwan games to real carts that I'm aware of, so prob no need to be picky about sizes?
  }

  static createWithNewSize(misterSaveData) {
    return misterSaveData;
  }

  static createFromMisterData(misterArrayBuffer) {
    return new MisterWonderSwanSaveData(removeRealtimeClockData(misterArrayBuffer), misterArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    // Pad our file out for the MiSTer clock data, just to be nice
    return new MisterWonderSwanSaveData(rawArrayBuffer, padArrayBuffer(rawArrayBuffer));
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
