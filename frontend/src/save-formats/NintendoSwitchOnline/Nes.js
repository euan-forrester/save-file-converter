/*
The Nintendo Switch Online save format for NES games is the same as those on the NES Classic: the save is padded out to 32kB,
and has a 40-byte SHA-1 digest encoded in ASCII prepended to the beginning
*/

import PaddingUtil from '../../util/Padding';
import SaveFilesUtil from '../../util/SaveFiles';
import Util from '../../util/util';
import HashUtil from '../../util/Hash';

const NSO_NES_FILE_SIZE = 32768;
const NSO_NES_PADDING_VALUE = 0x00;

const NES_FILE_SIZE = 8192; // Although not all NES games have 8kB saves, the selection available on NSO all do

const HASH_ALGORITHM = 'sha1';
const HASH_LENGTH = 40; // The SHA-1 digest is converted to hex and encoded as ASCII
const HASH_ENCODING = 'US-ASCII';

const HASH_OFFSET = 0;
const DATA_BEGIN_OFFSET = HASH_OFFSET + HASH_LENGTH;

function padArrayBuffer(inputArrayBuffer) {
  const padding = {
    value: NSO_NES_PADDING_VALUE,
    count: Math.max(NSO_NES_FILE_SIZE - inputArrayBuffer.byteLength, 0),
  };

  return PaddingUtil.addPaddingToEnd(inputArrayBuffer, padding);
}

export default class NsoNesSaveData {
  static getNsoFileExtension() {
    return 'sram';
  }

  static getRawFileExtension() {
    return 'srm';
  }

  static adjustOutputSizesPlatform() {
    return 'nes';
  }

  static createWithNewSize(nsoSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(nsoSaveData.getRawArrayBuffer(), newSize);

    return NsoNesSaveData.createFromRawData(newRawSaveData);
  }

  static createFromNsoData(nsoArrayBuffer) {
    return new NsoNesSaveData(nsoArrayBuffer.slice(DATA_BEGIN_OFFSET, DATA_BEGIN_OFFSET + NES_FILE_SIZE), nsoArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    const rawArrayBufferTruncated = rawArrayBuffer.slice(0, NES_FILE_SIZE);
    const rawArrayBufferPadded = padArrayBuffer(rawArrayBufferTruncated);

    const hashEncodedArrayBuffer = HashUtil.getEncodedHash(rawArrayBufferPadded, HASH_ALGORITHM, HASH_ENCODING);

    const nsoArrayBuffer = Util.concatArrayBuffers([hashEncodedArrayBuffer, rawArrayBufferPadded]);

    return new NsoNesSaveData(rawArrayBuffer, nsoArrayBuffer);
  }

  // This constructor creates a new object from a binary representation of a NSO save data file
  constructor(rawArrayBuffer, nsoArrayBuffer) {
    this.rawArrayBuffer = rawArrayBuffer;
    this.nsoArrayBuffer = nsoArrayBuffer;
  }

  getRawArrayBuffer() {
    return this.rawArrayBuffer;
  }

  getNsoArrayBuffer() {
    return this.nsoArrayBuffer;
  }
}
