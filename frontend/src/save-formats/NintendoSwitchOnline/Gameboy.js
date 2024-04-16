/*
The Nintendo Switch Online save format for Gameboy games is the similar to its format for NES except that there's 2 hashes:
one for the ROM used and the other for the save data itself

There may or may not be RTC data present in the header

0x00: Magic 1: "SRAM" + 0x03
0x08: Encoded SHA-1 hash of the ROM
0x30: Length of git revision number in bytes
0x34: Git revision number: "HEAD-vXXX.X", or "master-vXXX.X", or "HEAD-vXXX.X-X-XXXXXXXXX"

The rest isn't at fixed offsets:

1 byte indicating whether RTC data is present
(optional) 0x20 bytes of RTC data
0x28 bytes of encoded SHA-1 hash of the raw save data
Raw save data

It appears there's at least 6 versions of the git revision number:
- HEAD-v178.0 (the initial batch of NSO games)
- HEAD-v184.0 (Kirby's Dreamland 2)
- HEAD-v203.0 (Spanish versions of Pokemon Red/Blue/Yellow/Gold/Silver/Crystal)
- HEAD-v213.0-1-g59d2e63b (Europe version of Pokemon TCG)
- master-v196.0 (Pokemon TCG)
- master-v199.0 (Pokemon - Crystal Version)
*/

import SaveFilesUtil from '../../util/SaveFiles';
import Util from '../../util/util';
import HashUtil from '../../util/Hash';

const MAGIC_OFFSET = 0;
const MAGIC = [0x53, 0x52, 0x41, 0x4D, 0x03]; // 'SRAM';

const ROM_HASH_OFFSET = 0x08;

const HASH_ALGORITHM = 'sha1';
const HASH_LENGTH = 0x28; // The SHA-1 digest is converted to hex and encoded as ASCII
const HASH_ENCODING = 'US-ASCII';

const GIT_REVISION_NUMBER_LENGTH_OFFSET = 0x30;
const GIT_REVISION_NUMBER_OFFSET = 0x34;

// This is likely RTC data (it's found in Pokemon Gold/Silver/Crystal and not in Pokemon Red/Blue/Yellow)
const NO_RTC_DATA = 0x00;
const HAS_RTC_DATA = 0x01;
const HAS_RTC_DATA_POTENTIAL_VALUES = [NO_RTC_DATA, HAS_RTC_DATA];
const RTC_DATA_LENGTH = 0x20;

const HEADER_FILL_VALUE = 0x00; // There are some misc 0x00 bytes after the magics

function getFileInfo(nsoArrayBuffer) {
  // First, get the git revision number

  const nsoDataView = new DataView(nsoArrayBuffer);
  const gitRevisionNumberLength = nsoDataView.getUint8(GIT_REVISION_NUMBER_LENGTH_OFFSET);
  const gitRevisionNumberArrayBuffer = nsoArrayBuffer.slice(GIT_REVISION_NUMBER_OFFSET, GIT_REVISION_NUMBER_OFFSET + gitRevisionNumberLength);

  // Now we need to look for potential RTC data

  const hasRtcDataOffset = GIT_REVISION_NUMBER_OFFSET + gitRevisionNumberLength;
  const hasRtcData = nsoDataView.getUint8(hasRtcDataOffset);

  if (HAS_RTC_DATA_POTENTIAL_VALUES.indexOf(hasRtcData) < 0) {
    throw new Error('This does not appear to be a Nintendo Switch Online Gameboy save file');
  }

  let rtcDataArrayBuffer = null;
  let saveDataHashOffset = hasRtcDataOffset + 1;

  if (hasRtcData === HAS_RTC_DATA) {
    rtcDataArrayBuffer = nsoArrayBuffer.slice(hasRtcDataOffset + 1, hasRtcDataOffset + 1 + RTC_DATA_LENGTH);
    saveDataHashOffset += RTC_DATA_LENGTH;
  }

  return {
    gitRevisionNumberArrayBuffer,
    rtcDataArrayBuffer,
    saveDataHashOffset,
    dataBeginOffset: saveDataHashOffset + HASH_LENGTH,
  };
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
    Util.checkMagicBytes(nsoArrayBuffer, MAGIC_OFFSET, MAGIC);

    const fileInfo = getFileInfo(nsoArrayBuffer);

    const romHashArrayBuffer = nsoArrayBuffer.slice(ROM_HASH_OFFSET, ROM_HASH_OFFSET + HASH_LENGTH);

    return new NsoGameboySaveData(nsoArrayBuffer.slice(fileInfo.dataBeginOffset), nsoArrayBuffer, romHashArrayBuffer, fileInfo.gitRevisionNumberArrayBuffer, fileInfo.rtcDataArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer, romHashArrayBuffer, gitRevisionNumberArrayBuffer, rtcDataArrayBuffer) {
    const rtcDataLength = (rtcDataArrayBuffer !== null) ? rtcDataArrayBuffer.byteLength : 0;
    const hasRtcDataOffset = GIT_REVISION_NUMBER_OFFSET + gitRevisionNumberArrayBuffer.byteLength;
    const rtcDataOffset = hasRtcDataOffset + 1;
    const saveDataHashOffset = rtcDataOffset + rtcDataLength;
    const headerLength = saveDataHashOffset + HASH_LENGTH;

    let headerArrayBuffer = Util.getFilledArrayBuffer(headerLength, HEADER_FILL_VALUE);

    const headerDataView = new DataView(headerArrayBuffer);

    // We can't interleave these line with lines that mess with headerArrayBuffer below, otherwise this change gets stomped
    headerDataView.setUint8(GIT_REVISION_NUMBER_LENGTH_OFFSET, gitRevisionNumberArrayBuffer.byteLength);
    headerDataView.setUint8(hasRtcDataOffset, (rtcDataArrayBuffer !== null) ? HAS_RTC_DATA : NO_RTC_DATA);

    headerArrayBuffer = Util.setMagicBytes(headerArrayBuffer, MAGIC_OFFSET, MAGIC);
    headerArrayBuffer = Util.setArrayBufferPortion(headerArrayBuffer, romHashArrayBuffer, ROM_HASH_OFFSET, 0, HASH_LENGTH);
    headerArrayBuffer = Util.setArrayBufferPortion(headerArrayBuffer, gitRevisionNumberArrayBuffer, GIT_REVISION_NUMBER_OFFSET, 0, gitRevisionNumberArrayBuffer.byteLength);

    if (rtcDataLength > 0) {
      headerArrayBuffer = Util.setArrayBufferPortion(headerArrayBuffer, rtcDataArrayBuffer, rtcDataOffset, 0, rtcDataArrayBuffer.byteLength);
    }

    const encodedSaveDataHashArrayBuffer = HashUtil.getEncodedHash(rawArrayBuffer, HASH_ALGORITHM, HASH_ENCODING);

    headerArrayBuffer = Util.setArrayBufferPortion(headerArrayBuffer, encodedSaveDataHashArrayBuffer, saveDataHashOffset, 0, HASH_LENGTH);

    const nsoArrayBuffer = Util.concatArrayBuffers([headerArrayBuffer, rawArrayBuffer]);

    return new NsoGameboySaveData(rawArrayBuffer, nsoArrayBuffer, romHashArrayBuffer, gitRevisionNumberArrayBuffer, rtcDataArrayBuffer);
  }

  // This constructor creates a new object from a binary representation of a NSO save data file
  constructor(rawArrayBuffer, nsoArrayBuffer, romHashArrayBuffer, gitRevisionNumberArrayBuffer, rtcDataArrayBuffer) {
    this.rawArrayBuffer = rawArrayBuffer;
    this.nsoArrayBuffer = nsoArrayBuffer;
    this.romHashArrayBuffer = romHashArrayBuffer;
    this.gitRevisionNumberArrayBuffer = gitRevisionNumberArrayBuffer;
    this.rtcDataArrayBuffer = rtcDataArrayBuffer;
  }

  getRawArrayBuffer() {
    return this.rawArrayBuffer;
  }

  getNsoArrayBuffer() {
    return this.nsoArrayBuffer;
  }

  getRomHashArrayBuffer() {
    return this.romHashArrayBuffer;
  }

  getGitRevisionNumberArrayBuffer() {
    return this.gitRevisionNumberArrayBuffer;
  }

  getRtcDataArrayBuffer() {
    return this.rtcDataArrayBuffer;
  }
}
