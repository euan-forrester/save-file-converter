/* eslint no-bitwise: ["error", { "allow": ["&", ">>>"] }] */

/*
The Wii save data format is documented here: https://wiibrew.org/wiki/Savegame_Files
Encryption keys are from: https://hackmii.com/2008/04/keys-keys-keys/

*/

import Util from '../util/util';

// const LITTLE_ENDIAN = false;
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const SD_KEY = 'ab01b9d8e1622b08afbad84dbfc2a55d';
const SD_INITIALIZATION_VECTOR = '216712e6aa1f689f95c5a22324dc6a98';
const MAIN_HEADER_SIZE = 0x20;

export default class WiiSaveData {
  static createFromWiiData(wiiArrayBuffer) {
    return new WiiSaveData(wiiArrayBuffer);
  }

  static createFromEmulatorData(emulatorArrayBuffer) {
    const wiiArrayBuffer = emulatorArrayBuffer;

    // A bit inefficient to promptly go and decrypt the save data, but this
    // has the nice benefit of verifying that we put everything in the correct endianness
    // and got everything in the right spot. Yes I suppose that should be a test instead.
    return new WiiSaveData(wiiArrayBuffer);
  }

  // This constructor creates a new object from a binary representation of a Wii save data file
  constructor(arrayBuffer) {
    this.arrayBuffer = arrayBuffer;

    const decryptedArrayBuffer = Util.decrypt(arrayBuffer, ENCRYPTION_ALGORITHM, SD_KEY, SD_INITIALIZATION_VECTOR);

    const mainHeader = decryptedArrayBuffer.slice(0, MAIN_HEADER_SIZE);

    const mainHeaderDataView = new DataView(mainHeader);

    mainHeaderDataView.getUint32(1);

    // Everything looks good

    this.rawSaveData = null;
  }

  getRawSaveData() {
    return this.rawSaveData;
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
