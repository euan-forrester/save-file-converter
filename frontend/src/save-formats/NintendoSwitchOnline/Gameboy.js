/*
The Nintendo Switch Online save format for Gameboy games is the similar to its format for NES except that there's 2 hashes:
one for the ROM used and the other for the save data itself

The format is:

0x00: Magic: "SRAM" + 0x03
0x08: Encoded SHA-1 hash of the ROM
0x30: Magic: 0x0B000000 + "HEAD-v178.0"
0x40: Encoded SHA-1 hash of the raw save data
0x68: Raw save data
*/

import SaveFilesUtil from '../../util/SaveFiles';
import Util from '../../util/util';
import HashUtil from '../../util/Hash';

const MAGIC1 = [0x53, 0x52, 0x41, 0x4D, 0x03]; // 'SRAM';
const MAGIC1_OFFSET = 0;

const MAGIC2 = [0x0B, 0x00, 0x00, 0x00, 0x48, 0x45, 0x41, 0x44, 0x2D, 0x76, 0x31, 0x37, 0x38, 0x2E, 0x30]; // 'HEAD-v178.0';
const MAGIC2_OFFSET = 0x30;

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

  static createWithNewSize(nsoSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(nsoSaveData.getRawArrayBuffer(), newSize);

    return NsoGameboySaveData.createFromRawData(newRawSaveData);
  }

  static createFromNsoData(nsoArrayBuffer) {
    Util.checkMagicBytes(nsoArrayBuffer, MAGIC1_OFFSET, MAGIC1);
    Util.checkMagicBytes(nsoArrayBuffer, MAGIC2_OFFSET, MAGIC2);

    const encodedRomHashArrayBuffer = nsoArrayBuffer.slice(ROM_HASH_OFFSET, ROM_HASH_OFFSET + HASH_LENGTH);

    return new NsoGameboySaveData(nsoArrayBuffer.slice(DATA_BEGIN_OFFSET), nsoArrayBuffer, encodedRomHashArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer, encodedRomHashArrayBuffer) {
    let headerArrayBuffer = Util.getFilledArrayBuffer(HEADER_LENGTH, HEADER_FILL_VALUE);

    headerArrayBuffer = Util.setMagicBytes(headerArrayBuffer, MAGIC1_OFFSET, MAGIC1);
    headerArrayBuffer = Util.setMagicBytes(headerArrayBuffer, MAGIC2_OFFSET, MAGIC2);

    const encodedSaveDataHashArrayBuffer = HashUtil.getEncodedHash(rawArrayBuffer, HASH_ALGORITHM, HASH_ENCODING);

    headerArrayBuffer = Util.setArrayBufferPortion(headerArrayBuffer, encodedRomHashArrayBuffer, ROM_HASH_OFFSET, 0, HASH_LENGTH);
    headerArrayBuffer = Util.setArrayBufferPortion(headerArrayBuffer, encodedSaveDataHashArrayBuffer, SAVE_DATA_HASH_OFFSET, 0, HASH_LENGTH);

    const nsoArrayBuffer = Util.concatArrayBuffers([headerArrayBuffer, rawArrayBuffer]);

    return new NsoGameboySaveData(rawArrayBuffer, nsoArrayBuffer, encodedRomHashArrayBuffer);
  }

  // This constructor creates a new object from a binary representation of a NSO save data file
  constructor(rawArrayBuffer, nsoArrayBuffer, encodedRomHash) {
    this.rawArrayBuffer = rawArrayBuffer;
    this.nsoArrayBuffer = nsoArrayBuffer;
    this.encodedRomHash = encodedRomHash;
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
}
