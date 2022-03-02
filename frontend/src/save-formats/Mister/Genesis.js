/*
The MiSTer saves Genesis data as bytes (similar to the internal Wii format) rather than shorts like some emulators

Based on https://github.com/superg/srmtools
*/

import Troubleshooting from '../../util/Troubleshooting';

const LITTLE_ENDIAN = false;

const MISTER_FILE_SIZE = 65536; // All mister files seem to need to be padded out to 64kB
const MISTER_PADDING_VALUE = 0xFF;

export default class MisterGenesisSaveData {
  static createFromMisterData(misterArrayBuffer) {
    const rawArrayBuffer = new ArrayBuffer(misterArrayBuffer.byteLength * 2);

    const misterDataView = new DataView(misterArrayBuffer);
    const rawDataView = new DataView(rawArrayBuffer);

    for (let i = 0; i < misterArrayBuffer.byteLength; i += 1) {
      rawDataView.setUint16(i * 2, misterDataView.getUint8(i), LITTLE_ENDIAN);
    }

    return new MisterGenesisSaveData(rawArrayBuffer, misterArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    const misterArrayBuffer = new ArrayBuffer(rawArrayBuffer.byteLength / 2);

    const misterDataView = new DataView(misterArrayBuffer);
    const rawDataView = new DataView(rawArrayBuffer);

    for (let i = 0; i < misterArrayBuffer.byteLength; i += 1) {
      const currByte = rawDataView.getUint16(i * 2);

      // This may happen, for example, when using a Genesis EEPROM save. The Genesis EEPROM saves
      // don't have this strange byte expansion to work in an emulator that the SRAM and FRAM saves
      // for the Genesis do. And so it works as-is on a MiSTer.
      //
      // But, the user may not know that, and try to convert their save when trying to use it
      // on a MiSTer.
      //
      // Rather than display an error, which may mislead the user into not using the tool for other
      // subsequent files that DO require conversion, let's just silently pass back the same file
      // and pretend we converted it.
      //
      // This only applies to a really small list of games, so whichever tactic we choose here
      // won't have much of an impact (hopefully!)
      if (currByte > 0xFF) {
        return new MisterGenesisSaveData(rawArrayBuffer, rawArrayBuffer);
      }

      misterDataView.setUint8(i, currByte);
    }

    const padding = {
      value: MISTER_PADDING_VALUE,
      count: Math.max(MISTER_FILE_SIZE - misterArrayBuffer.byteLength, 0),
    };

    return new MisterGenesisSaveData(rawArrayBuffer, Troubleshooting.addPaddingToEnd(misterArrayBuffer, padding));
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
