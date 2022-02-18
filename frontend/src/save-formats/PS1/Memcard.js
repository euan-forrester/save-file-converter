/* eslint no-bitwise: ["error", { "allow": ["&", "^"] }] */

/*
The PS1 memcard format is described here:
https://www.psdevwiki.com/ps3/PS1_Savedata#Virtual_Memory_Card_PS1_.28.VM1.29
*/

import Util from '../../util/util';

const MAGIC_ENCODING = 'US-ASCII';

const NUM_BLOCKS = 15; // The card has one block that contains the header, then 15 blocks for save data
const BLOCK_SIZE = 8192; // Each block is this many bytes
const FRAME_SIZE = 128; // Each block contains a set of "frames" which are each this many bytes
const LITTLE_ENDIAN = true;

// Header block

const HEADER_MAGIC = 'MC';

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

// Save blocks

const SAVE_BLOCK_MAGIC = 'SC';
const SAVE_BLOCK_DESCRIPTION_OFFSET = 0x04;
const SAVE_BLOCK_DESCRIPTION_LENGTH = 64;
const SAVE_BLOCK_DESCRIPTION_ENCODING = 'shift-jis';

function convertTextToHalfWidth(s) {
  // The description stored in the save data is in full-width characters but we'd rather display normal half-width ones
  // https://stackoverflow.com/a/58515363
  return s.replace(/[\uff01-\uff5e]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)).replace(/\u3000/g, '\u0020');
}

function getDirectoryFrame(headerArrayBuffer, blockNum) {
  const offset = FRAME_SIZE + (blockNum * FRAME_SIZE); // The first frame contains HEADER_MAGIC, so block 0 is at frame 1
  return headerArrayBuffer.slice(offset, offset + FRAME_SIZE);
}

function getBlock(dataBlocksArrayBuffer, blockNum) {
  const offset = BLOCK_SIZE * blockNum;
  return dataBlocksArrayBuffer.slice(offset, offset + BLOCK_SIZE);
}

function checkFile(file) {
  Util.checkMagic(file.rawData, 0, SAVE_BLOCK_MAGIC, MAGIC_ENCODING);

  if (file.rawData.byteLength <= 0) {
    throw new Error(`File ${file.filename} does not contain any data`);
  }

  if ((file.rawData.byteLength % BLOCK_SIZE) !== 0) {
    throw new Error(`File ${file.filename} size must be a multiple of ${BLOCK_SIZE} bytes`);
  }
}

function xorAllBytes(arrayBuffer) {
  const array = new Uint8Array(arrayBuffer);

  return array.reduce((acc, n) => acc ^ n);
}

function encodeFilename(filename, filenameTextEncoder) {
  return filenameTextEncoder.encode(filename).slice(0, DIRECTORY_FRAME_FILENAME_LENGTH);
}

function createDirectoryFrameMagic() {
  const arrayBuffer = new ArrayBuffer(FRAME_SIZE);
  const array = new Uint8Array(arrayBuffer);

  array.fill(0);

  array[0] = HEADER_MAGIC.charCodeAt(0);
  array[1] = HEADER_MAGIC.charCodeAt(1);

  array[FRAME_SIZE - 1] = xorAllBytes(arrayBuffer);

  return arrayBuffer;
}

function createDirectoryFrameEmpty() {
  const arrayBuffer = new ArrayBuffer(FRAME_SIZE);
  const array = new Uint8Array(arrayBuffer);
  const dataView = new DataView(arrayBuffer);

  array.fill(0);

  dataView.setUint8(DIRECTORY_FRAME_AVAILABLE_OFFSET, DIRECTORY_FRAME_UNUSED_BLOCK);
  dataView.setUint16(DIRECTORY_FRAME_NEXT_BLOCK_OFFSET, DIRECTORY_FRAME_NO_NEXT_BLOCK, LITTLE_ENDIAN);

  dataView.setUint8(FRAME_SIZE - 1, xorAllBytes(arrayBuffer));

  return arrayBuffer;
}

function createSaveBlockEmpty() {
  return new ArrayBuffer(BLOCK_SIZE);
}

function createDirectoryFrameUnused() {
  const arrayBuffer = new ArrayBuffer(FRAME_SIZE);
  const array = new Uint8Array(arrayBuffer);
  const dataView = new DataView(arrayBuffer);

  array.fill(0);

  dataView.setUint8(DIRECTORY_FRAME_AVAILABLE_OFFSET + 0, DIRECTORY_FRAME_UNUSABLE_BLOCK);
  dataView.setUint8(DIRECTORY_FRAME_AVAILABLE_OFFSET + 1, DIRECTORY_FRAME_UNUSABLE_BLOCK);
  dataView.setUint8(DIRECTORY_FRAME_AVAILABLE_OFFSET + 2, DIRECTORY_FRAME_UNUSABLE_BLOCK);
  dataView.setUint8(DIRECTORY_FRAME_AVAILABLE_OFFSET + 3, DIRECTORY_FRAME_UNUSABLE_BLOCK);

  dataView.setUint16(DIRECTORY_FRAME_NEXT_BLOCK_OFFSET, DIRECTORY_FRAME_NO_NEXT_BLOCK, LITTLE_ENDIAN);

  return arrayBuffer;
}

function createDirectoryFrame() {
  const arrayBuffer = new ArrayBuffer(FRAME_SIZE);
  const array = new Uint8Array(arrayBuffer);

  array.fill(0);

  return arrayBuffer;
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

  // And divide up the save file itself into blocks

  const saveBlocks = [];

  for (let i = 0; i < numBlocks; i += 1) {
    saveBlocks.push(saveFile.rawData.slice(i * BLOCK_SIZE, (i + 1) * BLOCK_SIZE));
  }

  // All done!

  return {
    directoryFrames,
    saveBlocks,
  };
}

export default class Ps1MemcardSaveData {
  static NUM_BLOCKS = NUM_BLOCKS;

  static FRAME_SIZE = FRAME_SIZE;

  static DIRECTORY_FRAME_AVAILABLE_OFFSET = DIRECTORY_FRAME_AVAILABLE_OFFSET;

  static DIRECTORY_FRAME_NEXT_BLOCK_OFFSET = DIRECTORY_FRAME_NEXT_BLOCK_OFFSET;

  static DIRECTORY_FRAME_FIRST_LINK_BLOCK = DIRECTORY_FRAME_FIRST_LINK_BLOCK;

  static encodeFilename(filename, filenameTextEncoder) {
    return encodeFilename(filename, filenameTextEncoder); // This function is used above, so must be declared above
  }

  static createFromPs1MemcardData(memcardArrayBuffer) {
    return new Ps1MemcardSaveData(memcardArrayBuffer);
  }

  static createFromSaveFiles(saveFiles) {
    // Make sure that each file has the correct magic, is a correct size, and the total size isn't bigger than a single memcard

    saveFiles.forEach((f) => checkFile(f));

    const totalSize = saveFiles.reduce((total, f) => total + f.filesize);
    if (totalSize > (NUM_BLOCKS * BLOCK_SIZE)) {
      throw new Error(`Total size of files is ${totalSize} bytes (${totalSize / BLOCK_SIZE} blocks) but max size is ${NUM_BLOCKS * BLOCK_SIZE} bytes (${NUM_BLOCKS} blocks)`);
    }

    // Create our directory frames + save blocks

    const directoryFrames = [];
    const saveBlocks = [];

    const filenameTextEncoder = new TextEncoder(DIRECTORY_FRAME_FILENAME_ENCODING);

    directoryFrames.push(createDirectoryFrameMagic());

    saveFiles.forEach((saveFile) => {
      const entries = createDirectoryFramesForSave(saveFile, directoryFrames.length - 1, filenameTextEncoder);

      directoryFrames.push(...entries.directoryFrames);
      saveBlocks.push(...entries.saveBlocks);
    });

    // Fill in any remaining space as empty directory frames + save blocks

    while (directoryFrames.length < (NUM_BLOCKS + 1)) { // +1 because we have the magic frame on there first
      directoryFrames.push(createDirectoryFrameEmpty());
      saveBlocks.push(createSaveBlockEmpty());
    }

    // Then the rest of the header block is unused directory frames

    while (directoryFrames.length < (BLOCK_SIZE / FRAME_SIZE)) {
      directoryFrames.push(createDirectoryFrameUnused());
    }

    // Concat our directory frames together into our header block

    const headerBlock = Util.concatArrayBuffers(directoryFrames);

    // Concat all of our blocks together to form our memcard image

    saveBlocks.unshift(headerBlock); // Header block goes first

    const arrayBuffer = Util.concatArrayBuffers(saveBlocks);

    // Now go back and re-parse the data we've created to get the description etc for each file

    return new Ps1MemcardSaveData(arrayBuffer);
  }

  // This constructor creates a new object from a binary representation of a PS1 memcard
  constructor(arrayBuffer) {
    this.arrayBuffer = arrayBuffer;

    // The first block is a header, which describes the remaining blocks

    const headerArrayBuffer = arrayBuffer.slice(0, BLOCK_SIZE); // The first block describes the layout of the card, and is hidden from the user
    const dataBlocksArrayBuffer = arrayBuffer.slice(BLOCK_SIZE, BLOCK_SIZE * (NUM_BLOCKS + 1)); // The remaining blocks contain the actual save data

    Util.checkMagic(headerArrayBuffer, 0, HEADER_MAGIC, MAGIC_ENCODING);

    const filenameTextDecoder = new TextDecoder(DIRECTORY_FRAME_FILENAME_ENCODING);
    const fileDescriptionTextDecoder = new TextDecoder(SAVE_BLOCK_DESCRIPTION_ENCODING);

    this.saveFiles = [];

    // Go through all the directory frames, and for each block that contains data then get the raw save data and decode its description

    for (let i = 0; i < NUM_BLOCKS; i += 1) {
      let directoryFrame = getDirectoryFrame(headerArrayBuffer, i);
      let directoryFrameDataView = new DataView(directoryFrame);

      const available = directoryFrameDataView.getUint8(DIRECTORY_FRAME_AVAILABLE_OFFSET);

      if (((available & 0xF0) === DIRECTORY_FRAME_UNUSED_BLOCK) || (available === DIRECTORY_FRAME_UNUSABLE_BLOCK)) {
        // Note that some files have blocks with their 'available' byte set like 0xA1, oxA2, etc., which
        // indicates both that the block is available and it's a link block that's part of a save > 1 block in size.
        // So I'm assumeing that the high bits take precidence here and the block is actually available
        continue; // eslint-disable-line no-continue
      }

      if (available === DIRECTORY_FRAME_FIRST_LINK_BLOCK) {
        // This block begins a save, which may be comprised of several blocks

        const filename = Util.trimNull(filenameTextDecoder.decode(directoryFrame.slice(DIRECTORY_FRAME_FILENAME_OFFSET, DIRECTORY_FRAME_FILENAME_OFFSET + DIRECTORY_FRAME_FILENAME_LENGTH)));
        const expectedSize = directoryFrameDataView.getUint32(DIRECTORY_FRAME_FILE_SIZE_OFFSET, LITTLE_ENDIAN);
        const dataBlocks = [getBlock(dataBlocksArrayBuffer, i)];

        Util.checkMagic(dataBlocks[0], 0, SAVE_BLOCK_MAGIC, MAGIC_ENCODING);

        const description = convertTextToHalfWidth(
          Util.trimNull(
            fileDescriptionTextDecoder.decode(
              dataBlocks[0].slice(SAVE_BLOCK_DESCRIPTION_OFFSET, SAVE_BLOCK_DESCRIPTION_OFFSET + SAVE_BLOCK_DESCRIPTION_LENGTH),
            ),
          ),
        );

        // See if there are other blocks that comprise this save

        let nextBlockNumber = directoryFrameDataView.getUint16(DIRECTORY_FRAME_NEXT_BLOCK_OFFSET, LITTLE_ENDIAN);

        while (nextBlockNumber !== DIRECTORY_FRAME_NO_NEXT_BLOCK) {
          dataBlocks.push(getBlock(dataBlocksArrayBuffer, nextBlockNumber));

          directoryFrame = getDirectoryFrame(headerArrayBuffer, nextBlockNumber);
          directoryFrameDataView = new DataView(directoryFrame);

          nextBlockNumber = directoryFrameDataView.getUint16(DIRECTORY_FRAME_NEXT_BLOCK_OFFSET, LITTLE_ENDIAN);
        }

        // Check that we actually got as many bytes as the file was supposed to have

        const rawData = Util.concatArrayBuffers(dataBlocks);

        if (rawData.byteLength !== expectedSize) {
          throw new Error(`Save file appears to be corrupted: expected file ${description} to be ${expectedSize} bytes, but was actually ${rawData.byteLength} bytes`);
        }

        this.saveFiles.push({
          startingBlock: i,
          filename,
          description,
          rawData,
        });
      }
    }
  }

  getDirectoryFrame(i) {
    const headerArrayBuffer = this.arrayBuffer.slice(0, BLOCK_SIZE);
    return getDirectoryFrame(headerArrayBuffer, i);
  }

  getSaveFiles() {
    return this.saveFiles;
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
