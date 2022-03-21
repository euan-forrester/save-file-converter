/*
I don't have any test save files for Game Gear, so I'm just going to assume for now that we pass the file straight through
in both directions

A list of Game Gear games that support saving can be found here:
https://segaretro.org/Battery_backup#Game_Gear
*/

export default class MisterGameGearSaveData {
  static getMisterFileExtension() {
    return 'sav';
  }

  static getRawFileExtension() {
    return 'srm';
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

  getRawArrayBuffer() {
    return this.rawArrayBuffer;
  }

  getMisterArrayBuffer() {
    return this.misterArrayBuffer;
  }
}
