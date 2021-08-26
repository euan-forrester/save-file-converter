/*
The DexDrive data format is:

*/

const MAGIC_ENCODING = 'US-ASCII';

const NUM_BLOCKS = 15; // The card has one block that contains the system header, then 15 blocks for save data
const BLOCK_SIZE = 8192; // Each block is this many bytes
const FRAME_SIZE = 128; // Each block contains a set of "frames" which are each this many bytes

// DexDrive header

const DEXDRIVE_HEADER_MAGIC = '123-456-STD';
const DEXDRIVE_HEADER_LENGTH = 3904;
// MemcardRex uses the system default encoding for the comments (https://github.com/ShendoXT/memcardrex/blob/master/MemcardRex/ps1card.cs#L175), which is usually utf8.
// Seems like maybe an old device like an actual DexDrive may instead use US-ASCII though.
// But the actual devices don't really exist anymore and most/all of these files that exist today would be written out by MemcardRex?
const COMMENT_ENCODING = 'utf8';
const FIRST_COMMENT_OFFSET = 64;
const COMMENT_LENGTH = 256;

// System header

const SYSTEM_HEADER_MAGIC = 'MC';

// The system header contains several mini-blocks called "directory frames", each of which has info about a block of data

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

function checkMagic(arrayBuffer, offset, magic) {
  const magicTextDecoder = new TextDecoder(MAGIC_ENCODING);
  const magicFound = magicTextDecoder.decode(arrayBuffer.slice(offset, offset + magic.length));

  if (magicFound !== magic) {
    throw new Error(`Save appears corrupted: found '${magicFound}' instead of '${magic}'`);
  }
}

// https://github.com/ShendoXT/memcardrex/blob/master/MemcardRex/ps1card.cs#L689
function getComments(headerArrayBuffer) {
  const comments = [];
  const textDecoder = new TextDecoder(COMMENT_ENCODING);

  for (let i = 0; i < NUM_BLOCKS; i += 1) {
    const commentStartOffset = FIRST_COMMENT_OFFSET + (i * COMMENT_LENGTH);
    const commentArrayBuffer = headerArrayBuffer.slice(commentStartOffset, commentStartOffset + COMMENT_LENGTH);

    comments.push(textDecoder.decode(commentArrayBuffer));
  }

  return comments;
}

export default class DexDriveSaveData {
  static createFromDexDriveData(dexDriveArrayBuffer) {
    return new DexDriveSaveData(dexDriveArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    this.rawSaveData = rawArrayBuffer;
  }

  // This constructor creates a new object from a binary representation of a DexDrive save data file
  constructor(arrayBuffer) {
    this.arrayBuffer = arrayBuffer;

    // Parse the DexDrive-specific header: magic and comments

    const dexDriveHeaderArrayBuffer = arrayBuffer.slice(0, DEXDRIVE_HEADER_LENGTH);

    checkMagic(dexDriveHeaderArrayBuffer, 0, DEXDRIVE_HEADER_MAGIC);

    const comments = getComments(dexDriveHeaderArrayBuffer);

    // Parse the rest of the file
    const systemBlocksArrayBuffer = arrayBuffer.slice(DEXDRIVE_HEADER_LENGTH); // The remainder of the file is the actual contents of the memory card
    const systemHeaderArrayBuffer = systemBlocksArrayBuffer.slice(0, BLOCK_SIZE); // The first block describes the layout of the card, and is hidden from the user
    const dataBlocksArrayBuffer = systemBlocksArrayBuffer.slice(BLOCK_SIZE, BLOCK_SIZE * (NUM_BLOCKS + 1)); // The remaining blocks contain the actual save data

    checkMagic(systemHeaderArrayBuffer, 0, SYSTEM_HEADER_MAGIC);

    const filenameTextDecoder = new TextDecoder(DIRECTORY_FRAME_FILENAME_ENCODING);
    const fileDescriptionTextDecoder = new TextDecoder(SAVE_BLOCK_DESCRIPTION_ENCODING);

    this.saveFiles = [];

    for (let i = 0; i < NUM_BLOCKS; i += 1) {
      const directoryFrameOffset = FRAME_SIZE + (i * FRAME_SIZE); // The first frame contains SYSTEM_HEADER_MAGIC, so block 0 is at frame 1
      const directoryFrame = systemHeaderArrayBuffer.slice(directoryFrameOffset, directoryFrameOffset + FRAME_SIZE);
      const directoryFrameDataView = new DataView(directoryFrame);

      const available = directoryFrameDataView.getUint8(DIRECTORY_FRAME_AVAILABLE_OFFSET);

      if ((available === DIRECTORY_FRAME_UNUSED_BLOCK) || (available === DIRECTORY_FRAME_UNUSABLE_BLOCK)) {
        continue; // eslint-disable-line no-continue
      }

      const filename = filenameTextDecoder.decode(directoryFrame.slice(DIRECTORY_FRAME_FILENAME_OFFSET, DIRECTORY_FRAME_FILENAME_OFFSET + DIRECTORY_FRAME_FILENAME_LENGTH));
      const rawSaveDataOffset = BLOCK_SIZE * i;
      const rawSaveData = dataBlocksArrayBuffer.slice(rawSaveDataOffset, rawSaveDataOffset + BLOCK_SIZE);

      checkMagic(rawSaveData, 0, SAVE_BLOCK_MAGIC);

      const description = fileDescriptionTextDecoder.decode(rawSaveData.slice(SAVE_BLOCK_DESCRIPTION_OFFSET, SAVE_BLOCK_DESCRIPTION_OFFSET + SAVE_BLOCK_DESCRIPTION_LENGTH));

      this.saveFiles.push({
        block: i,
        filename,
        comment: comments[i],
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
