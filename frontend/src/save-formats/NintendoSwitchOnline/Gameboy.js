/*
The Nintendo Switch Online save format for Gameboy games is the similar to its format for NES except that there's 2 hashes:
one for the ROM used and the other for the save data itself

There are (at least!) 3 different possible file formats, denoted by the data around the emulator version number embedded in the file.

Magic 3 appears to denote whether there is RTC data next.

Format A:

0x00: Magic 1: "SRAM" + 0x03
0x08: Encoded SHA-1 hash of the ROM
0x30: Magic 2: 0x0B000000 + "HEAD-vXXX.X"
0x3F: Magic 3: 0x00
0x40: Encoded SHA-1 hash of the raw save data
0x68: Raw save data

Format B:

0x00: Magic 1: "SRAM" + 0x03
0x08: Encoded SHA-1 hash of the ROM
0x30: Magic 2: 0x0B000000 + "HEAD-vXXX.X"
0x3F: Magic 3: 0x01
0x40-0x5F: RTC data?
0x60: Encoded SHA-1 hash of the raw save data
0x88: Raw save data

Format C:

0x00: Magic 1: "SRAM" + 0x03
0x08: Encoded SHA-1 hash of the ROM
0x30: Magic 2: 0x0D000000 + "master-vXXX.X"
0x41: Magic 3: 0x00
0x42: Encoded SHA-1 hash of the raw save data
0x70: Raw save data

Format D:

0x00: Magic 1: "SRAM" + 0x03
0x08: Encoded SHA-1 hash of the ROM
0x30: Magic 2: 0x0D000000 + "master-vXXX.X"
0x41: Magic 3: 0x01
0x42-0x61: RTC data?
0x62: Encoded SHA-1 hash of the raw save data
0x90: Raw save data

It appears there's at least 5 versions of magic 2:
- HEAD-v178.0 (the initial batch of NSO games)
- HEAD-v184.0 (Kirby's Dreamland 2)
- HEAD-v203.0 (Spanish versions of Pokemon Red/Blue/Yellow/Gold/Silver/Crystal)
- master-v196.0 (Pokemon TCG)
- master-v199.0 (Pokemon - Crystal Version)
*/

import SaveFilesUtil from '../../util/SaveFiles';
import Util from '../../util/util';
import HashUtil from '../../util/Hash';

const MAGIC1_OFFSET = 0;
const MAGIC1 = [0x53, 0x52, 0x41, 0x4D, 0x03]; // 'SRAM';

const ROM_HASH_OFFSET = 0x08;

const HASH_ALGORITHM = 'sha1';
const HASH_LENGTH = 40; // The SHA-1 digest is converted to hex and encoded as ASCII
const HASH_ENCODING = 'US-ASCII';

const MAGIC2_OFFSET = 0x30;
const MAGIC2 = {
  A: [0x0B, 0x00, 0x00, 0x00, 0x48, 0x45, 0x41, 0x44, 0x2D, 0x76], // 'HEAD-v';
  C: [0x0D, 0x00, 0x00, 0x00, 0x6D, 0x61, 0x73, 0x74, 0x65, 0x72, 0x2D, 0x76], // 'master-v'
  D: [0x0D, 0x00, 0x00, 0x00, 0x6D, 0x61, 0x73, 0x74, 0x65, 0x72, 0x2D, 0x76], // 'master-v'
};

const MAGIC3_OFFSET = {
  A: 0x3F,
  C: 0x41,
  D: 0x41,
};
const MAGIC3 = {
  A: 0x00,
  C: 0x00,
  D: 0x01,
};

const UNKNOWN_DATA_OFFSET = {
  A: 0x40,
  C: 0x42,
  D: 0x42,
};
const UNKNOWN_DATA_LENGTH = {
  A: 0x00,
  C: 0x00,
  D: 0x20,
};

const VERSION_NUMBER_OFFSET = {
  A: MAGIC2_OFFSET + MAGIC2.A.length,
  C: MAGIC2_OFFSET + MAGIC2.C.length,
  D: MAGIC2_OFFSET + MAGIC2.D.length,
};
const VERSION_NUMBER_LENGTH = 5;

const SAVE_DATA_HASH_OFFSET = {
  A: 0x40,
  C: 0x42,
  D: 0x62,
};

const DATA_BEGIN_OFFSET = {
  A: SAVE_DATA_HASH_OFFSET.A + HASH_LENGTH,
  C: SAVE_DATA_HASH_OFFSET.C + HASH_LENGTH,
  D: SAVE_DATA_HASH_OFFSET.D + HASH_LENGTH,
};
const HEADER_LENGTH = {
  A: DATA_BEGIN_OFFSET.A,
  C: DATA_BEGIN_OFFSET.C,
  D: DATA_BEGIN_OFFSET.D,
};

const HEADER_FILL_VALUE = 0x00; // There are some misc 0x00 bytes after the magics

function getFileFormat(nsoArrayBuffer) {
  // First, figure out which magic2 matches

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

  // If magic2 is of type A, then the file format is type A

  if (magic2Type === 'A') {
    return magic2Type;
  }

  // If magic2 is of type B, then we need to look at magic3

  const nsoDataView = new DataView(nsoArrayBuffer);
  const magic3 = nsoDataView.getUint8(MAGIC3_OFFSET[magic2Type]);

  let magic3Type = null;
  const magic3Keys = Object.keys(MAGIC3);

  magic3Keys.shift(); // We know we're not format A, so remove it from the list of possibilities

  for (let i = 0; i < magic3Keys.length; i += 1) { // linter doesn't like "for (const key of magic3Keys)": too heavyweight
    const key = magic3Keys[i];

    if (magic3 === MAGIC3[key]) {
      magic3Type = key;
      break;
    }
  }

  if (magic3Type === null) {
    throw new Error('This does not appear to be a Nintendo Switch Online Gameboy save file');
  }

  // Our magic3 type will be either B or C, which now corresponds to our file type

  return magic3Type;
}

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

    return NsoGameboySaveData.createFromRawData(newRawSaveData, nsoSaveData.getEncodedRomHash(), nsoSaveData.getEncodedVersion(), nsoSaveData.getUnknownData(), nsoSaveData.getFileFormat());
  }

  static createFromNsoData(nsoArrayBuffer) {
    Util.checkMagicBytes(nsoArrayBuffer, MAGIC1_OFFSET, MAGIC1);

    const fileFormat = getFileFormat(nsoArrayBuffer);

    const encodedRomHashArrayBuffer = nsoArrayBuffer.slice(ROM_HASH_OFFSET, ROM_HASH_OFFSET + HASH_LENGTH);

    const encodedVersionArrayBuffer = nsoArrayBuffer.slice(VERSION_NUMBER_OFFSET[fileFormat], VERSION_NUMBER_OFFSET[fileFormat] + VERSION_NUMBER_LENGTH);

    const unknownData = nsoArrayBuffer.slice(UNKNOWN_DATA_OFFSET[fileFormat], UNKNOWN_DATA_OFFSET[fileFormat] + UNKNOWN_DATA_LENGTH[fileFormat]);

    return new NsoGameboySaveData(nsoArrayBuffer.slice(DATA_BEGIN_OFFSET[fileFormat]), nsoArrayBuffer, encodedRomHashArrayBuffer, encodedVersionArrayBuffer, unknownData, fileFormat);
  }

  static createFromRawData(rawArrayBuffer, encodedRomHashArrayBuffer, encodedVersionArrayBuffer, unknownData, fileFormat) {
    let headerArrayBuffer = Util.getFilledArrayBuffer(HEADER_LENGTH[fileFormat], HEADER_FILL_VALUE);

    const headerDataView = new DataView(headerArrayBuffer);

    headerDataView.setUint8(MAGIC3_OFFSET[fileFormat], MAGIC3[fileFormat]); // We can't interleave this line with lines that mess with headerArrayBuffer below, otherwise this change gets stomped

    headerArrayBuffer = Util.setMagicBytes(headerArrayBuffer, MAGIC1_OFFSET, MAGIC1);
    headerArrayBuffer = Util.setMagicBytes(headerArrayBuffer, MAGIC2_OFFSET, MAGIC2[fileFormat]);
    headerArrayBuffer = Util.setArrayBufferPortion(headerArrayBuffer, encodedVersionArrayBuffer, VERSION_NUMBER_OFFSET[fileFormat], 0, VERSION_NUMBER_LENGTH);

    if (UNKNOWN_DATA_LENGTH[fileFormat] > 0) {
      headerArrayBuffer = Util.setArrayBufferPortion(headerArrayBuffer, unknownData, UNKNOWN_DATA_OFFSET[fileFormat], 0, UNKNOWN_DATA_LENGTH[fileFormat]);
    }

    const encodedSaveDataHashArrayBuffer = HashUtil.getEncodedHash(rawArrayBuffer, HASH_ALGORITHM, HASH_ENCODING);

    headerArrayBuffer = Util.setArrayBufferPortion(headerArrayBuffer, encodedRomHashArrayBuffer, ROM_HASH_OFFSET, 0, HASH_LENGTH);
    headerArrayBuffer = Util.setArrayBufferPortion(headerArrayBuffer, encodedSaveDataHashArrayBuffer, SAVE_DATA_HASH_OFFSET[fileFormat], 0, HASH_LENGTH);

    const nsoArrayBuffer = Util.concatArrayBuffers([headerArrayBuffer, rawArrayBuffer]);

    return new NsoGameboySaveData(rawArrayBuffer, nsoArrayBuffer, encodedRomHashArrayBuffer, encodedVersionArrayBuffer, fileFormat);
  }

  // This constructor creates a new object from a binary representation of a NSO save data file
  constructor(rawArrayBuffer, nsoArrayBuffer, encodedRomHash, encodedVersion, unknownData, fileFormat) {
    this.rawArrayBuffer = rawArrayBuffer;
    this.nsoArrayBuffer = nsoArrayBuffer;
    this.encodedRomHash = encodedRomHash;
    this.encodedVersion = encodedVersion;
    this.unknownData = unknownData;
    this.fileFormat = fileFormat;
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

  getUnknownData() {
    return this.unknownData;
  }

  getFileFormat() {
    return this.fileFormat;
  }
}
