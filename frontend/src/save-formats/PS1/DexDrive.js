/*
The DexDrive data format is:
- 3904 byte header that mostly contains a comment about each block
- Normal PS1 memory card data
*/

import Ps1MemcardSaveData from './Memcard';
import Util from '../../util/util';

const MAGIC_ENCODING = 'US-ASCII';

// DexDrive header

const DEXDRIVE_HEADER_MAGIC = '123-456-STD';
const DEXDRIVE_HEADER_LENGTH = 3904;
// MemcardRex uses the system default encoding for the comments (https://github.com/ShendoXT/memcardrex/blob/master/MemcardRex/ps1card.cs#L175), which is usually utf8.
// Seems like maybe an old device like an actual DexDrive may instead use US-ASCII though.
// But the actual devices don't really exist anymore and most/all of these files that exist today would be written out by MemcardRex?
const COMMENT_ENCODING = 'utf8';
const FIRST_COMMENT_OFFSET = 64;
const COMMENT_LENGTH = 256;

// https://github.com/ShendoXT/memcardrex/blob/master/MemcardRex/ps1card.cs#L689
function getComments(headerArrayBuffer) {
  const comments = [];
  const textDecoder = new TextDecoder(COMMENT_ENCODING);

  for (let i = 0; i < Ps1MemcardSaveData.NUM_BLOCKS; i += 1) {
    const commentStartOffset = FIRST_COMMENT_OFFSET + (i * COMMENT_LENGTH);
    const commentArrayBuffer = headerArrayBuffer.slice(commentStartOffset, commentStartOffset + COMMENT_LENGTH);

    comments.push(Util.trimNull(textDecoder.decode(commentArrayBuffer)));
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

    Util.checkMagic(dexDriveHeaderArrayBuffer, 0, DEXDRIVE_HEADER_MAGIC, MAGIC_ENCODING);

    // Note that the DexDrive header also contains the Available flag for each block (beginning at offset 22), copied from the system header,
    // and the link order for each block (beginning at offset 38), also copied from the system header.
    // https://github.com/ShendoXT/memcardrex/blob/master/MemcardRex/ps1card.cs#L171

    const comments = getComments(dexDriveHeaderArrayBuffer);

    // Parse the rest of the file
    const memcardArrayBuffer = arrayBuffer.slice(DEXDRIVE_HEADER_LENGTH); // The remainder of the file is the actual contents of the memory card

    const memcard = Ps1MemcardSaveData.createFromPs1MemcardData(memcardArrayBuffer);

    // Add in the comments we found in the header
    this.saveFiles = memcard.getSaveFiles().map((x) => ({ ...x, comment: comments[x.block] }));
  }

  getSaveFiles() {
    return this.saveFiles;
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
