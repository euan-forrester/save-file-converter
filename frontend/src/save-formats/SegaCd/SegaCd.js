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
import Util from '../../util/util';
// import reedsolomon from '../../lib/reedsolomon-js/reedsolomon';

const LITTLE_ENDIAN = false;

const GENERATOR_POLYNOMIAL_REED_SOLOMON_8 = [87, 166, 113, 75, 198, 25, 167, 114, 76, 199, 26, 1]; // https://github.com/superctr/buram/blob/master/buram.c#L586
const GENERATOR_POLYNOMIAL_REED_SOLOMON_6 = [20, 58, 56, 18, 26, 6, 59, 57, 19, 27, 7, 1]; // https://github.com/superctr/buram/blob/master/buram.c#L587

const GALOIS_FIELD_TABLE_SIZE = 256;

const DIRECTORY_SIZE = 0x40;

const DIRECTORY_FORMAT_OFFSET = 0x20;
const DIRECTORY_VOLUME_OFFSET = 0x00;

const DIRECTORY_ENTRY_SIZE_ENCODED = 0x20; // Half a block
const DIRECTORY_ENTRY_SIZE_PLAINTEXT = DIRECTORY_ENTRY_SIZE_ENCODED / 2; // Encoding doubles the size
const DIRECTORY_ENTRY_FILENAME_OFFSET = 0;
const DIRECTORY_ENTRY_FILENAME_LENGTH = 11;
const DIRECTORY_ENTRY_FILE_DATA_IS_ENCODED_OFFSET = 11;
const DIRECTORY_ENTRY_FILE_DATA_START_BLOCK_OFFSET = 12;
const DIRECTORY_ENTRY_FILE_SIZE_OFFSET = 14;

const BLOCK_SIZE = 0x40;
const SUB_BLOCK_SIZE = 0x08; // A block is made up of sub-blocks, which are interleaved and encoded with Reed-Solomon
const NUM_SUB_BLOCKS = BLOCK_SIZE / SUB_BLOCK_SIZE;

// const REED_SOLOMON_DATA_SIZE = 0x06; // Within a sub-block, this many bytes are the actual data
// const REED_SOLOMON_PARITY_SIZE = SUB_BLOCK_SIZE - REED_SOLOMON_DATA_SIZE; // Within a sub-block, this many bytes are the parity data

// When deinterleaved, a block becomes 36 bytes of data where the first 2 and last 2 bytes are CRC information
const BLOCK_DATA_BEGIN_OFFSET = 2;
const BLOCK_DATA_SIZE = 32;
const BLOCK_CRC_1_OFFSET = 0;
const BLOCK_CRC_2_OFFSET = BLOCK_DATA_BEGIN_OFFSET + BLOCK_DATA_SIZE;
const BLOCK_TOTAL_CRC_SIZE = 4; // 2 x 16 bit CRCs

const REED_SOLOMON_6_LAST_DATA_BYTE = [0x2d, 0x2e, 0x2f, 0x08, 0x11, 0x1a, 0x23, 0x2c];

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

function sanitizeText(rawText) {
  return rawText.replace(/(?!([A-Z]|[0-9]|\*))./g, '_'); // Anything other than A-Z, 0-9, or * is replaced with a _
}

// Based on https://github.com/superctr/buram/blob/master/buram.c#L886
function decodeText(arrayBuffer, offset, length) {
  const textDecoder = new TextDecoder(TEXT_ENCODING);
  const rawText = textDecoder.decode(arrayBuffer.slice(offset, offset + length));
  const text = sanitizeText(rawText);

  return text.replace(/_*$/g, ''); // Remove trailing _'s. This will remove all trailing _'s, so that the string '_____' -> ''. The implementation linked above will turn it into '_' (leaving a single underscore), which I'm not actually sure is more correct
}

function encodeText(text, length) {
  const textEncoder = new TextEncoder(TEXT_ENCODING);
  const sanitizedText = sanitizeText(text.toUpperCase());

  return textEncoder.encode(sanitizedText).slice(0, length);
}

// Based on https://github.com/superctr/buram/blob/master/buram.c#L228
// Deinterleave 36 bytes of data from 48 bytes
function deinterleaveData(inputBlockArrayBuffer) {
  const inputBlockUint8Array = new Uint8Array(inputBlockArrayBuffer);
  let inputCurrentOffset = 0;

  const outputArrayBuffer = new ArrayBuffer((BLOCK_SIZE / 2) + BLOCK_TOTAL_CRC_SIZE);
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

// Based on https://github.com/superctr/buram/blob/master/buram.c#L208
// Interleave 36 bytes of data into 48 bytes
function interleaveData(inputBlockArrayBuffer) {
  const inputBlockUint8Array = new Uint8Array(inputBlockArrayBuffer);
  let inputCurrentOffset = 0;

  const outputArrayBuffer = new ArrayBuffer(BLOCK_SIZE);
  const outputUint8Array = new Uint8Array(outputArrayBuffer);
  let outputCurrentOffset = 0;

  for (let i = 0; i < 12; i += 1) {
    let sr = inputBlockUint8Array[inputCurrentOffset];
    inputCurrentOffset += 1;

    outputUint8Array[outputCurrentOffset] = sr;
    outputCurrentOffset += 1;

    sr <<= 8;

    sr |= inputBlockUint8Array[inputCurrentOffset];
    inputCurrentOffset += 1;

    outputUint8Array[outputCurrentOffset] = (sr >> 2);
    outputCurrentOffset += 1;

    sr <<= 8;

    sr |= inputBlockUint8Array[inputCurrentOffset];
    inputCurrentOffset += 1;

    outputUint8Array[outputCurrentOffset] = (sr >> 4);
    outputCurrentOffset += 1;

    outputUint8Array[outputCurrentOffset] = (sr << 2);
    outputCurrentOffset += 1;
  }

  return outputArrayBuffer;
}

/*
// FIXME: Deinterleave the data, perform Reed-Solomon error correction, then re-interleave it again
function getErrorCorrectedData(inputBlockArrayBuffer) {
  const reedSolomon = new reedsolomon.ReedSolomonDecoder(reedsolomon.GenericGF.AZTEC_DATA_8());

  // Perform error correction on the data

  let flags = 0;

  for (let i = 0; i < NUM_SUB_BLOCKS; i += 1) {
    const deinterleavedBlockBuffer = deinterleaveReedSolomon8(i, block);
    const decodedBlockBuffer = reedSolomon.decode(deinterleavedBlockBuffer, REED_SOLOMON_PARITY_SIZE);
    const interleavedBlockBuffer = interleaveReedSolomon8(decodedBlockBuffer);

    // FIXME: Fill in interleavedBlockBuffer back into the input arrayBuffer
  }

}
*/

// Interleave the 8-bit Reed-Solomon code
// Based on https://github.com/superctr/buram/blob/master/buram.c#L313
function interleaveReedSolomon8(subBlockIndex, deinterleavedSubBlockArrayBuffer, blockArrayBuffer) {
  const outputBlock = Util.copyArrayBuffer(blockArrayBuffer);
  const outputUint8Array = new Uint8Array(outputBlock);

  const inputUint8Array = new Uint8Array(deinterleavedSubBlockArrayBuffer);

  for (let i = 0; i < SUB_BLOCK_SIZE; i += 1) {
    let temp = inputUint8Array[i];

    for (let j = 0; j < SUB_BLOCK_SIZE; j += 1) {
      const outputIndex = subBlockIndex + (j * SUB_BLOCK_SIZE);
      outputUint8Array[outputIndex] = (((outputUint8Array[outputIndex] << 1) & 0xFF) | (temp >> 7));
      temp = (temp << 1) & 0xFF;
    }
  }

  return outputBlock;
}

// Deinterleave the 8-bit Reed-Solomon code so that parity bits are at the bottom
// Based on https://github.com/superctr/buram/blob/master/buram.c#L329
function deinterleaveReedSolomon8(subBlockIndex, blockArrayBuffer) {
  const outputSubBlock = Util.getFilledArrayBuffer(SUB_BLOCK_SIZE, 0);
  const outputUint8Array = new Uint8Array(outputSubBlock);

  const blockUint8Array = new Uint8Array(blockArrayBuffer);

  for (let i = 0; i < SUB_BLOCK_SIZE; i += 1) {
    let temp = blockUint8Array[subBlockIndex + (i * SUB_BLOCK_SIZE)];

    for (let j = 0; j < SUB_BLOCK_SIZE; j += 1) {
      outputUint8Array[j] = (((outputUint8Array[j] << 1) & 0xFF) | (temp >> 7));
      temp = (temp << 1) & 0xFF;
    }
  }

  return outputSubBlock;
}

// Interleave the 6-bit Reed-Solomon code
// Based on https://github.com/superctr/buram/blob/master/buram.c#L267
function interleaveReedSolomon6(subBlockIndex, deinterleavedSubBlockArrayBuffer, blockArrayBuffer) {
  const outputBlock = Util.copyArrayBuffer(blockArrayBuffer);
  const outputUint8Array = new Uint8Array(outputBlock);

  const inputUint8Array = new Uint8Array(deinterleavedSubBlockArrayBuffer);

  for (let i = 0; i < 5; i += 1) {
    outputUint8Array[subBlockIndex + (i * 9)] = inputUint8Array[i] << 2;
  }

  outputUint8Array[REED_SOLOMON_6_LAST_DATA_BYTE[subBlockIndex]] = inputUint8Array[5] << 2;
  outputUint8Array[0x30 + subBlockIndex] = inputUint8Array[6] << 2;
  outputUint8Array[0x38 + subBlockIndex] = inputUint8Array[7] << 2;

  return outputBlock;
}

// Deinterleave the 6-bit Reed-Solomon code so that parity bits are at the bottom
// Based on https://github.com/superctr/buram/blob/master/buram.c#L280
function deinterleaveReedSolomon6(subBlockIndex, blockArrayBuffer) {
  const outputSubBlock = Util.getFilledArrayBuffer(SUB_BLOCK_SIZE, 0);
  const outputUint8Array = new Uint8Array(outputSubBlock);

  const blockUint8Array = new Uint8Array(blockArrayBuffer);

  for (let i = 0; i < 5; i += 1) {
    outputUint8Array[i] = blockUint8Array[subBlockIndex + (i * 9)] >> 2;
  }

  outputUint8Array[5] = blockUint8Array[REED_SOLOMON_6_LAST_DATA_BYTE[subBlockIndex]] >> 2;
  outputUint8Array[6] = blockUint8Array[0x30 + subBlockIndex] >> 2;
  outputUint8Array[7] = blockUint8Array[0x38 + subBlockIndex] >> 2;

  return outputSubBlock;
}

// Perform error correction on the block
// Based on https://github.com/superctr/buram/blob/master/buram.c#L377
function getErrorCorrectedData(blockArrayBuffer) {
  let correctedBlockArrayBuffer = Util.copyArrayBuffer(blockArrayBuffer);

  for (let subBlockIndex = 0; subBlockIndex < NUM_SUB_BLOCKS; subBlockIndex += 1) {
    const deinterleavedSubBlock = deinterleaveReedSolomon8(subBlockIndex, correctedBlockArrayBuffer);
    correctedBlockArrayBuffer = interleaveReedSolomon8(subBlockIndex, deinterleavedSubBlock, correctedBlockArrayBuffer);
  }

  for (let subBlockIndex = 0; subBlockIndex < NUM_SUB_BLOCKS; subBlockIndex += 1) {
    const deinterleavedSubBlock = deinterleaveReedSolomon6(subBlockIndex, correctedBlockArrayBuffer);
    correctedBlockArrayBuffer = interleaveReedSolomon6(subBlockIndex, deinterleavedSubBlock, correctedBlockArrayBuffer);
  }

  return correctedBlockArrayBuffer;
}

// Check if the deinterleaved block is corrupted or not. The 2 check CRCs appear to be for redundancy
function checkCrc(deinterleavedBlockArrayBuffer) {
  const dataView = new DataView(deinterleavedBlockArrayBuffer);

  const checkCrc1 = dataView.getUint16(BLOCK_CRC_1_OFFSET, LITTLE_ENDIAN);
  const checkCrc2 = 0xFFFF & (~(dataView.getUint16(BLOCK_CRC_2_OFFSET, LITTLE_ENDIAN)) >>> 0); // Convert to unsigned and cut off anything beyond the low 16 bits

  const crc = calcCrc16(deinterleavedBlockArrayBuffer.slice(BLOCK_DATA_BEGIN_OFFSET, BLOCK_DATA_BEGIN_OFFSET + BLOCK_DATA_SIZE));

  if ((crc !== checkCrc1) && (crc !== checkCrc2)) {
    throw new Error(`Data appears to be corrupt: calculated CRC 0x${crc.toString(16)} rather than 0x${checkCrc1.toString(16)} or 0x${checkCrc2.toString(16)}`);
  }
}

// This is based on https://github.com/superctr/buram/blob/master/buram.c#L433
// (but without the optimization of cacheing the last accessed buffer)
// and https://github.com/superctr/buram/blob/master/buram.c#L377
//
// Note that it works differently than the reference implemnentation by first checking the CRC
// and only if that fails then trying to use error-correction on the data
function decodeBlock(arrayBuffer, offset) {
  const alignedOffset = offset & -(BLOCK_SIZE);

  const block = arrayBuffer.slice(alignedOffset, alignedOffset + BLOCK_SIZE);

  const correctedBlock2 = getErrorCorrectedData(block); // FIXME: Remove this

  let outputArrayBuffer = deinterleaveData(correctedBlock2/* block */);

  try {
    checkCrc(outputArrayBuffer);
  } catch (e) {
    const correctedBlock = getErrorCorrectedData(block);
    outputArrayBuffer = deinterleaveData(correctedBlock);
    checkCrc(outputArrayBuffer); // If this one doesn't work, then throw an error to our caller
  }

  return outputArrayBuffer.slice(BLOCK_DATA_BEGIN_OFFSET + ((offset ^ alignedOffset) >> 1), BLOCK_DATA_BEGIN_OFFSET + BLOCK_DATA_SIZE);
}

// Based on https://github.com/superctr/buram/blob/master/buram.c#L449 (again with no optimization
// of cacheing the last accessed block)
function encodeBlock(destinationArrayBuffer, sourceArrayBuffer, destinationOffset) {
  if (sourceArrayBuffer.byteLength !== (BLOCK_SIZE / 2)) {
    throw new Error(`Unable to encode block of length ${sourceArrayBuffer.byteLength} bytes, block must be ${BLOCK_SIZE / 2} bytes`);
  }

  // Calculate the CRC and make an ArrayBuffer with the data and CRCs in the correct place

  const crc = calcCrc16(sourceArrayBuffer);

  let writeArrayBuffer = new ArrayBuffer(sourceArrayBuffer.byteLength + BLOCK_TOTAL_CRC_SIZE);
  const writeDataView = new DataView(writeArrayBuffer);

  writeDataView.setUint16(BLOCK_CRC_1_OFFSET, crc, LITTLE_ENDIAN);
  writeDataView.setUint16(BLOCK_CRC_2_OFFSET, ~crc >>> 0, LITTLE_ENDIAN);

  writeArrayBuffer = Util.setArrayBufferPortion(writeArrayBuffer, sourceArrayBuffer, BLOCK_CRC_1_OFFSET + 2, 0, sourceArrayBuffer.byteLength);

  // Now interleave the data and write it to the destination

  const interleavedArrayBuffer = interleaveData(writeArrayBuffer);

  return Util.setArrayBufferPortion(destinationArrayBuffer, interleavedArrayBuffer, destinationOffset, 0, interleavedArrayBuffer.byteLength);
}

// This is based on https://github.com/superctr/buram/blob/master/buram.c#L820
// which is called by https://github.com/superctr/buram/blob/master/buram.c#L1013
function readSaveFiles(arrayBuffer, numSaveFiles) {
  const saveFiles = [];

  const directoryOffset = arrayBuffer.byteLength - DIRECTORY_SIZE;
  let currentOffsetInDirectory = directoryOffset - DIRECTORY_ENTRY_SIZE_ENCODED;

  for (let i = 0; i < numSaveFiles; i += 1) {
    const decodedBuffer = decodeBlock(arrayBuffer, currentOffsetInDirectory);
    const decodedBufferDataView = new DataView(decodedBuffer);

    const dataIsEncoded = (decodedBufferDataView.getUint8(DIRECTORY_ENTRY_FILE_DATA_IS_ENCODED_OFFSET) !== 0);
    const startBlockNumber = decodedBufferDataView.getUint16(DIRECTORY_ENTRY_FILE_DATA_START_BLOCK_OFFSET, LITTLE_ENDIAN);
    const fileSizeBlocks = decodedBufferDataView.getUint16(DIRECTORY_ENTRY_FILE_SIZE_OFFSET, LITTLE_ENDIAN);

    let fileData = null;

    const fileDataStartOffset = startBlockNumber * BLOCK_SIZE;

    if (dataIsEncoded) {
      const fileDataDecodedBlocks = [];
      let currentOffsetInFile = fileDataStartOffset;

      for (let blockNum = 0; blockNum < fileSizeBlocks; blockNum += 1) {
        fileDataDecodedBlocks.push(decodeBlock(arrayBuffer, currentOffsetInFile));
        currentOffsetInFile += BLOCK_SIZE;
      }

      fileData = Util.concatArrayBuffers(fileDataDecodedBlocks);
    } else {
      fileData = arrayBuffer.slice(fileDataStartOffset, fileDataStartOffset + (fileSizeBlocks * BLOCK_SIZE));
    }

    saveFiles.push({
      filename: decodeText(decodedBuffer, DIRECTORY_ENTRY_FILENAME_OFFSET, DIRECTORY_ENTRY_FILENAME_LENGTH),
      dataIsEncoded,
      startBlockNumber,
      fileSizeBlocks,
      fileData,
    });

    currentOffsetInDirectory -= DIRECTORY_ENTRY_SIZE_ENCODED;
  }

  return saveFiles;
}

function getRequiredBlocks(saveFile) {
  const fileSizeBytes = saveFile.fileData.byteLength;
  const fileSizeRequiredBytes = saveFile.dataIsEncoded ? fileSizeBytes * 2 : fileSizeBytes; // When encoding the data we can only store 32 bytes of data in every 64 byte block

  return Math.ceil(fileSizeRequiredBytes / BLOCK_SIZE);
}

function getEmptyDirectoryEntry() {
  return Util.getFilledArrayBuffer(DIRECTORY_ENTRY_SIZE_PLAINTEXT, 0);
}

function getDirectoryEntry(saveFile, startingBlock) {
  const directoryEntry = new ArrayBuffer(DIRECTORY_ENTRY_SIZE_PLAINTEXT);
  const directoryEntryDataView = new DataView(directoryEntry);
  const directoryEntryUint8Array = new Uint8Array(directoryEntry);

  const encodedFilename = encodeText(saveFile.filename, DIRECTORY_ENTRY_FILENAME_LENGTH);
  const fileSizeRequiredBlocks = getRequiredBlocks(saveFile);

  directoryEntryUint8Array.set(encodedFilename, DIRECTORY_ENTRY_FILENAME_OFFSET);
  directoryEntryDataView.setUint8(DIRECTORY_ENTRY_FILE_DATA_IS_ENCODED_OFFSET, saveFile.dataIsEncoded ? 0xFF : 0x00); // https://github.com/superctr/buram/blob/master/buram.c#L1129
  directoryEntryDataView.setUint16(DIRECTORY_ENTRY_FILE_DATA_START_BLOCK_OFFSET, startingBlock, LITTLE_ENDIAN);
  directoryEntryDataView.setUint16(DIRECTORY_ENTRY_FILE_SIZE_OFFSET, fileSizeRequiredBlocks, LITTLE_ENDIAN);

  return directoryEntry;
}

// Based on https://github.com/superctr/buram/blob/master/buram.c#L766
function writeSaveFile(saveFile, startingBlock, segaCdArrayBuffer) {
  const fileSizeRequiredBlocks = getRequiredBlocks(saveFile);

  if (saveFile.dataIsEncoded) {
    let outputArrayBuffer = Util.copyArrayBuffer(segaCdArrayBuffer);

    for (let i = 0; i < fileSizeRequiredBlocks; i += 1) {
      const sourceBlockOffset = i * (BLOCK_SIZE / 2);
      const destinationBlockOffset = (startingBlock + i) * BLOCK_SIZE;

      outputArrayBuffer = encodeBlock(outputArrayBuffer, saveFile.fileData.slice(sourceBlockOffset, sourceBlockOffset + (BLOCK_SIZE / 2)), destinationBlockOffset);
    }

    return outputArrayBuffer;
  }

  return Util.setArrayBufferPortion(segaCdArrayBuffer, saveFile.fileData, startingBlock * BLOCK_SIZE, 0, saveFile.fileData.byteLength);
}

function getVolumeInfo(segaCdArrayBuffer) {
  return {
    numFreeBlocks: SegaCdUtil.getNumFreeBlocks(segaCdArrayBuffer),
    format: decodeText(segaCdArrayBuffer, segaCdArrayBuffer.byteLength - DIRECTORY_SIZE + DIRECTORY_FORMAT_OFFSET, FORMAT_LENGTH),
    volume: decodeText(segaCdArrayBuffer, segaCdArrayBuffer.byteLength - DIRECTORY_SIZE + DIRECTORY_VOLUME_OFFSET, VOLUME_LENGTH),
    mediaId: decodeText(segaCdArrayBuffer, segaCdArrayBuffer.byteLength - MEDIA_ID_LENGTH, MEDIA_ID_LENGTH),
  };
}

export default class SegaCdSaveData {
  static createFromSegaCdData(arrayBuffer) {
    const segaCdArrayBuffer = SegaCdUtil.truncateToActualSize(arrayBuffer);

    const numSaveFiles = SegaCdUtil.getNumFiles(segaCdArrayBuffer);
    const saveFiles = readSaveFiles(segaCdArrayBuffer, numSaveFiles);

    return new SegaCdSaveData(segaCdArrayBuffer, saveFiles);
  }

  static createFromSaveFiles(saveFiles, size) {
    // Setup and make sure we have enough space for the files

    let segaCdArrayBuffer = SegaCdUtil.makeEmptySave(size);
    const initialFreeBlocks = SegaCdUtil.getNumFreeBlocks(segaCdArrayBuffer);

    const requiredBlocksForSaves = saveFiles.reduce((accumulatedBlocks, saveFile) => accumulatedBlocks + getRequiredBlocks(saveFile), 0);
    const requiredBlocksForDirectoryEntries = Math.ceil(saveFiles.length / 2);

    const requiredBlocks = requiredBlocksForSaves + requiredBlocksForDirectoryEntries - 1; // FIXME: Another off-by-one error on the blocks, similar to resizing the save file

    if (requiredBlocks > initialFreeBlocks) {
      throw new Error(`The specified save files require a total of ${requiredBlocks} blocks of free space, but Sega CD save data of ${size} bytes only has ${initialFreeBlocks} free blocks`);
    }

    // Write the files

    let currentBlock = 1; // Block 0 is reserved
    const saveFilesOutput = [];
    const directoryEntries = [];

    saveFiles.forEach((saveFile) => {
      const fileSizeBlocks = getRequiredBlocks(saveFile);

      directoryEntries.push(getDirectoryEntry(saveFile, currentBlock));

      segaCdArrayBuffer = writeSaveFile(saveFile, currentBlock, segaCdArrayBuffer);

      saveFilesOutput.push({
        ...saveFile,
        startBlockNumber: currentBlock,
        fileSizeBlocks,
      });

      currentBlock += fileSizeBlocks;
    });

    // Combine our directory entries into half-blocks that can be encoded as full blocks

    if ((directoryEntries.length % 2) === 1) {
      directoryEntries.push(getEmptyDirectoryEntry());
    }

    const combinedDirectoryEntries = [];

    for (let i = 0; i < (directoryEntries.length / 2); i += 1) {
      combinedDirectoryEntries.push(Util.concatArrayBuffers([directoryEntries[(i * 2) + 1], directoryEntries[i * 2]])); // Directory entires are written in reverse order: they're read from the bottom up
    }

    combinedDirectoryEntries.forEach((combinedDirectoryEntry, index) => {
      const offset = segaCdArrayBuffer.byteLength - DIRECTORY_SIZE - (BLOCK_SIZE * (index + 1));

      segaCdArrayBuffer = encodeBlock(segaCdArrayBuffer, combinedDirectoryEntry, offset);
    });

    // Finish up

    const numFreeBlocks = initialFreeBlocks - requiredBlocks;

    SegaCdUtil.setNumFreeBlocks(segaCdArrayBuffer, numFreeBlocks);
    SegaCdUtil.setNumFiles(segaCdArrayBuffer, saveFiles.length);

    return new SegaCdSaveData(segaCdArrayBuffer, saveFilesOutput);
  }

  // This constructor creates a new object from a binary representation of Sega CD save data
  constructor(arrayBuffer, saveFiles) {
    // Begin by initializing the context
    // https://github.com/superctr/buram/blob/master/buram.c#L584

    this.reedSolomon8 = initReedSolomon(0x1D, 8, GENERATOR_POLYNOMIAL_REED_SOLOMON_8);
    this.reedSolomon6 = initReedSolomon(3, 6, GENERATOR_POLYNOMIAL_REED_SOLOMON_6);

    this.arrayBuffer = arrayBuffer;
    this.saveFiles = saveFiles;
    this.volumeInfo = getVolumeInfo(arrayBuffer);
  }

  getSaveFiles() {
    return this.saveFiles;
  }

  getNumFreeBlocks() {
    return this.volumeInfo.numFreeBlocks;
  }

  getFormat() {
    return this.volumeInfo.format;
  }

  getVolume() {
    return this.volumeInfo.volume;
  }

  getMediaId() {
    return this.volumeInfo.mediaId;
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
