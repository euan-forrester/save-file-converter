/* eslint no-bitwise: ["error", { "allow": ["&", ">>>"] }] */

/*
The Wii save data format is documented here: https://wiibrew.org/wiki/Savegame_Files
Encryption keys are from: https://hackmii.com/2008/04/keys-keys-keys/

*/

import Util from '../util/util';

const LITTLE_ENDIAN = false;
const CHARACTER_ENCODING = 'utf-16be';
const ENCRYPTION_ALGORITHM = 'aes-128-cbc';
const SD_KEY = 'ab01b9d8e1622b08afbad84dbfc2a55d';
const SD_INITIALIZATION_VECTOR = '216712e6aa1f689f95c5a22324dc6a98';

const MAIN_HEADER_SIZE = 0x20;
const BANNER_MAGIC = 0x5749424E; // 'WIBN' ('Wii banner'?)

function getString(arrayBuffer, byteOffset, byteLength, textDecoder) {
  const bytes = new Uint8Array(arrayBuffer.slice(byteOffset, byteOffset + byteLength));
  return textDecoder.decode(bytes).replace(/\0/g, ''); // Remove trailing nulls
}

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

    // First, decrypt the file

    let decryptedArrayBuffer = null;

    try {
      decryptedArrayBuffer = Util.decrypt(arrayBuffer, ENCRYPTION_ALGORITHM, SD_KEY, SD_INITIALIZATION_VECTOR);
    } catch (e) {
      throw new Error('This does not appear to be a Wii save file', e);
    }

    // Parse the main header

    const mainHeader = decryptedArrayBuffer.slice(0, MAIN_HEADER_SIZE);
    const mainHeaderDataView = new DataView(mainHeader);

    // Parse the banner

    const bannerSize = mainHeaderDataView.getUint32(0x8, LITTLE_ENDIAN);
    const banner = decryptedArrayBuffer.slice(MAIN_HEADER_SIZE, MAIN_HEADER_SIZE + bannerSize);
    const bannerDataView = new DataView(banner);

    if (bannerDataView.getUint32(0, LITTLE_ENDIAN) !== BANNER_MAGIC) {
      throw new Error('This does not appear to be a Wii save file');
    }

    const textDecoder = new TextDecoder(CHARACTER_ENCODING);
    this.gameTitle = getString(banner, 0x20, 64, textDecoder);
    this.gameSubtitle = getString(banner, 0x40, 64, textDecoder);

    // Everything looks good

    this.rawSaveData = mainHeader; // null;
  }

  getGameTitle() {
    return this.gameTitle;
  }

  getGameSubtitle() {
    return this.gameSubtitle;
  }

  getRawSaveData() {
    return this.rawSaveData;
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
