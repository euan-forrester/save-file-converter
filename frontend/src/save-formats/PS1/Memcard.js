/* eslint no-bitwise: ["error", { "allow": ["&"] }] */

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

// System header

const HEADER_MAGIC = 'MC';

// The header contains several mini-blocks called "directory frames", each of which has info about a block of data

const DIRECTORY_FRAME_AVAILABLE_OFFSET = 0x00;
const DIRECTORY_FRAME_NEXT_BLOCK_OFFSET = 0x08;
const DIRECTORY_FRAME_NO_NEXT_BLOCK = 0xFFFF;
const DIRECTORY_FRAME_FILENAME_OFFSET = 0x0A;
const DIRECTORY_FRAME_FILENAME_LENGTH = 20;
const DIRECTORY_FRAME_FILENAME_ENCODING = 'US-ASCII';

// These flags are described in the 'available blocks table' here: https://www.psdevwiki.com/ps3/PS1_Savedata#PS1_Single_Save_.3F_.28.PSV.29
const DIRECTORY_FRAME_UNUSED_BLOCK = 0xA0;
const DIRECTORY_FRAME_FIRST_LINK_BLOCK = 0x51;
// const DIRECTORY_FRAME_MIDDLE_LINK_BLOCK = 0x52;
// const DIRECTORY_FRAME_LAST_LINK_BLOCK = 0x53;
const DIRECTORY_FRAME_UNUSABLE_BLOCK = 0xFF;

// Save blocks

const SAVE_BLOCK_MAGIC = 'SC';
const SAVE_BLOCK_DESCRIPTION_OFFSET = 0x04;
const SAVE_BLOCK_DESCRIPTION_LENGTH = 64;
const SAVE_BLOCK_DESCRIPTION_ENCODING = 'shift-jis';

function getDirectoryFrame(headerArrayBuffer, blockNum) {
  const offset = FRAME_SIZE + (blockNum * FRAME_SIZE); // The first frame contains HEADER_MAGIC, so block 0 is at frame 1
  return headerArrayBuffer.slice(offset, offset + FRAME_SIZE);
}

function getBlock(dataBlocksArrayBuffer, blockNum) {
  const offset = BLOCK_SIZE * blockNum;
  return dataBlocksArrayBuffer.slice(offset, offset + BLOCK_SIZE);
}

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
        // This block begins a save, which may by comprised of several blocks

        const filename = Util.trimNull(filenameTextDecoder.decode(directoryFrame.slice(DIRECTORY_FRAME_FILENAME_OFFSET, DIRECTORY_FRAME_FILENAME_OFFSET + DIRECTORY_FRAME_FILENAME_LENGTH)));
        let rawSaveData = getBlock(dataBlocksArrayBuffer, i);

        Util.checkMagic(rawSaveData, 0, SAVE_BLOCK_MAGIC, MAGIC_ENCODING);

        const description = Util.trimNull(fileDescriptionTextDecoder.decode(rawSaveData.slice(SAVE_BLOCK_DESCRIPTION_OFFSET, SAVE_BLOCK_DESCRIPTION_OFFSET + SAVE_BLOCK_DESCRIPTION_LENGTH)));

        // See if there are other blocks that comprise this save

        let nextBlockNumber = directoryFrameDataView.getUint16(DIRECTORY_FRAME_NEXT_BLOCK_OFFSET, LITTLE_ENDIAN);

        while (nextBlockNumber !== DIRECTORY_FRAME_NO_NEXT_BLOCK) {
          const nextBlock = getBlock(dataBlocksArrayBuffer, nextBlockNumber);

          rawSaveData = Util.concatArrayBuffers(rawSaveData, nextBlock);

          directoryFrame = getDirectoryFrame(headerArrayBuffer, nextBlockNumber);
          directoryFrameDataView = new DataView(directoryFrame);

          nextBlockNumber = directoryFrameDataView.getUint16(DIRECTORY_FRAME_NEXT_BLOCK_OFFSET, LITTLE_ENDIAN);
        }

        this.saveFiles.push({
          startingBlock: i,
          filename,
          description,
          rawData: rawSaveData,
        });
      }
    }
  }

  getSaveFiles() {
    return this.saveFiles;
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
