/* eslint no-bitwise: ["error", { "allow": ["&", "^"] }] */

import Ps1Basics from './Basics';

import Util from '../../../util/util';

const {
  LITTLE_ENDIAN,
  BLOCK_SIZE,
  NUM_DATA_BLOCKS,
  NUM_TOTAL_BLOCKS,
  FRAME_SIZE,
  MAGIC_ENCODING,
} = Ps1Basics;

// Header block

const HEADER_MAGIC = 'MC';
const MAGIC_OFFSET = 0;

// The header contains several mini-blocks called "directory frames", each of which has info about a block of data

const DIRECTORY_FRAME_AVAILABLE_OFFSET = 0x00;
const DIRECTORY_FRAME_NEXT_BLOCK_OFFSET = 0x08;
const DIRECTORY_FRAME_NO_NEXT_BLOCK = 0xFFFF;
const DIRECTORY_FRAME_FILENAME_OFFSET = 0x0A;
const DIRECTORY_FRAME_FILENAME_LENGTH = 20;
const DIRECTORY_FRAME_FILENAME_ENCODING = 'US-ASCII';
const DIRECTORY_FRAME_FILE_SIZE_OFFSET = 0x04;

// These flags are described in the 'available blocks table' here: https://www.psdevwiki.com/ps3/PS1_Savedata#PS1_Single_Save_.3F_.28.PSV.29
const DIRECTORY_FRAME_UNUSED_BLOCK = 0xA0;
const DIRECTORY_FRAME_FIRST_LINK_BLOCK = 0x51;
const DIRECTORY_FRAME_MIDDLE_LINK_BLOCK = 0x52;
const DIRECTORY_FRAME_LAST_LINK_BLOCK = 0x53;
const DIRECTORY_FRAME_UNUSABLE_BLOCK = 0xFF;

function getDirectoryFrame(headerArrayBuffer, blockNum) {
  const offset = FRAME_SIZE + (blockNum * FRAME_SIZE); // The first frame contains HEADER_MAGIC, so block 0 is at frame 1
  return headerArrayBuffer.slice(offset, offset + FRAME_SIZE);
}

function xorAllBytes(arrayBuffer) {
  const array = new Uint8Array(arrayBuffer);

  return array.reduce((acc, n) => acc ^ n, 0);
}

function createDirectoryFrame() {
  return Util.getFilledArrayBuffer(FRAME_SIZE, 0x00);
}

function createDirectoryFrameMagic() {
  const arrayBuffer = Util.setMagic(createDirectoryFrame(), MAGIC_OFFSET, HEADER_MAGIC, MAGIC_ENCODING);
  const dataView = new DataView(arrayBuffer);

  dataView.setUint8(FRAME_SIZE - 1, xorAllBytes(arrayBuffer));

  return arrayBuffer;
}

function createDirectoryFrameEmpty() {
  const arrayBuffer = createDirectoryFrame();
  const dataView = new DataView(arrayBuffer);

  dataView.setUint8(DIRECTORY_FRAME_AVAILABLE_OFFSET, DIRECTORY_FRAME_UNUSED_BLOCK);
  dataView.setUint16(DIRECTORY_FRAME_NEXT_BLOCK_OFFSET, DIRECTORY_FRAME_NO_NEXT_BLOCK, LITTLE_ENDIAN);

  dataView.setUint8(FRAME_SIZE - 1, xorAllBytes(arrayBuffer));

  return arrayBuffer;
}

function createDirectoryFrameUnused() {
  const arrayBuffer = createDirectoryFrame();
  const dataView = new DataView(arrayBuffer);

  dataView.setUint8(DIRECTORY_FRAME_AVAILABLE_OFFSET + 0, DIRECTORY_FRAME_UNUSABLE_BLOCK);
  dataView.setUint8(DIRECTORY_FRAME_AVAILABLE_OFFSET + 1, DIRECTORY_FRAME_UNUSABLE_BLOCK);
  dataView.setUint8(DIRECTORY_FRAME_AVAILABLE_OFFSET + 2, DIRECTORY_FRAME_UNUSABLE_BLOCK);
  dataView.setUint8(DIRECTORY_FRAME_AVAILABLE_OFFSET + 3, DIRECTORY_FRAME_UNUSABLE_BLOCK);

  dataView.setUint16(DIRECTORY_FRAME_NEXT_BLOCK_OFFSET, DIRECTORY_FRAME_NO_NEXT_BLOCK, LITTLE_ENDIAN);

  return arrayBuffer;
}

function encodeFilename(filename, filenameTextEncoder) {
  return filenameTextEncoder.encode(filename).slice(0, DIRECTORY_FRAME_FILENAME_LENGTH);
}

// The filename begins with the country code:
// https://www.psdevwiki.com/ps3/PS1_Savedata#Virtual_Memory_Card_PS1_.28.VM1.29
function getRegionName(filename) {
  const firstChar = filename.charAt(0);

  if (firstChar === 'B') {
    const secondChar = filename.charAt(1);

    if (secondChar === 'I') {
      return 'Japan';
    }

    if (secondChar === 'A') {
      return 'North America';
    }

    if (secondChar === 'E') {
      return 'Europe';
    }
  }

  return 'Unknown region';
}

function createDirectoryFramesForSave(saveFile, blockNumber, filenameTextEncoder) {
  const numBlocks = saveFile.rawData.byteLength / BLOCK_SIZE;

  let needEndingBlock = false;
  let numMiddleBlocks = 0;

  if (numBlocks >= 2) {
    needEndingBlock = true;
    numMiddleBlocks = numBlocks - 2;
  }

  const directoryFrames = [];

  // First, do the directory frame for the starting block

  let currentBlockNumber = blockNumber;

  {
    const arrayBuffer = createDirectoryFrame();
    const array = new Uint8Array(arrayBuffer);
    const dataView = new DataView(arrayBuffer);

    const encodedFilename = encodeFilename(saveFile.filename, filenameTextEncoder);

    dataView.setUint8(DIRECTORY_FRAME_AVAILABLE_OFFSET, DIRECTORY_FRAME_FIRST_LINK_BLOCK);
    dataView.setUint32(DIRECTORY_FRAME_FILE_SIZE_OFFSET, saveFile.rawData.byteLength, LITTLE_ENDIAN);
    dataView.setUint16(DIRECTORY_FRAME_NEXT_BLOCK_OFFSET, (numBlocks > 1) ? (currentBlockNumber + 1) : DIRECTORY_FRAME_NO_NEXT_BLOCK, LITTLE_ENDIAN);

    array.set(encodedFilename, DIRECTORY_FRAME_FILENAME_OFFSET);

    dataView.setUint8(FRAME_SIZE - 1, xorAllBytes(arrayBuffer));

    directoryFrames.push(arrayBuffer);
  }

  // Then do the directory frames for any middle blocks

  for (let i = 0; i < numMiddleBlocks; i += 1) {
    currentBlockNumber += 1;

    const arrayBuffer = createDirectoryFrame();
    const dataView = new DataView(arrayBuffer);

    dataView.setUint8(DIRECTORY_FRAME_AVAILABLE_OFFSET, DIRECTORY_FRAME_MIDDLE_LINK_BLOCK);
    dataView.setUint16(DIRECTORY_FRAME_NEXT_BLOCK_OFFSET, currentBlockNumber + 1, LITTLE_ENDIAN);
    dataView.setUint8(FRAME_SIZE - 1, xorAllBytes(arrayBuffer));

    directoryFrames.push(arrayBuffer);
  }

  // Then the directory frame for the ending block if needed

  if (needEndingBlock) {
    const arrayBuffer = createDirectoryFrame();
    const dataView = new DataView(arrayBuffer);

    dataView.setUint8(DIRECTORY_FRAME_AVAILABLE_OFFSET, DIRECTORY_FRAME_LAST_LINK_BLOCK);
    dataView.setUint16(DIRECTORY_FRAME_NEXT_BLOCK_OFFSET, DIRECTORY_FRAME_NO_NEXT_BLOCK, LITTLE_ENDIAN);
    dataView.setUint8(FRAME_SIZE - 1, xorAllBytes(arrayBuffer));

    directoryFrames.push(arrayBuffer);
  }

  // All done!

  return directoryFrames;
}

export default class Ps1DirectoryBlock {
  static DIRECTORY_FRAME_AVAILABLE_OFFSET = DIRECTORY_FRAME_AVAILABLE_OFFSET;

  static DIRECTORY_FRAME_NEXT_BLOCK_OFFSET = DIRECTORY_FRAME_NEXT_BLOCK_OFFSET;

  static getDirectoryFrame(headerArrayBuffer, blockNum) {
    return getDirectoryFrame(headerArrayBuffer, blockNum);
  }

  static encodeFilename(filename, filenameTextEncoder) {
    return encodeFilename(filename, filenameTextEncoder);
  }

  static createHeaderBlock(saveFiles) {
    const directoryFrames = [];

    const filenameTextEncoder = new TextEncoder(DIRECTORY_FRAME_FILENAME_ENCODING);

    directoryFrames.push(createDirectoryFrameMagic());

    saveFiles.forEach((saveFile) => {
      const directoryFramesForSaveFile = createDirectoryFramesForSave(saveFile, directoryFrames.length - 1, filenameTextEncoder);

      directoryFrames.push(...directoryFramesForSaveFile);
    });

    // Fill in any remaining space as empty directory frames + save blocks

    while (directoryFrames.length < NUM_TOTAL_BLOCKS) { // NUM_TOTAL_BLOCKS rather than NUM_DATA_BLOCKS because we have the magic frame on there first, which corresponds to the header block
      directoryFrames.push(createDirectoryFrameEmpty());
    }

    // Then the rest of the header block is unused directory frames

    while (directoryFrames.length < (BLOCK_SIZE / FRAME_SIZE)) {
      directoryFrames.push(createDirectoryFrameUnused());
    }

    // Concat our directory frames together into our header block

    return Util.concatArrayBuffers(directoryFrames);
  }

  static readDirectoryBlock(headerArrayBuffer) {
    Util.checkMagic(headerArrayBuffer, MAGIC_OFFSET, HEADER_MAGIC, MAGIC_ENCODING);

    const filenameTextDecoder = new TextDecoder(DIRECTORY_FRAME_FILENAME_ENCODING);

    const saveFiles = [];

    // Go through all the directory frames, and for each block that contains data then get the raw save data and decode its description

    for (let i = 0; i < NUM_DATA_BLOCKS; i += 1) {
      let directoryFrame = getDirectoryFrame(headerArrayBuffer, i);
      let directoryFrameDataView = new DataView(directoryFrame);

      const available = directoryFrameDataView.getUint8(DIRECTORY_FRAME_AVAILABLE_OFFSET);

      if (((available & 0xF0) === DIRECTORY_FRAME_UNUSED_BLOCK) || (available === DIRECTORY_FRAME_UNUSABLE_BLOCK)) {
        // Note that some files have blocks with their 'available' byte set like 0xA1, 0xA2, etc., which
        // indicates both that the block is available and it's a link block that's part of a save > 1 block in size.
        // So I'm assumeing that the high bits take precidence here and the block is actually available
        continue; // eslint-disable-line no-continue
      }

      if (available === DIRECTORY_FRAME_FIRST_LINK_BLOCK) {
        // This block begins a save, which may be comprised of several blocks

        const filename = Util.trimNull(filenameTextDecoder.decode(directoryFrame.slice(DIRECTORY_FRAME_FILENAME_OFFSET, DIRECTORY_FRAME_FILENAME_OFFSET + DIRECTORY_FRAME_FILENAME_LENGTH)));
        const regionName = getRegionName(filename);
        const rawDataSize = directoryFrameDataView.getUint32(DIRECTORY_FRAME_FILE_SIZE_OFFSET, LITTLE_ENDIAN);
        const dataBlockNumbers = [i];

        // See if there are other blocks that comprise this save

        let nextBlockNumber = directoryFrameDataView.getUint16(DIRECTORY_FRAME_NEXT_BLOCK_OFFSET, LITTLE_ENDIAN);

        while (nextBlockNumber !== DIRECTORY_FRAME_NO_NEXT_BLOCK) {
          dataBlockNumbers.push(nextBlockNumber);

          directoryFrame = getDirectoryFrame(headerArrayBuffer, nextBlockNumber);
          directoryFrameDataView = new DataView(directoryFrame);

          nextBlockNumber = directoryFrameDataView.getUint16(DIRECTORY_FRAME_NEXT_BLOCK_OFFSET, LITTLE_ENDIAN);
        }

        saveFiles.push({
          startingBlock: i,
          filename,
          regionName,
          dataBlockNumbers,
          rawDataSize,
        });
      }
    }

    return saveFiles;
  }
}
