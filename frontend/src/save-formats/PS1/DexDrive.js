/*
The DexDrive data format is:
- 3904 byte header:
  - Magic
  - Copy of the 'available' flags from the memcard header
  - Copy of the linked blocks from the memcard header
  - A comment for each block
- Normal PS1 memory card data
*/

import Ps1MemcardSaveData from './Memcard';
import Util from '../../util/util';

// DexDrive header

const HEADER_LENGTH = 3904;

const HEADER_MAGIC = '123-456-STD';
const MAGIC_ENCODING = 'US-ASCII';

const AVAILABLE_BLOCKS_OFFSET = 22;
const LINK_BLOCKS_OFFSET = 38;

// MemcardRex uses the system default encoding for the comments (https://github.com/ShendoXT/memcardrex/blob/master/MemcardRex/ps1card.cs#L175), which is usually utf8.
// I would guess that an old device like an actual DexDrive may instead use US-ASCII though.
// But the actual devices don't really exist anymore and most/all of these files that exist today would be written out by MemcardRex?
const COMMENT_ENCODING = 'utf8';
const FIRST_COMMENT_OFFSET = 64;
const COMMENT_LENGTH = 256;

function getCommentStartOffset(i) {
  return FIRST_COMMENT_OFFSET + (i * COMMENT_LENGTH);
}

// https://github.com/ShendoXT/memcardrex/blob/master/MemcardRex/ps1card.cs#L689
function getComments(headerArrayBuffer) {
  const comments = [];
  const textDecoder = new TextDecoder(COMMENT_ENCODING);

  for (let i = 0; i < Ps1MemcardSaveData.NUM_BLOCKS; i += 1) {
    const commentStartOffset = getCommentStartOffset(i);
    const commentArrayBuffer = headerArrayBuffer.slice(commentStartOffset, commentStartOffset + COMMENT_LENGTH);

    comments.push(Util.trimNull(textDecoder.decode(commentArrayBuffer)));
  }

  return comments;
}

export default class DexDriveSaveData {
  static createFromDexDriveData(dexDriveArrayBuffer) {
    return new DexDriveSaveData(dexDriveArrayBuffer);
  }

  static createFromSaveFiles(saveFiles) {
    // The DexDrive image is the DexDrive header then the regular memcard data

    const headerArrayBuffer = new ArrayBuffer(HEADER_LENGTH);
    const headerArray = new Uint8Array(headerArrayBuffer);
    const memcardSaveData = Ps1MemcardSaveData.createFromSaveFiles(saveFiles);

    const magicTextEncoder = new TextEncoder(MAGIC_ENCODING);
    const commentTextEncoder = new TextEncoder(COMMENT_ENCODING);

    // Make an array of our comments, arranged by the starting block of each save

    const comments = Array.from({ length: Ps1MemcardSaveData.NUM_BLOCKS }, () => null);

    const memcardSaveDataFilesWithComments = memcardSaveData.getSaveFiles().map((file, i) => ({ ...file, comment: saveFiles[i].comment })); // Our list of save files from the memcard data is in the same order as the files were passed in

    memcardSaveDataFilesWithComments.forEach((file) => { comments[file.startingBlock] = file.comment; });

    // Based on https://github.com/ShendoXT/memcardrex/blob/master/MemcardRex/ps1card.cs#L145

    headerArray.fill(0);

    headerArray.set(magicTextEncoder.encode(HEADER_MAGIC), 0);
    headerArray[18] = 0x1;
    headerArray[20] = 0x1;
    headerArray[21] = 0x4D; // M

    for (let i = 0; i < Ps1MemcardSaveData.NUM_BLOCKS; i += 1) {
      const directoryFrame = memcardSaveData.getDirectoryFrame(i);
      const directoryFrameArray = new Uint8Array(directoryFrame);

      const availableFlags = directoryFrameArray[Ps1MemcardSaveData.DIRECTORY_FRAME_AVAILABLE_OFFSET];
      const nextLinkedBlock = directoryFrameArray[Ps1MemcardSaveData.DIRECTORY_FRAME_NEXT_BLOCK_OFFSET]; // This is actually a 16-bit number, but it's in little endian so the first byte contains all the info we need (0xFF if no next block)

      headerArray[AVAILABLE_BLOCKS_OFFSET + i] = availableFlags;
      headerArray[LINK_BLOCKS_OFFSET + i] = nextLinkedBlock;

      // In theory with the link blocks we should do more work. With this implementation, we're just copying over whatever is in the link block, but in
      // a real DexDrive file we'd want to set it to 0xFF if the available flags indicate that the block is available or unusable. This is because when data
      // is erased the link block can still be set to something even though the block is marked as available.
      //
      // However, in our case, because we're making the memcard image from scratch, there's no possibility of this.

      if (comments[i] !== null) {
        const encodedComment = commentTextEncoder.encode(comments[i]).slice(0, COMMENT_LENGTH);

        headerArray.set(encodedComment, getCommentStartOffset(i));
      }
    }

    // Now that we've created our DexDrive header, we can create our final memory image. We'll parse it again
    // to pull out the file descriptions

    const finalArrayBuffer = Util.concatArrayBuffers([headerArrayBuffer, memcardSaveData.getArrayBuffer()]);

    return DexDriveSaveData.createFromDexDriveData(finalArrayBuffer);
  }

  // This constructor creates a new object from a binary representation of a DexDrive save data file
  constructor(arrayBuffer) {
    this.arrayBuffer = arrayBuffer;

    // Parse the DexDrive-specific header: magic and comments

    const dexDriveHeaderArrayBuffer = arrayBuffer.slice(0, HEADER_LENGTH);

    Util.checkMagic(dexDriveHeaderArrayBuffer, 0, HEADER_MAGIC, MAGIC_ENCODING);

    // Note that the DexDrive header also contains the Available flag for each block (beginning at offset 22), copied from the system header,
    // and the link order for each block (beginning at offset 38), also copied from the system header.
    // https://github.com/ShendoXT/memcardrex/blob/master/MemcardRex/ps1card.cs#L171

    const comments = getComments(dexDriveHeaderArrayBuffer);

    // Parse the rest of the file
    const memcardArrayBuffer = arrayBuffer.slice(HEADER_LENGTH); // The remainder of the file is the actual contents of the memory card

    const memcard = Ps1MemcardSaveData.createFromPs1MemcardData(memcardArrayBuffer);

    // Add in the comments we found in the header
    this.saveFiles = memcard.getSaveFiles().map((x) => ({ ...x, comment: comments[x.startingBlock] }));
  }

  getSaveFiles() {
    return this.saveFiles;
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
