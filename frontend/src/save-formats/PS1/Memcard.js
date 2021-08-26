/*
The DexDrive data format is:

*/

import Util from '../../util/util';

const MAGIC_ENCODING = 'US-ASCII';

const NUM_BLOCKS = 15; // The card has one block that contains the header, then 15 blocks for save data
const BLOCK_SIZE = 8192; // Each block is this many bytes
const FRAME_SIZE = 128; // Each block contains a set of "frames" which are each this many bytes

// System header

const HEADER_MAGIC = 'MC';

// The header contains several mini-blocks called "directory frames", each of which has info about a block of data

const DIRECTORY_FRAME_AVAILABLE_OFFSET = 0x00;
const DIRECTORY_FRAME_FILENAME_OFFSET = 0x0A;
const DIRECTORY_FRAME_FILENAME_LENGTH = 20;
const DIRECTORY_FRAME_FILENAME_ENCODING = 'US-ASCII';
const DIRECTORY_FRAME_UNUSED_BLOCK = 0xA0;
const DIRECTORY_FRAME_UNUSABLE_BLOCK = 0xFF;

// Save blocks

const SAVE_BLOCK_MAGIC = 'SC';
const SAVE_BLOCK_DESCRIPTION_OFFSET = 0x04;
const SAVE_BLOCK_DESCRIPTION_LENGTH = 64;
const SAVE_BLOCK_DESCRIPTION_ENCODING = 'shift-jis';

export default class Ps1MemcardSaveData {
  static NUM_BLOCKS = NUM_BLOCKS;

  static createFromPs1MemcardData(memcardArrayBuffer) {
    return new Ps1MemcardSaveData(memcardArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    this.rawSaveData = rawArrayBuffer;
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
      const directoryFrameOffset = FRAME_SIZE + (i * FRAME_SIZE); // The first frame contains SYSTEM_HEADER_MAGIC, so block 0 is at frame 1
      const directoryFrame = headerArrayBuffer.slice(directoryFrameOffset, directoryFrameOffset + FRAME_SIZE);
      const directoryFrameDataView = new DataView(directoryFrame);

      const available = directoryFrameDataView.getUint8(DIRECTORY_FRAME_AVAILABLE_OFFSET);

      if ((available === DIRECTORY_FRAME_UNUSED_BLOCK) || (available === DIRECTORY_FRAME_UNUSABLE_BLOCK)) {
        continue; // eslint-disable-line no-continue
      }

      const filename = Util.trimNull(filenameTextDecoder.decode(directoryFrame.slice(DIRECTORY_FRAME_FILENAME_OFFSET, DIRECTORY_FRAME_FILENAME_OFFSET + DIRECTORY_FRAME_FILENAME_LENGTH)));
      const rawSaveDataOffset = BLOCK_SIZE * i;
      const rawSaveData = dataBlocksArrayBuffer.slice(rawSaveDataOffset, rawSaveDataOffset + BLOCK_SIZE);

      Util.checkMagic(rawSaveData, 0, SAVE_BLOCK_MAGIC, MAGIC_ENCODING);

      const description = Util.trimNull(fileDescriptionTextDecoder.decode(rawSaveData.slice(SAVE_BLOCK_DESCRIPTION_OFFSET, SAVE_BLOCK_DESCRIPTION_OFFSET + SAVE_BLOCK_DESCRIPTION_LENGTH)));

      this.saveFiles.push({
        block: i,
        filename,
        description,
        rawData: rawSaveData,
      });
    }
  }

  getSaveFiles() {
    return this.saveFiles;
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
