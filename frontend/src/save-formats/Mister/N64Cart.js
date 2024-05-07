/*
We've split up the N64 into cart and mempack because a mempack image is the same size as an SRAM image,
So if the mempack was corrupted we wouldn't be able to disambiguate that and would
assume the image was SRAM which may be confusing to the user

MiSTer N64 cart saves are stored with the same endianness as emulator saves, so no transformation is required
*/

import SaveFilesUtil from '../../util/SaveFiles';

export default class MisterN64CartSaveData {
  static getMisterFileExtension() {
    return 'sav';
  }

  static getRawFileExtension() {
    return 'srm';
  }

  static adjustOutputSizesPlatform() {
    return 'n64';
  }

  static createWithNewSize(misterSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(misterSaveData.getRawArrayBuffer(), newSize);

    return MisterN64CartSaveData.createFromRawData(newRawSaveData);
  }

  static createFromMisterData(misterArrayBuffer) {
    return new MisterN64CartSaveData(misterArrayBuffer, misterArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    return new MisterN64CartSaveData(rawArrayBuffer, rawArrayBuffer);
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
