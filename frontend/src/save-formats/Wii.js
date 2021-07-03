/* eslint no-bitwise: ["error", { "allow": ["|", ">>>", "<<"] }] */

/*
The Wii save data format is documented here: https://wiibrew.org/wiki/Savegame_Files
Encryption keys are from: https://hackmii.com/2008/04/keys-keys-keys/

*/

import Util from '../util/util';

const LITTLE_ENDIAN = false;
const GAME_TITLE_ENCODING = 'utf-16be';
const GAME_ID_ENCODING = 'US-ASCII';
const ENCRYPTION_ALGORITHM = 'aes-128-cbc';
const SD_KEY = Buffer.from('ab01b9d8e1622b08afbad84dbfc2a55d', 'hex');
const SD_INITIALIZATION_VECTOR = Buffer.from('216712e6aa1f689f95c5a22324dc6a98', 'hex');

const MAIN_HEADER_SIZE = 0x20;
const BANNER_MAGIC = 0x5749424E; // 'WIBN' ('Wii banner'?)
const BACKUP_HEADER_SIZE = 0x70;
const BACKUP_HEADER_PADDING_SIZE = 0x10;
const BACKUP_HEADER_MAGIC = 0x426B; // 'Bk'
const FILE_HEADER_SIZE = 0x80;
const FILE_HEADER_MAGIC = 0x03ADF17E;

const INCORRECT_FORMAT_ERROR_MESSAGE = 'This does not appear to be a Wii save file';

function getString(arrayBuffer, byteOffset, byteLength, textDecoder) {
  const bytes = new Uint8Array(arrayBuffer.slice(byteOffset, byteOffset + byteLength));
  return textDecoder.decode(bytes).replace(/\0/g, ''); // Remove trailing nulls
}

function getNullTerminatedString(arrayBuffer, byteOffset, textDecoder) {
  const array = new Uint8Array(arrayBuffer.slice(byteOffset));
  const nullIndex = array.indexOf(0);

  if (nullIndex === -1) {
    return '';
  }

  return getString(arrayBuffer, byteOffset, nullIndex, textDecoder);
}

function parseFile(arrayBuffer, currentByte, asciiDecoder) {
  // Parse the file header

  const fileHeader = arrayBuffer.slice(currentByte, currentByte + FILE_HEADER_SIZE);
  const fileHeaderDataView = new DataView(fileHeader);

  if (fileHeaderDataView.getUint32(0, LITTLE_ENDIAN) !== FILE_HEADER_MAGIC) {
    throw new Error(INCORRECT_FORMAT_ERROR_MESSAGE);
  }

  const size = fileHeaderDataView.getUint32(0x4, LITTLE_ENDIAN);
  const name = getNullTerminatedString(fileHeader, 0xB, asciiDecoder);
  const initializationVector = Buffer.from(arrayBuffer.slice(0x50, 0x60));

  // Use the info from the file header to decrypt the raw save

  const encryptedData = arrayBuffer.slice(FILE_HEADER_SIZE, FILE_HEADER_SIZE + size);
  let decryptedData = null;

  try {
    decryptedData = Util.decrypt(encryptedData, ENCRYPTION_ALGORITHM, SD_KEY, initializationVector);
  } catch (e) {
    throw new Error(INCORRECT_FORMAT_ERROR_MESSAGE, e); // Error trying to decrypt indicates that something is malformed
  }

  return {
    size,
    name,
    data: decryptedData,
  };
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

    const encryptedArrayBuffer = arrayBuffer;
    let decryptedArrayBuffer = null;

    try {
      decryptedArrayBuffer = Util.decrypt(arrayBuffer, ENCRYPTION_ALGORITHM, SD_KEY, SD_INITIALIZATION_VECTOR);
    } catch (e) {
      throw new Error(INCORRECT_FORMAT_ERROR_MESSAGE, e); // Error trying to decrypt indicates that something is malformed
    }

    // Parse the main header

    const mainHeader = decryptedArrayBuffer.slice(0, MAIN_HEADER_SIZE);
    const mainHeaderDataView = new DataView(mainHeader);

    // Parse the banner

    const bannerSize = mainHeaderDataView.getUint32(0x8, LITTLE_ENDIAN);
    const banner = decryptedArrayBuffer.slice(MAIN_HEADER_SIZE, MAIN_HEADER_SIZE + bannerSize);
    const bannerDataView = new DataView(banner);

    if (bannerDataView.getUint32(0, LITTLE_ENDIAN) !== BANNER_MAGIC) {
      throw new Error(INCORRECT_FORMAT_ERROR_MESSAGE);
    }

    const gameTitleDecoder = new TextDecoder(GAME_TITLE_ENCODING);
    this.gameTitle = getString(banner, 0x20, 64, gameTitleDecoder);
    this.gameSubtitle = getString(banner, 0x40, 64, gameTitleDecoder);

    // Parse the backup header

    const backupHeader = encryptedArrayBuffer.slice(MAIN_HEADER_SIZE + bannerSize, MAIN_HEADER_SIZE + bannerSize + BACKUP_HEADER_SIZE);
    const backupHeaderDataView = new DataView(backupHeader);

    if (backupHeaderDataView.getUint32(0, LITTLE_ENDIAN) !== BACKUP_HEADER_SIZE) {
      throw new Error(INCORRECT_FORMAT_ERROR_MESSAGE);
    }

    if (backupHeaderDataView.getUint16(0x4, LITTLE_ENDIAN) !== BACKUP_HEADER_MAGIC) {
      throw new Error(INCORRECT_FORMAT_ERROR_MESSAGE);
    }

    const asciiDecoder = new TextDecoder(GAME_ID_ENCODING);
    this.numberOfFiles = backupHeaderDataView.getUint32(0xC, LITTLE_ENDIAN);
    this.sizeOfFiles = backupHeaderDataView.getUint32(0x10, LITTLE_ENDIAN);
    this.totalSize = backupHeaderDataView.getUint32(0x1C, LITTLE_ENDIAN);
    this.gameId = getString(backupHeader, 0x64, 4, asciiDecoder);

    // Parse the files

    let currentByte = MAIN_HEADER_SIZE + bannerSize + BACKUP_HEADER_SIZE + BACKUP_HEADER_PADDING_SIZE;
    this.files = [];

    for (let i = 0; i < this.numberOfFiles; i += 1) {
      const file = parseFile(encryptedArrayBuffer, currentByte, asciiDecoder);
      this.files.push(file);

      currentByte += (FILE_HEADER_SIZE + WiiSaveData.roundUpToNearest64Bytes(file.size));
    }
  }

  // Made a public member of the class so we can write tests for it specifically
  static roundUpToNearest64Bytes(num) {
    if (num < 0) {
      return 0;
    }

    return (((num + 0x3F) >>> 6) << 6);
  }

  getGameTitle() {
    return this.gameTitle;
  }

  getGameSubtitle() {
    return this.gameSubtitle;
  }

  getNumberOfFiles() {
    return this.numberOfFiles;
  }

  getSizeOfFiles() {
    return this.sizeOfFiles;
  }

  getFiles() {
    return this.files;
  }

  getTotalSize() {
    return this.totalSize;
  }

  getGameId() {
    return this.gameId;
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
