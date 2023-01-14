/* eslint-disable no-bitwise */

/*
The SegaCD file format isn't published anywhere I'm aware of. It's written to and read from by the Sega CD BIOS,
and so emulators, flash carts, the mister, etc., just call functions in that BIOS and don't directly read or
alter the data.

It appears that the BIOS was reverse-engineered and an implementation of some functionality to manipulate the data was posted here:
https://github.com/superctr/buram/
*/

import SegaCdUtil from '../util/SegaCd';

const GENERATOR_POLYNOMIAL_REED_SOLOMON_8 = [87, 166, 113, 75, 198, 25, 167, 114, 76, 199, 26, 1]; // https://github.com/superctr/buram/blob/master/buram.c#L586
const GENERATOR_POLYNOMIAL_REED_SOLOMON_6 = [20, 58, 56, 18, 26, 6, 59, 57, 19, 27, 7, 1]; // https://github.com/superctr/buram/blob/master/buram.c#L587

const GALOIS_FIELD_TABLE_SIZE = 256;
const CRC_TABLE_SIZE = 256;

const DIRECTORY_SIZE = 0x40;
const DIRECTORY_REPEAT_COUNT = 4;

const DIRECTORY_FORMAT_OFFSET = 0x20;
const DIRECTORY_VOLUME_OFFSET = 0x00;
const DIRECTORY_NUM_FILES_OFFSET = 0x18;
const DIRECTORY_NUM_FREE_BLOCKS_OFFSET = 0x10;

const DIRECTORY_ENTRY_SIZE = 0x20;

const BLOCK_SIZE = 0x40;

const TEXT_ENCODING = 'US-ASCII';
const VOLUME_LENGTH = 11;
const FORMAT_LENGTH = 11;
const MEDIA_ID_LENGTH = 16;

// https://github.com/superctr/buram/blob/master/buram.c#L85
function initReedSolomon(poly, bitsPerSymbol, generatorPolynomial) {
  const symbolsPerBlock = (1 << bitsPerSymbol) - 1;

  const galoisFieldIndexOf = new Array(GALOIS_FIELD_TABLE_SIZE).fill(0);
  const galoisFieldAlphaTo = new Array(GALOIS_FIELD_TABLE_SIZE).fill(0);

  let sr = 1;

  for (let i = 1; i <= symbolsPerBlock; i += 1) {
    galoisFieldIndexOf[sr] = i;
    galoisFieldAlphaTo[i] = sr;

    sr <<= 1;

    if ((sr & (1 << bitsPerSymbol)) !== 0) {
      sr ^= poly;
    }

    i += 1;
  }

  return {
    bitsPerSymbol,
    symbolsPerBlock,
    generatorPolynomial,
    galoisFieldIndexOf,
    galoisFieldAlphaTo,
  };
}

// https://github.com/superctr/buram/blob/master/buram.c#L183
function initCrcTable() {
  const crcTable = new Array(CRC_TABLE_SIZE).fill(0);
  // FIXME: missing code here, but can prob replace with a library?
  return crcTable;
}

// Based on https://github.com/superctr/buram/blob/master/buram.c#L886
function decodeText(arrayBuffer, offset, length) {
  const textDecoder = new TextDecoder(TEXT_ENCODING);
  const rawText = textDecoder.decode(arrayBuffer.slice(offset, offset + length));
  const text = rawText.replace(/(?!([A-Z]|[0-9]|\*))./g, '_'); // Anything other than A-Z, 0-9, or * is replaced with a _

  return text.replace(/_*$/g, ''); // Remove trailing _'s. This will remove all trailing _'s, so that the string '_____' -> ''. The implementation linked above will turn it into '_' (leaving a single underscore), which I'm not actually sure is more correct
}

// Taken from https://github.com/superctr/buram/blob/master/buram.c#L470
function readRepeatCode(arrayBuffer, offsetFromDirectory, repeatCount) {
  const startOffset = arrayBuffer.byteLength - DIRECTORY_SIZE + offsetFromDirectory;
  const uint8Array = new Uint8Array(arrayBuffer);
  const buffer = new Uint16Array(repeatCount);

  let currentOffset = startOffset;

  for (let i = 0; i < repeatCount; i += 1) {
    buffer[i] = ((uint8Array[currentOffset] << 8) | uint8Array[currentOffset + 1]);
    currentOffset += 2;
  }

  for (let i = 0; i < (repeatCount / 2); i += 1) {
    let repeats = 0;

    for (let j = i + 1; j < repeatCount; j += 1) {
      if (buffer[i] === buffer[j]) {
        repeats += 1;
      }
    }

    if (repeats > (repeatCount / 2)) {
      return buffer[i];
    }
  }

  throw new Error(`Unable to find repeat code at offset from directory 0x${offsetFromDirectory.toString(16)}`);
}

// This is based on https://github.com/superctr/buram/blob/master/buram.c#L433
// (but without the optimization of cacheing the last accessed buffer)
function decodeBuffer(arrayBuffer, offset) {
  const block = arrayBuffer.slice(offset, offset + BLOCK_SIZE);
  
}

// This is based on https://github.com/superctr/buram/blob/master/buram.c#L820
// which is called by https://github.com/superctr/buram/blob/master/buram.c#L1013
function readSaveFiles(arrayBuffer, numSaveFiles) {
  const directoryOffset = arrayBuffer.byteLength - DIRECTORY_SIZE;
  let currentOffset = directoryOffset - DIRECTORY_ENTRY_SIZE;

  for (let i = 0; i < numSaveFiles; i += 1) {
    const decodedBuffer = decodeBuffer(arrayBuffer, currentOffset);

    // The first part of the directory entry is the filename in ASCII so temporarily let's print the whole thing to see if we decoded the buffer correctly
    const textDecoder = new TextDecoder('US-ASCII');
    const bufferAsAscii = textDecoder.decode(decodedBuffer);

    console.log(`Decoded buffer into '${bufferAsAscii}'`);
  }
}

export default class SegaCdSaveData {
  static createFromSegaCdData(segaCdArrayBuffer) {
    return new SegaCdSaveData(segaCdArrayBuffer);
  }

  static createFromSaveFiles(saveFiles) {
    this.saveFiles = saveFiles;
  }

  // This constructor creates a new object from a binary representation of Sega CD save data
  constructor(arrayBuffer) {
    // Begin by initializing the context
    // https://github.com/superctr/buram/blob/master/buram.c#L584

    this.reedSolomon8 = initReedSolomon(0x1D, 8, GENERATOR_POLYNOMIAL_REED_SOLOMON_8);
    this.reedSolomon6 = initReedSolomon(3, 6, GENERATOR_POLYNOMIAL_REED_SOLOMON_6);
    this.crcTable = initCrcTable();

    const segaCdArrayBuffer = SegaCdUtil.truncateToActualSize(arrayBuffer);

    const numSaveFiles = readRepeatCode(arrayBuffer, DIRECTORY_NUM_FILES_OFFSET, DIRECTORY_REPEAT_COUNT);

    this.saveFiles = readSaveFiles(segaCdArrayBuffer, numSaveFiles);
    this.numFreeBlocks = readRepeatCode(arrayBuffer, DIRECTORY_NUM_FREE_BLOCKS_OFFSET, DIRECTORY_REPEAT_COUNT);
    this.format = decodeText(segaCdArrayBuffer, segaCdArrayBuffer.byteLength - DIRECTORY_SIZE + DIRECTORY_FORMAT_OFFSET, FORMAT_LENGTH);
    this.volume = decodeText(segaCdArrayBuffer, segaCdArrayBuffer.byteLength - DIRECTORY_SIZE + DIRECTORY_VOLUME_OFFSET, VOLUME_LENGTH);
    this.mediaId = decodeText(segaCdArrayBuffer, segaCdArrayBuffer.byteLength - MEDIA_ID_LENGTH, MEDIA_ID_LENGTH);
    this.arrayBuffer = segaCdArrayBuffer;
  }

  getSaveFiles() {
    return this.saveFiles;
  }

  getNumFreeBlocks() {
    return this.numFreeBlocks;
  }

  getFormat() {
    return this.format;
  }

  getVolume() {
    return this.volume;
  }

  getMediaId() {
    return this.mediaId;
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
