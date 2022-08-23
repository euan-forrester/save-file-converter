/*
The MiSTer makes saves that are 64kB in size and the emulator I tried makes saves that are 32kB. Each seems able to load the other's save.
I'm not sure which of the two sizes is "correct", so I'm just going to leave everything alone.

A list of Game Gear games that support saving can be found here:
https://segaretro.org/Battery_backup#Game_Gear
*/

import SaveFilesUtil from '../../util/SaveFiles';

export default class MisterGameGearSaveData {
  static getMisterFileExtension() {
    return 'sav';
  }

  static getRawFileExtension() {
    return 'srm';
  }

  static adjustOutputSizesPlatform() {
    return 'gamegear';
  }

  static createWithNewSize(misterSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(misterSaveData.getRawArrayBuffer(), newSize);

    return MisterGameGearSaveData.createFromRawData(newRawSaveData);
  }

  static createFromMisterData(misterArrayBuffer) {
    return new MisterGameGearSaveData(misterArrayBuffer, misterArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    return new MisterGameGearSaveData(rawArrayBuffer, rawArrayBuffer);
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
