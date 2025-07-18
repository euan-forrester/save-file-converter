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

import N64Basics from './Components/Basics';
import N64MempackSaveData from './Mempack';
import Util from '../../util/util';

const {
  NUM_NOTES,
  TOTAL_MEMPACK_SIZE,
} = N64Basics;

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

  for (let i = 0; i < NUM_NOTES; i += 1) {
    const commentStartOffset = getCommentStartOffset(i);
    const commentArrayBuffer = headerArrayBuffer.slice(commentStartOffset, commentStartOffset + COMMENT_LENGTH);

    comments.push(Util.trimNull(textDecoder.decode(commentArrayBuffer)).trim());
  }

  return comments;
}

export default class N64DexDriveSaveData {
  static createFromDexDriveData(dexDriveArrayBuffer, randomNumberGenerator = null) {
    return new N64DexDriveSaveData(dexDriveArrayBuffer, randomNumberGenerator);
  }

  static createFromSaveFiles(saveFiles, randomNumberGenerator = null) {
    // The DexDrive image is the DexDrive header then the regular mempack data

    const mempackSaveData = N64MempackSaveData.createFromSaveFiles(saveFiles, randomNumberGenerator);

    const headerArrayBuffer = new ArrayBuffer(HEADER_LENGTH);
    const headerArray = new Uint8Array(headerArrayBuffer);

    const magicTextEncoder = new TextEncoder(MAGIC_ENCODING);
    const commentTextEncoder = new TextEncoder(COMMENT_ENCODING);

    // Fill in our magic

    headerArray.fill(0);
    headerArray.set(magicTextEncoder.encode(HEADER_MAGIC), 0);

    // Make an array of our comments, arranged by the starting block of each save

    const comments = Array.from({ length: NUM_NOTES }, () => null);

    const mempackSaveDataFilesWithComments = mempackSaveData.getSaveFiles().map((file, i) => ({ ...file, comment: saveFiles[i].comment })); // Our list of save files from the memcard data is in the same order as the files were passed in

    mempackSaveDataFilesWithComments.forEach((file) => { comments[file.noteIndex] = file.comment; });

    for (let i = 0; i < NUM_NOTES; i += 1) {
      if (comments[i] !== null) {
        const encodedComment = commentTextEncoder.encode(comments[i]).slice(0, COMMENT_LENGTH);

        headerArray.set(encodedComment, getCommentStartOffset(i));
      }
    }

    // Now that we've created our DexDrive header, we can create our final memory image. We'll parse it again
    // to pull out the file descriptions

    const finalArrayBuffer = Util.concatArrayBuffers([headerArrayBuffer, mempackSaveData.getArrayBuffer()]);

    return N64DexDriveSaveData.createFromDexDriveData(finalArrayBuffer, randomNumberGenerator);
  }

  // This constructor creates a new object from a binary representation of a DexDrive save data file
  constructor(arrayBuffer, randomNumberGenerator = null) {
    this.arrayBuffer = arrayBuffer;

    // Parse the DexDrive-specific header: magic and comments

    let dexDriveHeaderArrayBuffer = arrayBuffer.slice(0, HEADER_LENGTH);
    let mempackArrayBuffer = arrayBuffer.slice(HEADER_LENGTH); // The remainder of the file is the actual contents of the memory card

    try {
      Util.checkMagic(dexDriveHeaderArrayBuffer, 0, HEADER_MAGIC, MAGIC_ENCODING);
    } catch (e) {
      if (arrayBuffer.byteLength === TOTAL_MEMPACK_SIZE) {
        // Some files, found on gamefaqs primarily, are labeled as being dexdrive but are actually
        // raw memcard images. This is likely due to gamefaqs' policy of only allowing "legitimate" saves
        // and not those that could have come from an emulator.
        dexDriveHeaderArrayBuffer = Util.getFilledArrayBuffer(HEADER_LENGTH, 0x00);
        mempackArrayBuffer = arrayBuffer;
      } else if (arrayBuffer.byteLength !== (HEADER_LENGTH + TOTAL_MEMPACK_SIZE)) {
        // For some files found on the Internet they just contain a completely blank header. Not sure what
        // program makes them. But they're parseable by the rest of the code here even though they don't
        // contain the correct magic
        throw new Error('This does not appear to be a N64 DexDrive file');
      }
    }

    const comments = getComments(dexDriveHeaderArrayBuffer);

    // Parse the rest of the file

    const mempack = N64MempackSaveData.createFromN64MempackData(mempackArrayBuffer);

    // Add in the comments we found in the header
    this.saveFiles = mempack.getSaveFiles().map((x) => ({ ...x, comment: comments[x.noteIndex] }));
    this.mempack = N64MempackSaveData.createFromSaveFiles(this.saveFiles, randomNumberGenerator); // Re-create our memory pack image from scratch because many dexdrive files found in the wild are seen as corrupt when loaded in game
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
