/* eslint-disable no-bitwise */

/*
Format taken from https://mc.pp.se/dc/vms/flashmem.html and https://segaxtreme.net/resources/maple-bus-1-0-function-type-specifications-ft1-storage-function.195/

0x00      : 8 bit int : file type (0x00 = no file, 0x33 = data, 0xcc = game)
0x01      : 8 bit int : copy protect (0xff = copy protected, anything else = copy okay. Can limit number of times file can be copied by incrementing this value when it's copied)
0x02-0x03 : 16 bit int (little endian) : location of first block
0x04-0x0f : ASCII string : filename (12 characters)
0x10-0x17 : BCD timestamp (see below) : file creation time
0x18-0x19 : 16 bit int (little endian) : file size (in blocks)
0x1a-0x1b : 16 bit int (little endian) : file header blocks number
0x1c-0x1f : unused (all zero)

Then in the save data there is the file header block. It can be anywhere in the file data and its location is specified in the directory entry.

0x00-0x0F : Storage comment (note that comments are stored with little endian byte ordering)
0x10-0x3F : File comment
0x40-0x1FF : Icon data
*/

import Util from '../../../util/util';

import DreamcastBasics from './Basics';
import DreamcastUtil from '../Util';

const {
  LITTLE_ENDIAN,
  BLOCK_SIZE,
} = DreamcastBasics;

const FILE_TYPE_OFFSET = 0x00;
const COPY_PROTECT_OFFSET = 0x01;
const FIRST_BLOCK_NUMBER_OFFSET = 0x02;
const FILENAME_OFFSET = 0x04;
const FILENAME_LENGTH = 12;
const FILENAME_ENCODING = 'US-ASCII';
const FILE_CREATION_TIME_OFFSET = 0x10;
const FILE_SIZE_IN_BLOCKS_OFFSET = 0x18;
const FILE_HEADER_BLOCK_NUMBER_OFFSET = 0x1A;

const FILE_TYPE_LOOKUP = {
  0x00: 'No file',
  0x33: 'Data',
  0xCC: 'Game',
};

const UNKNOWN_FILE_TYPE_STRING = 'Unknown';
const UNKNOWN_FILE_TYPE = 0xFF;

const POSSIBLE_FILE_TYPES = Object.keys(FILE_TYPE_LOOKUP);

const COPY_PROTECT_COPY_OKAY = 0x00;
const COPY_PROTECT_NO_COPY = 0xFF;

const DIRECTORY_ENTRY_PADDING_VALUE = 0x00;

const DIRECTORY_ENTRY_LENGTH = 32;

const FILE_HEADER_COMMENT_ENCODING = 'shift-jis'; // The official docs say that the storage comment is ascii and the file comment is either one- or two-byte encoding. In practice, I've found that both comments can be encoded with shift-jis (which is identical with ascii for most of the first 127 ascii characters).
const FILE_HEADER_STORAGE_COMMENT_OFFSET = 0x00;
const FILE_HEADER_STORAGE_COMMENT_LENGTH = 0x10;
const FILE_HEADER_FILE_COMMENT_OFFSET = 0x10;
const FILE_HEADER_FILE_COMMENT_LENGTH = 0x30;

function getFileTypeString(fileType) {
  if (Object.hasOwn(FILE_TYPE_LOOKUP, fileType)) {
    return FILE_TYPE_LOOKUP[fileType];
  }

  return UNKNOWN_FILE_TYPE_STRING;
}

function getFileTypeValue(fileTypeString) {
  const fileType = POSSIBLE_FILE_TYPES.find((key) => FILE_TYPE_LOOKUP[key] === fileTypeString);

  if (fileType === undefined) {
    return UNKNOWN_FILE_TYPE;
  }

  return fileType;
}

export default class DreamcastDirectoryEntry {
  static LENGTH = DIRECTORY_ENTRY_LENGTH;

  static writeDirectoryEntry(saveFile) {
    let arrayBuffer = Util.getFilledArrayBuffer(DIRECTORY_ENTRY_LENGTH, DIRECTORY_ENTRY_PADDING_VALUE);

    arrayBuffer = Util.setString(arrayBuffer, FILENAME_OFFSET, saveFile.filename, FILENAME_ENCODING, FILENAME_LENGTH);
    arrayBuffer = DreamcastUtil.writeBcdTimestamp(arrayBuffer, FILE_CREATION_TIME_OFFSET, saveFile.fileCreationTime);

    const dataView = new DataView(arrayBuffer);

    dataView.setUint8(FILE_TYPE_OFFSET, getFileTypeValue(saveFile.fileType));
    dataView.setUint8(COPY_PROTECT_OFFSET, saveFile.copyProtected ? COPY_PROTECT_NO_COPY : COPY_PROTECT_COPY_OKAY);
    dataView.setUint16(FIRST_BLOCK_NUMBER_OFFSET, saveFile.firstBlockNumber, LITTLE_ENDIAN);
    dataView.setUint16(FILE_SIZE_IN_BLOCKS_OFFSET, saveFile.fileSizeInBlocks, LITTLE_ENDIAN);
    dataView.setUint16(FILE_HEADER_BLOCK_NUMBER_OFFSET, saveFile.fileHeaderBlockNumber, LITTLE_ENDIAN);

    return arrayBuffer;
  }

  static getComments(fileHeaderBlockNumber, rawData) {
    const fileHeaderBlock = rawData.slice(fileHeaderBlockNumber * BLOCK_SIZE, (fileHeaderBlockNumber + 1) * BLOCK_SIZE);
    const uint8Array = new Uint8Array(fileHeaderBlock);

    return {
      storageComment: Util.readNullTerminatedString(uint8Array, FILE_HEADER_STORAGE_COMMENT_OFFSET, FILE_HEADER_COMMENT_ENCODING, FILE_HEADER_STORAGE_COMMENT_LENGTH),
      fileComment: Util.readNullTerminatedString(uint8Array, FILE_HEADER_FILE_COMMENT_OFFSET, FILE_HEADER_COMMENT_ENCODING, FILE_HEADER_FILE_COMMENT_LENGTH),
    };
  }

  static readDirectoryEntry(arrayBuffer) {
    const uint8Array = new Uint8Array(arrayBuffer);
    const dataView = new DataView(arrayBuffer);

    // An empty entry is one that's all 0x0 (might only be necessary to check the file type?)
    const isValidEntry = uint8Array.some((i) => i !== DIRECTORY_ENTRY_PADDING_VALUE);

    if (!isValidEntry) {
      return null;
    }

    const fileTypeVal = dataView.getUint8(FILE_TYPE_OFFSET);
    const fileType = getFileTypeString(fileTypeVal);
    const copyProtected = dataView.getUint8(COPY_PROTECT_OFFSET) === COPY_PROTECT_NO_COPY; // Any value other than 0xFF means that the file can be copied: https://segaxtreme.net/resources/maple-bus-1-0-function-type-specifications-ft1-storage-function.195/
    const firstBlockNumber = dataView.getUint16(FIRST_BLOCK_NUMBER_OFFSET, LITTLE_ENDIAN);
    const filename = Util.readNullTerminatedString(uint8Array, FILENAME_OFFSET, FILENAME_ENCODING, FILENAME_LENGTH);
    const fileCreationTime = DreamcastUtil.readBcdTimestamp(arrayBuffer, FILE_CREATION_TIME_OFFSET);
    const fileSizeInBlocks = dataView.getUint16(FILE_SIZE_IN_BLOCKS_OFFSET, LITTLE_ENDIAN);
    const fileHeaderBlockNumber = dataView.getUint16(FILE_HEADER_BLOCK_NUMBER_OFFSET, LITTLE_ENDIAN);

    return {
      fileType,
      copyProtected,
      firstBlockNumber,
      filename,
      fileCreationTime,
      fileSizeInBlocks,
      fileHeaderBlockNumber,
    };
  }
}
