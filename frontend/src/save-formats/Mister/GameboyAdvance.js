/*
In the test files I was provided for GBA, the mister files looked "too short": the ones I had from a Retron 5 were longer and
had data past where the mister ones ended.

But the info for the GBA core seems to indicate that saving works fully and any remaining issues with the core
are minor and cosmetic: https://github.com/MiSTer-devel/GBA_MiSTer

So I'm just going to assume that no transformation is needed for GBA files until I hear otherwise.
*/

export default class MisterGameboyAdvanceSaveData {
  static getMisterFileExtension() {
    return 'sav';
  }

  static getRawFileExtension() {
    return 'srm';
  }

  static adjustOutputSizesPlatform() {
    return 'gba';
  }

  static createFromMisterData(misterArrayBuffer) {
    return new MisterGameboyAdvanceSaveData(misterArrayBuffer, misterArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    return new MisterGameboyAdvanceSaveData(rawArrayBuffer, rawArrayBuffer);
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
