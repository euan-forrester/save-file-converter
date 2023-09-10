/*
The Nintendo Switch Online save format for Gameboy games is the similar to its format for NES except that there's 2 hashes:
one for the ROM used and the other for the save data itself

There are 2 possible versions of magic 2: either 'HEAD' or 'master'. If it's the latter then everything is shifted by 2 bytes

The format is:

0x00: Magic 1: "SRAM" + 0x03
0x08: Encoded SHA-1 hash of the ROM
0x30: Magic 2: Either 0x0B000000 + "HEAD-vXXX.X" or 0x0D000000 + "master-vXXX.X"
0x40 or 0x42: Encoded SHA-1 hash of the raw save data
0x68 or 0x70: Raw save data

It appears there's at least 3 versions of magic 2:
- HEAD-v178.0 (the initial batch of NSO games)
- HEAD-v184.0 (Kirby's Dreamland 2)
- master-v196.0 (Pokemon TCG)
*/

import SaveFilesUtil from '../../util/SaveFiles';
import Util from '../../util/util';
import HashUtil from '../../util/Hash';

const MAGIC1_OFFSET = 0;
const MAGIC1 = [0x53, 0x52, 0x41, 0x4D, 0x03]; // 'SRAM';

const MAGIC2_OFFSET = 0x30;
const MAGIC2 = {
  A: [0x0B, 0x00, 0x00, 0x00, 0x48, 0x45, 0x41, 0x44, 0x2D, 0x76], // 'HEAD-v';
  B: [0x0D, 0x00, 0x00, 0x00, 0x6D, 0x61, 0x73, 0x74, 0x65, 0x72, 0x2D, 0x76], // 'master-v'
};
const VERSION_NUMBER_OFFSET = {
  A: MAGIC2_OFFSET + MAGIC2.A.length,
  B: MAGIC2_OFFSET + MAGIC2.B.length,
};
const VERSION_NUMBER_LENGTH = 5;

const ROM_HASH_OFFSET = 0x08;
const SAVE_DATA_HASH_OFFSET = {
  A: 0x40,
  B: 0x42,
};

const HASH_ALGORITHM = 'sha1';
const HASH_LENGTH = 40; // The SHA-1 digest is converted to hex and encoded as ASCII
const HASH_ENCODING = 'US-ASCII';

const DATA_BEGIN_OFFSET = {
  A: SAVE_DATA_HASH_OFFSET.A + HASH_LENGTH,
  B: SAVE_DATA_HASH_OFFSET.B + HASH_LENGTH,
};
const HEADER_LENGTH = {
  A: DATA_BEGIN_OFFSET.A,
  B: DATA_BEGIN_OFFSET.B,
};

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

    return NsoGameboySaveData.createFromRawData(newRawSaveData, nsoSaveData.getEncodedRomHash(), nsoSaveData.getEncodedVersion(), nsoSaveData.getMagic2Type());
  }

  static createFromNsoData(nsoArrayBuffer) {
    Util.checkMagicBytes(nsoArrayBuffer, MAGIC1_OFFSET, MAGIC1);

    let magic2Type = null;
    const magic2Keys = Object.keys(MAGIC2);

    for (let i = 0; i < magic2Keys.length; i += 1) { // linter doesn't like "for (const key of magic2Keys)": too heavyweight
      const key = magic2Keys[i];
      try {
        Util.checkMagicBytes(nsoArrayBuffer, MAGIC2_OFFSET, MAGIC2[key]);
        magic2Type = key;
        break;
      } catch (e) {
        // Next iteration
      }
    }

    if (magic2Type === null) {
      throw new Error('This does not appear to be a Nintendo Switch Online Gameboy save file');
    }

    const encodedRomHashArrayBuffer = nsoArrayBuffer.slice(ROM_HASH_OFFSET, ROM_HASH_OFFSET + HASH_LENGTH);

    const encodedVersionArrayBuffer = nsoArrayBuffer.slice(VERSION_NUMBER_OFFSET[magic2Type], VERSION_NUMBER_OFFSET[magic2Type] + VERSION_NUMBER_LENGTH);

    return new NsoGameboySaveData(nsoArrayBuffer.slice(DATA_BEGIN_OFFSET[magic2Type]), nsoArrayBuffer, encodedRomHashArrayBuffer, encodedVersionArrayBuffer, magic2Type);
  }

  static createFromRawData(rawArrayBuffer, encodedRomHashArrayBuffer, encodedVersionArrayBuffer, magic2Type) {
    let headerArrayBuffer = Util.getFilledArrayBuffer(HEADER_LENGTH[magic2Type], HEADER_FILL_VALUE);

    headerArrayBuffer = Util.setMagicBytes(headerArrayBuffer, MAGIC1_OFFSET, MAGIC1);
    headerArrayBuffer = Util.setMagicBytes(headerArrayBuffer, MAGIC2_OFFSET, MAGIC2[magic2Type]);
    headerArrayBuffer = Util.setArrayBufferPortion(headerArrayBuffer, encodedVersionArrayBuffer, VERSION_NUMBER_OFFSET[magic2Type], 0, VERSION_NUMBER_LENGTH);

    const encodedSaveDataHashArrayBuffer = HashUtil.getEncodedHash(rawArrayBuffer, HASH_ALGORITHM, HASH_ENCODING);

    headerArrayBuffer = Util.setArrayBufferPortion(headerArrayBuffer, encodedRomHashArrayBuffer, ROM_HASH_OFFSET, 0, HASH_LENGTH);
    headerArrayBuffer = Util.setArrayBufferPortion(headerArrayBuffer, encodedSaveDataHashArrayBuffer, SAVE_DATA_HASH_OFFSET[magic2Type], 0, HASH_LENGTH);

    const nsoArrayBuffer = Util.concatArrayBuffers([headerArrayBuffer, rawArrayBuffer]);

    return new NsoGameboySaveData(rawArrayBuffer, nsoArrayBuffer, encodedRomHashArrayBuffer, encodedVersionArrayBuffer, magic2Type);
  }

  // This constructor creates a new object from a binary representation of a NSO save data file
  constructor(rawArrayBuffer, nsoArrayBuffer, encodedRomHash, encodedVersion, magic2Type) {
    this.rawArrayBuffer = rawArrayBuffer;
    this.nsoArrayBuffer = nsoArrayBuffer;
    this.encodedRomHash = encodedRomHash;
    this.encodedVersion = encodedVersion;
    this.magic2Type = magic2Type;
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

  getMagic2Type() {
    return this.magic2Type;
  }
}
