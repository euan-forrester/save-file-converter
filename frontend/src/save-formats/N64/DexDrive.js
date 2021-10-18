/*
The DexDrive data format is described here:
https://github.com/bryc/mempak/wiki/DexDrive-.N64-format

It is:
- 4160 byte header:
  - Magic
  - Some unknown stuff. This unknown stuff seems inconsequential (see link above)
  - A comment for each block
- Normal N64 .MPK memory card data
*/

import N64MempackSaveData from './Mempack';
import Util from '../../util/util';

// DexDrive header

const HEADER_LENGTH = 4160;

const HEADER_MAGIC = '123-456-STD';
const MAGIC_ENCODING = 'US-ASCII';

const COMMENT_ENCODING = 'US-ASCII';
const FIRST_COMMENT_OFFSET = 64;
const COMMENT_LENGTH = 256;

function getCommentStartOffset(i) {
  return FIRST_COMMENT_OFFSET + (i * COMMENT_LENGTH);
}

function getComments(headerArrayBuffer) {
  const comments = [];
  const textDecoder = new TextDecoder(COMMENT_ENCODING);

  for (let i = 0; i < N64MempackSaveData.NUM_NOTES; i += 1) {
    const commentStartOffset = getCommentStartOffset(i);
    const commentArrayBuffer = headerArrayBuffer.slice(commentStartOffset, commentStartOffset + COMMENT_LENGTH);

    comments.push(Util.trimNull(textDecoder.decode(commentArrayBuffer)).trim());
  }

  return comments;
}

export default class N64DexDriveSaveData {
  static GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE = N64MempackSaveData.GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE;

  static GAMESHARK_ACTIONREPLAY_CART_SAVE_PUBLISHER_CODE = N64MempackSaveData.GAMESHARK_ACTIONREPLAY_CART_SAVE_PUBLISHER_CODE;

  static GAMESHARK_ACTIONREPLAY_CART_SAVE_REGION_CODE = N64MempackSaveData.GAMESHARK_ACTIONREPLAY_CART_SAVE_REGION_CODE;

  static GAMESHARK_ACTIONREPLAY_CART_SAVE_MEDIA_CODE = N64MempackSaveData.GAMESHARK_ACTIONREPLAY_CART_SAVE_MEDIA_CODE;

  static BLACKBAG_CART_SAVE_GAME_SERIAL_CODE = N64MempackSaveData.BLACKBAG_CART_SAVE_GAME_SERIAL_CODE;

  static BLACKBAG_CART_SAVE_PUBLISHER_CODE = N64MempackSaveData.BLACKBAG_CART_SAVE_PUBLISHER_CODE;

  static BLACKBAG_CART_SAVE_REGION_CODE = N64MempackSaveData.BLACKBAG_CART_SAVE_REGION_CODE;

  static BLACKBAG_CART_SAVE_MEDIA_CODE = N64MempackSaveData.BLACKBAG_CART_SAVE_MEDIA_CODE;

  static createFromDexDriveData(dexDriveArrayBuffer) {
    return new N64DexDriveSaveData(dexDriveArrayBuffer);
  }

  static createFromSaveFiles(saveFiles) {
    // The DexDrive image is the DexDrive header then the regular mempack data

    const mempackSaveData = N64MempackSaveData.createFromSaveFiles(saveFiles);

    const headerArrayBuffer = new ArrayBuffer(HEADER_LENGTH);
    const headerArray = new Uint8Array(headerArrayBuffer);

    const magicTextEncoder = new TextEncoder(MAGIC_ENCODING);
    const commentTextEncoder = new TextEncoder(COMMENT_ENCODING);

    // Fill in our magic

    headerArray.fill(0);
    headerArray.set(magicTextEncoder.encode(HEADER_MAGIC), 0);

    // Make an array of our comments, arranged by the starting block of each save

    const comments = Array.from({ length: N64MempackSaveData.NUM_NOTES }, () => null);

    const mempackSaveDataFilesWithComments = mempackSaveData.getSaveFiles().map((file, i) => ({ ...file, comment: saveFiles[i].comment })); // Our list of save files from the memcard data is in the same order as the files were passed in

    mempackSaveDataFilesWithComments.forEach((file) => { comments[file.noteIndex] = file.comment; });

    for (let i = 0; i < N64MempackSaveData.NUM_NOTES; i += 1) {
      if (comments[i] !== null) {
        const encodedComment = commentTextEncoder.encode(comments[i]).slice(0, COMMENT_LENGTH);

        headerArray.set(encodedComment, getCommentStartOffset(i));
      }
    }

    // Now that we've created our DexDrive header, we can create our final memory image. We'll parse it again
    // to pull out the file descriptions

    const finalArrayBuffer = Util.concatArrayBuffers([headerArrayBuffer, mempackSaveData.getArrayBuffer()]);

    return N64DexDriveSaveData.createFromDexDriveData(finalArrayBuffer);
  }

  // This constructor creates a new object from a binary representation of a DexDrive save data file
  constructor(arrayBuffer) {
    this.arrayBuffer = arrayBuffer;

    // Parse the DexDrive-specific header: magic and comments

    const dexDriveHeaderArrayBuffer = arrayBuffer.slice(0, HEADER_LENGTH);

    Util.checkMagic(dexDriveHeaderArrayBuffer, 0, HEADER_MAGIC, MAGIC_ENCODING);

    const comments = getComments(dexDriveHeaderArrayBuffer);

    // Parse the rest of the file
    const mempackArrayBuffer = arrayBuffer.slice(HEADER_LENGTH); // The remainder of the file is the actual contents of the memory card

    const mempack = N64MempackSaveData.createFromN64MempackData(mempackArrayBuffer);

    // Add in the comments we found in the header
    this.saveFiles = mempack.getSaveFiles().map((x) => ({ ...x, comment: comments[x.noteIndex] }));
    this.mempack = mempack;
  }

  getSaveFiles() {
    return this.saveFiles;
  }

  getMempack() {
    return this.mempack;
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
