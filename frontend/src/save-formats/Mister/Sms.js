/*
Looks to be similar to NES, as the MiSTer pads out the save to 32kB

Opening one of these large MiSTerfiles in an emulator seems to work fine, but I don't think any of the test files I have actually
contain saved data so I can't be sure.
*/

import PaddingUtil from '../../util/Padding';
import SaveFilesUtil from '../../util/SaveFiles';

const MISTER_MINIMUM_FILE_SIZE = 32768;
const MISTER_PADDING_VALUE = 0x00;

export default class MisterSmsSaveData {
  static getMisterFileExtension() {
    return 'sav';
  }

  static getRawFileExtension() {
    return 'sav';
  }

  static adjustOutputSizesPlatform() {
    return 'sms';
  }

  static createWithNewSize(misterSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(misterSaveData.getRawArrayBuffer(), newSize);

    return MisterSmsSaveData.createFromRawData(newRawSaveData);
  }

  static createFromMisterData(misterArrayBuffer) {
    // Just copy it straight over, because we don't know what size to truncate to: not all NES saves are 8kB
    return new MisterSmsSaveData(misterArrayBuffer, misterArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    // Pad our file out to the minimum MiSTer size, just to be nice
    return new MisterSmsSaveData(rawArrayBuffer, PaddingUtil.padAtEndToMinimumSize(rawArrayBuffer, MISTER_PADDING_VALUE, MISTER_MINIMUM_FILE_SIZE));
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
