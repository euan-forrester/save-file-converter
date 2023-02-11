/* eslint-disable no-bitwise */

/*
This is based on https://github.com/superctr/buram/

All manipulation of Sega CD saves is done via the BIOS, and emulators etc just make BIOS calls and don't manipulate the data directly.
It appears that the BIOS was reverse-engineered to create the above repo.

The file is broken up in to blocks of 64 bytes each. There is considerable redundancy and error correction throughout the data.

The first block is reserved. The repo above doesn't alter any data in this block, but the BIOS does. I don't know what it contains.

The last block is reserved for directory information: volume name, number of free blocks, number of save files, etc. The latter 2 values are written 4 times each.

Blocks may have error correction encoding applied to them. If applied, it takes the 64 byte block and uses only the first 48 bytes.
Those 48 bytes actually contain 36 bytes of data, plus error-correction parity information. The 36 bytes of data are actually 32 bytes
of data plus 2 16-bit CRCs to verify the integrety of the data. Thus, when error correction is applied to a block, 64 bytes actually holds 32 bytes of data.

Each of the 2 CRCs is the bitwise-NOT of the other. The CRC algorithm appears to be custom: I couldn't find a match in the library I tried.

From the perspective of the parity information, each 64 byte block is regarded as made up of 8-byte subblocks. Each subblock contains 6 bytes of data
and 2 bytes of parity information. The parity bytes are calculated by what appears to be a custom implementation of Reed-Solomon encoding. I was unable
to make an off-the-shelf Reed-Solomon library properly process the data.

The parity bytes are interleaved (twice) with the actual data. Each set of parity bytes allows for 1 byte to be corrected, and so I think the object
here is to allow for a 1-bit error in any byte of data. I didn't understand why there is both 6-bit and 8-bit Reed-Solomon encoding applied to the data.

The data for the contents of the files themselves is written in blocks from the start of the file (starting from block 1). It's just a concatenation of all of
the data from all of the files. File data may be encoded for error-correction or it may not be.

The file metadata (directory entries) is stored in half-blocks starting at the second-last block of the file and moving upwards towards the start of the file.
Thus, the two sets of data will eventually meet in the middle of the file. Each directory entry is 16 bytes of data long, and directory entries are encoded for
error-correction. Thus, 2 directory entries can fit in each block, and the entire block is used whether there are 1 or 2 entires in it (because the
data is interleaved)

Directory entries contain the filename, starting block number, length, and whether error correction encoding is applied to the file data.
*/

import calcCrc16 from './Crc16'; // eslint-disable-line
import SegaCdUtil from '../../util/SegaCd';
import Util from '../../util/util';
import reedSolomon from './ReedSolomon';

const LITTLE_ENDIAN = false;

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
  const sanitizedText = sanitizeText(text.toUpperCase()).padEnd(length, '_');

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
    const errorCorrectedSubBlock = reedSolomon.decode(deinterleavedSubBlock, 8);
    correctedBlockArrayBuffer = interleaveReedSolomon8(subBlockIndex, errorCorrectedSubBlock, correctedBlockArrayBuffer);
  }

  for (let subBlockIndex = 0; subBlockIndex < NUM_SUB_BLOCKS; subBlockIndex += 1) {
    const deinterleavedSubBlock = deinterleaveReedSolomon6(subBlockIndex, correctedBlockArrayBuffer);
    const errorCorrectedSubBlock = reedSolomon.decode(deinterleavedSubBlock, 6);
    correctedBlockArrayBuffer = interleaveReedSolomon6(subBlockIndex, errorCorrectedSubBlock, correctedBlockArrayBuffer);
  }

  return correctedBlockArrayBuffer;
}

// Based on https://github.com/superctr/buram/blob/master/buram.c#L345
function addErrorCorrectionData(blockArrayBuffer) {
  let correctedBlockArrayBuffer = Util.copyArrayBuffer(blockArrayBuffer);

  for (let subBlockIndex = 0; subBlockIndex < NUM_SUB_BLOCKS; subBlockIndex += 1) {
    const deinterleavedSubBlock = deinterleaveReedSolomon6(subBlockIndex, correctedBlockArrayBuffer);
    const errorCorrectedSubBlock = reedSolomon.encode(deinterleavedSubBlock, 6);
    correctedBlockArrayBuffer = interleaveReedSolomon6(subBlockIndex, errorCorrectedSubBlock, correctedBlockArrayBuffer);
  }

  for (let subBlockIndex = 0; subBlockIndex < NUM_SUB_BLOCKS; subBlockIndex += 1) {
    const deinterleavedSubBlock = deinterleaveReedSolomon8(subBlockIndex, correctedBlockArrayBuffer);
    const errorCorrectedSubBlock = reedSolomon.encode(deinterleavedSubBlock, 8);
    correctedBlockArrayBuffer = interleaveReedSolomon8(subBlockIndex, errorCorrectedSubBlock, correctedBlockArrayBuffer);
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
  const errorCorrectionDataArrayBuffer = addErrorCorrectionData(interleavedArrayBuffer);

  return Util.setArrayBufferPortion(destinationArrayBuffer, errorCorrectionDataArrayBuffer, destinationOffset, 0, errorCorrectionDataArrayBuffer.byteLength);
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
    const paddedInputArrayBuffer = Util.padArrayBuffer(saveFile.fileData, fileSizeRequiredBlocks * BLOCK_SIZE, 0x00);
    let outputArrayBuffer = Util.copyArrayBuffer(segaCdArrayBuffer);

    for (let i = 0; i < fileSizeRequiredBlocks; i += 1) {
      const sourceBlockOffset = i * (BLOCK_SIZE / 2);
      const destinationBlockOffset = (startingBlock + i) * BLOCK_SIZE;

      outputArrayBuffer = encodeBlock(outputArrayBuffer, paddedInputArrayBuffer.slice(sourceBlockOffset, sourceBlockOffset + (BLOCK_SIZE / 2)), destinationBlockOffset);
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
    const initialFreeBlocks = SegaCdUtil.getTotalAvailableBlocks(segaCdArrayBuffer); // If we call SegaCdUtil.getNumFreeBlocks() it will subtract one because of the extra block that's reserved for the first file's directory entry

    const requiredBlocksForSaves = saveFiles.reduce((accumulatedBlocks, saveFile) => accumulatedBlocks + getRequiredBlocks(saveFile), 0);
    const requiredBlocksForDirectoryEntries = Math.ceil(saveFiles.length / 2);
    const requiredReservedBlocks = ((saveFiles.length % 2) === 0) ? 1 : 0; // We can store 2 directory entries in a block. We always need room for the next future directory entry. So, if there are an odd number of save files we can store the next one in our last block. But if there are an even number of save files we need to reserve the next block

    const requiredBlocks = requiredBlocksForSaves + requiredBlocksForDirectoryEntries + requiredReservedBlocks;

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
