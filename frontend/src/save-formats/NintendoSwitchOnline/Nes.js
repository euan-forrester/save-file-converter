/*
The Nintendo Switch Online save format for NES games is the same as those on the NES Classic: the save is padded out to 32kB,
and has a 40-byte SHA-1 digest encoded in ASCII prepended to the beginning
*/

import createHash from 'create-hash';

import PaddingUtil from '../../util/Padding';
import SaveFilesUtil from '../../util/SaveFiles';
import Util from '../../util/util';

const NSO_NES_FILE_SIZE = 32768;
const NSO_NES_PADDING_VALUE = 0x00;

const NES_FILE_SIZE = 8192; // Although not all NES games have 8kB saves, the selection available on NSO all do

const HASH_ALGORITHM = 'sha1';
const HASH_LENGTH = 40; // The SHA-1 digest is converted to hex and encoded as ASCII
const HASH_ENCODING = 'US-ASCII';

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
    return new NsoNesSaveData(nsoArrayBuffer.slice(HASH_LENGTH, HASH_LENGTH + NES_FILE_SIZE), nsoArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    const rawArrayBufferTruncated = rawArrayBuffer.slice(0, NES_FILE_SIZE);
    const rawArrayBufferPadded = padArrayBuffer(rawArrayBufferTruncated);

    // Calculate the hash

    const hash = createHash(HASH_ALGORITHM);
    hash.update(Buffer.from(rawArrayBufferPadded));
    const hashOutput = hash.digest();

    const hashString = Buffer.from(hashOutput).toString('hex').toLowerCase();

    // Encode the hash and prepend it to the save

    const textEncoder = new TextEncoder(HASH_ENCODING);
    const hashEncodedArrayBuffer = Util.bufferToArrayBuffer(textEncoder.encode(hashString));

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
