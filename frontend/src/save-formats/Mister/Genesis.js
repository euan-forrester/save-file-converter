/* eslint no-bitwise: ["error", { "allow": ["&"] }] */

/*
The MiSTer saves Genesis data as bytes (similar to the internal Wii format) rather than shorts like some emulators

Based on https://github.com/superg/srmtools
*/

const LITTLE_ENDIAN = false;

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
      misterDataView.setUint8(i, rawDataView.getUint16(i * 2) & 0xFF);
    }

    return new MisterGenesisSaveData(rawArrayBuffer, misterArrayBuffer);
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
