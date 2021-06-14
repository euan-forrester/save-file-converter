/* eslint no-bitwise: ["error", { "allow": ["&", ">>>"] }] */

/*
The Wii save data format is documented here: https://wiibrew.org/wiki/Savegame_Files
Encryption keys are from: https://hackmii.com/2008/04/keys-keys-keys/

*/

const LITTLE_ENDIAN = true;

export default class WiiSaveData {
  static createFromWiiData(wiiArrayBuffer) {
    return new Retron5SaveData(retron5ArrayBuffer);
  }

  static createFromEmulatorData(emulatorArrayBuffer) {
    // A bit inefficient to promptly go and decrypt the save data, but this
    // has the nice benefit of verifying that we put everything in the correct endianness
    // and got everything in the right spot. Yes I suppose that should be a test instead.
    return new WiiSaveData(wiiArrayBuffer);
  }

  // This constructor creates a new object from a binary representation of a Wii save data file
  constructor(arrayBuffer) {
    this.arrayBuffer = arrayBuffer;
    this.dataView = new DataView(arrayBuffer);

    // Everything looks good

    this.rawSaveData = rawSaveData;
  }

  getRawSaveData() {
    return this.rawSaveData;
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
