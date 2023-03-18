/*
The Nintendo Switch Online save format for Gameboy games is the similar to its format for NES except that there's 2 hashes:
one for the ROM used and the other for the save data itself

The format is:

0x00: Magic: "SRAM" + 0x03
0x08: Encoded SHA-1 hash of the ROM
0x30: Magic: 0x0B000000 + "HEAD-vXXX.X"
0x40: Encoded SHA-1 hash of the raw save data
0x68: Raw save data

It appears there's at least 2 versions of the HEAD magic:
- HEAD-v178.0 (the initial batch of NSO games)
- HEAD-v184.0 (Kirby's Dreamland 2)
*/

import SaveFilesUtil from '../../util/SaveFiles';
import Util from '../../util/util';
import HashUtil from '../../util/Hash';

const MAGIC1 = [0x53, 0x52, 0x41, 0x4D, 0x03]; // 'SRAM';
const MAGIC1_OFFSET = 0;

const MAGIC2 = [0x0B, 0x00, 0x00, 0x00, 0x48, 0x45, 0x41, 0x44, 0x2D, 0x76]; // 'HEAD-v';
const MAGIC2_OFFSET = 0x30;
const VERSION_NUMBER_OFFSET = MAGIC2_OFFSET + MAGIC2.length;
const VERSION_NUMBER_LENGTH = 5;

const ROM_HASH_OFFSET = 0x08;
const SAVE_DATA_HASH_OFFSET = 0x40;

const HASH_ALGORITHM = 'sha1';
const HASH_LENGTH = 40; // The SHA-1 digest is converted to hex and encoded as ASCII
const HASH_ENCODING = 'US-ASCII';

const DATA_BEGIN_OFFSET = SAVE_DATA_HASH_OFFSET + HASH_LENGTH;
const HEADER_LENGTH = DATA_BEGIN_OFFSET;
const HEADER_FILL_VALUE = 0x00; // There are some misc 0x00 bytes after the magics

export default class NsoGameboySaveData {
  static getNsoFileExtension() {
    return 'sram';
  }

  static getRawFileExtension() {
    return 'sav';
  }

  static adjustOutputSizesPlatform() {
    return 'gb';
  }

  static nsoDataRequiresRomInfo() {
    return true;
  }

  static createWithNewSize(nsoSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(nsoSaveData.getRawArrayBuffer(), newSize);

    return NsoGameboySaveData.createFromRawData(newRawSaveData);
  }

  static createFromNsoData(nsoArrayBuffer) {
    Util.checkMagicBytes(nsoArrayBuffer, MAGIC1_OFFSET, MAGIC1);
    Util.checkMagicBytes(nsoArrayBuffer, MAGIC2_OFFSET, MAGIC2);

    const encodedRomHashArrayBuffer = nsoArrayBuffer.slice(ROM_HASH_OFFSET, ROM_HASH_OFFSET + HASH_LENGTH);
    const encodedVersionArrayBuffer = nsoArrayBuffer.slice(VERSION_NUMBER_OFFSET, VERSION_NUMBER_OFFSET + VERSION_NUMBER_LENGTH);

    return new NsoGameboySaveData(nsoArrayBuffer.slice(DATA_BEGIN_OFFSET), nsoArrayBuffer, encodedRomHashArrayBuffer, encodedVersionArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer, encodedRomHashArrayBuffer, encodedVersionArrayBuffer) {
    let headerArrayBuffer = Util.getFilledArrayBuffer(HEADER_LENGTH, HEADER_FILL_VALUE);

    headerArrayBuffer = Util.setMagicBytes(headerArrayBuffer, MAGIC1_OFFSET, MAGIC1);
    headerArrayBuffer = Util.setMagicBytes(headerArrayBuffer, MAGIC2_OFFSET, MAGIC2);
    headerArrayBuffer = Util.setArrayBufferPortion(headerArrayBuffer, encodedVersionArrayBuffer, VERSION_NUMBER_OFFSET, 0, VERSION_NUMBER_LENGTH);

    const encodedSaveDataHashArrayBuffer = HashUtil.getEncodedHash(rawArrayBuffer, HASH_ALGORITHM, HASH_ENCODING);

    headerArrayBuffer = Util.setArrayBufferPortion(headerArrayBuffer, encodedRomHashArrayBuffer, ROM_HASH_OFFSET, 0, HASH_LENGTH);
    headerArrayBuffer = Util.setArrayBufferPortion(headerArrayBuffer, encodedSaveDataHashArrayBuffer, SAVE_DATA_HASH_OFFSET, 0, HASH_LENGTH);

    const nsoArrayBuffer = Util.concatArrayBuffers([headerArrayBuffer, rawArrayBuffer]);

    return new NsoGameboySaveData(rawArrayBuffer, nsoArrayBuffer, encodedRomHashArrayBuffer, encodedVersionArrayBuffer);
  }

  // This constructor creates a new object from a binary representation of a NSO save data file
  constructor(rawArrayBuffer, nsoArrayBuffer, encodedRomHash, encodedVersion) {
    this.rawArrayBuffer = rawArrayBuffer;
    this.nsoArrayBuffer = nsoArrayBuffer;
    this.encodedRomHash = encodedRomHash;
    this.encodedVersion = encodedVersion;
  }

  getRawArrayBuffer() {
    return this.rawArrayBuffer;
  }

  getNsoArrayBuffer() {
    return this.nsoArrayBuffer;
  }

  getEncodedRomHash() {
    return this.encodedRomHash;
  }

  getEncodedVersion() {
    return this.encodedVersion;
  }
}
