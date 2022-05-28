/*
The MiSTer saves Genesis data as bytes (similar to the internal Wii format) rather than shorts like some emulators

Based on https://github.com/superg/srmtools
*/

import PaddingUtil from '../../util/Padding';

const LITTLE_ENDIAN = false;

// Genesis files on the mister are padded out to 64k with 0xFFs.
// The core is apparently pretty lenient on reading unpadded files, but we'll still be friendly and pad ours out.
// There's one ROM hack, Sonic 1 Remastered, that instead requires padding out with 0x00s.
// But we're not going to handle that. How could we?
const MISTER_FILE_SIZE = 65536;
const MISTER_PADDING_VALUE = 0xFF;

function padArrayBuffer(inputArrayBuffer) {
  const padding = {
    value: MISTER_PADDING_VALUE,
    count: Math.max(MISTER_FILE_SIZE - inputArrayBuffer.byteLength, 0),
  };

  return PaddingUtil.addPaddingToEnd(inputArrayBuffer, padding);
}

export default class MisterGenesisSaveData {
  static getMisterFileExtension() {
    return 'sav';
  }

  static getRawFileExtension() {
    return 'srm';
  }

  static adjustOutputSizesPlatform() {
    return 'genesis';
  }

  static createFromMisterData(misterArrayBuffer) {
    // First, we need to unpad the mister save. Otherwise we will byte-expand all the 0xFFs at the end
    // which will result in a crazy file

    let unpaddedMisterArrayBuffer = misterArrayBuffer;

    const padding = PaddingUtil.getPadFromEndValueAndCount(misterArrayBuffer);

    if (padding.value === MISTER_PADDING_VALUE) {
      unpaddedMisterArrayBuffer = PaddingUtil.removePaddingFromEnd(misterArrayBuffer, padding.count);
    }

    // Now that the padding is gone, we can proceed

    const rawArrayBuffer = new ArrayBuffer(unpaddedMisterArrayBuffer.byteLength * 2);

    const unpaddedMisterDataView = new DataView(unpaddedMisterArrayBuffer);
    const rawDataView = new DataView(rawArrayBuffer);

    for (let i = 0; i < unpaddedMisterArrayBuffer.byteLength; i += 1) {
      rawDataView.setUint16(i * 2, unpaddedMisterDataView.getUint8(i), LITTLE_ENDIAN);
    }

    return new MisterGenesisSaveData(rawArrayBuffer, misterArrayBuffer); // Note that we're passing through the padded file here as the mister file
  }

  static createFromRawData(rawArrayBuffer) {
    const misterArrayBuffer = new ArrayBuffer(rawArrayBuffer.byteLength / 2);

    const misterDataView = new DataView(misterArrayBuffer);
    const rawDataView = new DataView(rawArrayBuffer);

    for (let i = 0; i < misterArrayBuffer.byteLength; i += 1) {
      // There are 3 types of Genesis saves that we need to disambiguate:
      //   1. Saves where each alternating byte is 0. These come from emulators (?), and represent what happens when you read an 8 bit value through a 16 bit bus
      //   2. Saves where each pair of bytes is the same. These come from the Retrode (and others?), and are a different representation of what happens when you read an 8 bit value through a 16 but bus
      //   3. Saves with no such pattern. These are EEPROM saves, which don't have either kind of byte expansion

      const currByte = rawDataView.getUint8(i * 2);
      const nextByte = rawDataView.getUint8((i * 2) + 1);

      const currByte16 = rawDataView.getUint16(i * 2, LITTLE_ENDIAN);

      // This may happen, for example, when using a Genesis EEPROM save. The Genesis EEPROM saves
      // don't have either kind of strange byte expansion to work in an emulator that the SRAM and FRAM saves
      // for the Genesis do. And so it works as-is on a MiSTer.
      //
      // But, the user may not know that, and try to convert their save when trying to use it
      // on a MiSTer.
      //
      // Rather than display an error, which may mislead the user into not using the tool for other
      // subsequent files that DO require conversion, let's just silently pass back the same file (but add padding)
      // and pretend we converted it.
      //
      // This only applies to a really small list of games, so whichever tactic we choose here
      // won't have much of an impact (hopefully!)
      if ((currByte !== nextByte) && (currByte16 > 0xFF)) {
        return new MisterGenesisSaveData(rawArrayBuffer, padArrayBuffer(rawArrayBuffer));
      }

      misterDataView.setUint8(i, currByte);
    }

    return new MisterGenesisSaveData(rawArrayBuffer, padArrayBuffer(misterArrayBuffer));
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
