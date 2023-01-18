/* eslint-disable no-bitwise */

/*
The SegaCD file format isn't published anywhere I'm aware of. It's written to and read from by the Sega CD BIOS,
and so emulators, flash carts, the mister, etc., just call functions in that BIOS and don't directly read or
alter the data.

It appears that the BIOS was reverse-engineered and an implementation of some functionality to manipulate the data was posted here:
https://github.com/superctr/buram/
*/

import calcCrc16 from './Crc16'; // eslint-disable-line
import SegaCdUtil from '../../util/SegaCd';
// import reedsolomon from '../../lib/reedsolomon-js/reedsolomon';

const LITTLE_ENDIAN = false;

const GENERATOR_POLYNOMIAL_REED_SOLOMON_8 = [87, 166, 113, 75, 198, 25, 167, 114, 76, 199, 26, 1]; // https://github.com/superctr/buram/blob/master/buram.c#L586
const GENERATOR_POLYNOMIAL_REED_SOLOMON_6 = [20, 58, 56, 18, 26, 6, 59, 57, 19, 27, 7, 1]; // https://github.com/superctr/buram/blob/master/buram.c#L587

const GALOIS_FIELD_TABLE_SIZE = 256;

const DIRECTORY_SIZE = 0x40;
const DIRECTORY_REPEAT_COUNT = 4;

const DIRECTORY_FORMAT_OFFSET = 0x20;
const DIRECTORY_VOLUME_OFFSET = 0x00;
const DIRECTORY_NUM_FILES_OFFSET = 0x18;
const DIRECTORY_NUM_FREE_BLOCKS_OFFSET = 0x10;

const DIRECTORY_ENTRY_SIZE = 0x20; // Half a block
const DIRECTORY_ENTRY_FILENAME_OFFSET = 0;
const DIRECTORY_ENTRY_FILENAME_LENGTH = 11;
const DIRECTORY_ENTRY_FILE_DATA_IS_ENCODED_OFFSET = 11;
const DIRECTORY_ENTRY_FILE_DATA_START_BLOCK_OFFSET = 12;
const DIRECTORY_ENTRY_FILE_SIZE_OFFSET = 14;

const BLOCK_SIZE = 0x40;
// const SUB_BLOCK_SIZE = 0x08; // A block is made up of sub-blocks, which are interleaved and encoded with Reed-Solomon
// const NUM_SUB_BLOCKS = BLOCK_SIZE / SUB_BLOCK_SIZE;

// const REED_SOLOMON_DATA_SIZE = 0x06; // Within a sub-block, this many bytes are the actual data
// const REED_SOLOMON_PARITY_SIZE = SUB_BLOCK_SIZE - REED_SOLOMON_DATA_SIZE; // Within a sub-block, this many bytes are the parity data

// When deinterleaved, a block becomes 36 bytes of data where the first 2 and last 2 bytes are CRC information
const BLOCK_DATA_BEGIN_OFFSET = 2;
const BLOCK_DATA_SIZE = 32;
const BLOCK_CRC_1_OFFSET = 0;
const BLOCK_CRC_2_OFFSET = BLOCK_DATA_BEGIN_OFFSET + BLOCK_DATA_SIZE;

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

/*
// Based on https://github.com/superctr/buram/blob/master/buram.c#L329
// Deinterleave the 8-bit Reed-Solomon code so that parity bits are at the bottom
function deinterleaveReedSolomon8(subBlockNum, blockArrayBuffer) {
  const blockUint8Array = new Uint8Array(blockArrayBuffer);

  const outArrayBuffer = new ArrayBuffer(SUB_BLOCK_SIZE);
  const outUint8Array = new Uint8Array(outArrayBuffer);

  outUint8Array.fill(0);

  for (let i = 0; i < SUB_BLOCK_SIZE; i += 1) {
    let tmp = blockUint8Array[subBlockNum + (i * 8)];

    for (let j = 0; j < SUB_BLOCK_SIZE; j += 1) {
      outUint8Array[j] = (outUint8Array[j] << 1) | (tmp >> 7); // Here in the reference code it appears to depend on uninitialized data. We explicily initialize it to 0
      tmp <<= 1;
    }
  }

  return outArrayBuffer;
}
*/

// Based on https://github.com/superctr/buram/blob/master/buram.c#L228
// Deinterleave 36 bytes of data from 48 bytes
function deinterleaveData(inputBlockArrayBuffer) {
  const inputBlockUint8Array = new Uint8Array(inputBlockArrayBuffer);
  let inputCurrentOffset = 0;

  const outputArrayBuffer = new ArrayBuffer(BLOCK_SIZE);
  const outputUint8Array = new Uint8Array(outputArrayBuffer);
  let outputCurrentOffset = 0;

  for (let i = 0; i < 12; i += 1) {
    let sr = inputBlockUint8Array[inputCurrentOffset];
    inputCurrentOffset += 1;

    sr <<= 6;

    sr = (sr & 0xFF00) | inputBlockUint8Array[inputCurrentOffset];
    inputCurrentOffset += 1;

    outputUint8Array[outputCurrentOffset] = (sr >> 6);
    outputCurrentOffset += 1;

    sr <<= 6;

    sr = (sr & 0xFF00) | inputBlockUint8Array[inputCurrentOffset];
    inputCurrentOffset += 1;

    outputUint8Array[outputCurrentOffset] = (sr >> 4);
    outputCurrentOffset += 1;

    sr <<= 6;

    sr = (sr & 0xFF00) | inputBlockUint8Array[inputCurrentOffset];
    inputCurrentOffset += 1;

    outputUint8Array[outputCurrentOffset] = (sr >> 2);
    outputCurrentOffset += 1;
  }

  return outputArrayBuffer;
}

// FIXME: Deinterleave the data, perform Reed-Solomon error correction, then re-interleave it again
function getErrorCorrectedData(inputBlockArrayBuffer) {
  /*
  const reedSolomon = new reedsolomon.ReedSolomonDecoder(reedsolomon.GenericGF.AZTEC_DATA_8());
  */

  /*
  // Perform error correction on the data

  let flags = 0;

  for (let i = 0; i < NUM_SUB_BLOCKS; i += 1) {
    const deinterleavedBlockBuffer = deinterleaveReedSolomon8(i, block);
    const decodedBlockBuffer = reedSolomon.decode(deinterleavedBlockBuffer, REED_SOLOMON_PARITY_SIZE);
    const interleavedBlockBuffer = interleaveReedSolomon8(decodedBlockBuffer);

    // FIXME: Fill in interleavedBlockBuffer back into the input arrayBuffer
  }
  */

  return inputBlockArrayBuffer;
}

// Check if the deinterleaved block is corrupted or not. The 2 check CRCs appear to be for redundancy
function checkCrc(deinterleavedBlockArrayBuffer) {
  const dataView = new DataView(deinterleavedBlockArrayBuffer);

  const checkCrc1 = dataView.getUint16(BLOCK_CRC_1_OFFSET, LITTLE_ENDIAN);
  const checkCrc2 = ~(dataView.getUint16(BLOCK_CRC_2_OFFSET, LITTLE_ENDIAN));

  const crc = calcCrc16(deinterleavedBlockArrayBuffer.slice(BLOCK_DATA_BEGIN_OFFSET, BLOCK_DATA_BEGIN_OFFSET + BLOCK_DATA_SIZE));

  if ((crc !== checkCrc1) && (crc !== checkCrc2)) {
    throw new Error(`Data appears to be corrupt: found CRC 0x${crc.toString(16)} rather than 0x${checkCrc1.toString(16)} or 0x${checkCrc2.toString(16)}`);
  }
}

// This is based on https://github.com/superctr/buram/blob/master/buram.c#L433
// (but without the optimization of cacheing the last accessed buffer)
// and https://github.com/superctr/buram/blob/master/buram.c#L377
//
// Note that it works differently than the reference implemnentation by first checking the CRC
// and only if that fails then trying to use error-correction on the data
function decodeBuffer(arrayBuffer, offset) {
  const alignedOffset = offset & -(BLOCK_SIZE);

  const block = arrayBuffer.slice(alignedOffset, alignedOffset + BLOCK_SIZE);

  let outputArrayBuffer = deinterleaveData(block);

  try {
    checkCrc(outputArrayBuffer);
  } catch (e) {
    const correctedBlock = getErrorCorrectedData(block);
    outputArrayBuffer = deinterleaveData(correctedBlock);
    checkCrc(outputArrayBuffer); // If this one doesn't work, then throw an error to our caller
  }

  return outputArrayBuffer.slice(BLOCK_DATA_BEGIN_OFFSET + ((offset ^ alignedOffset) >> 1), BLOCK_DATA_BEGIN_OFFSET + BLOCK_DATA_SIZE);
}

// This is based on https://github.com/superctr/buram/blob/master/buram.c#L820
// which is called by https://github.com/superctr/buram/blob/master/buram.c#L1013
function readSaveFiles(arrayBuffer, numSaveFiles) {
  const saveFiles = [];

  const textDecoder = new TextDecoder(TEXT_ENCODING);

  const directoryOffset = arrayBuffer.byteLength - DIRECTORY_SIZE;
  let currentOffset = directoryOffset - DIRECTORY_ENTRY_SIZE;

  for (let i = 0; i < numSaveFiles; i += 1) {
    const decodedBuffer = decodeBuffer(arrayBuffer, currentOffset);
    const decodedBufferDataView = new DataView(decodedBuffer);

    saveFiles.push({
      filename: textDecoder.decode(decodedBuffer.slice(DIRECTORY_ENTRY_FILENAME_OFFSET, DIRECTORY_ENTRY_FILENAME_OFFSET + DIRECTORY_ENTRY_FILENAME_LENGTH)),
      dataIsEncoded: (decodedBufferDataView.getUint8(DIRECTORY_ENTRY_FILE_DATA_IS_ENCODED_OFFSET) !== 0),
      startBlockNumber: decodedBufferDataView.getUint16(DIRECTORY_ENTRY_FILE_DATA_START_BLOCK_OFFSET, LITTLE_ENDIAN),
      fileSize: decodedBufferDataView.getUint16(DIRECTORY_ENTRY_FILE_SIZE_OFFSET, LITTLE_ENDIAN),
    });

    currentOffset -= DIRECTORY_ENTRY_SIZE;
  }

  return saveFiles;
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

    const segaCdArrayBuffer = SegaCdUtil.truncateToActualSize(arrayBuffer);

    const numSaveFiles = readRepeatCode(segaCdArrayBuffer, DIRECTORY_NUM_FILES_OFFSET, DIRECTORY_REPEAT_COUNT);

    this.saveFiles = readSaveFiles(segaCdArrayBuffer, numSaveFiles);
    this.numFreeBlocks = readRepeatCode(segaCdArrayBuffer, DIRECTORY_NUM_FREE_BLOCKS_OFFSET, DIRECTORY_REPEAT_COUNT);
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
