/* eslint-disable no-bitwise */

/*
Format taken from https://mc.pp.se/dc/vms/flashmem.html

0x00      : 8 bit int : file type (0x00 = no file, 0x33 = data, 0xcc = game)
0x01      : 8 bit int : copy protect (0x00 = copy ok, 0xff = copy protected)
0x02-0x03 : 16 bit int (little endian) : location of first block
0x04-0x0f : ASCII string : filename (12 characters)
0x10-0x17 : BCD timestamp (see below) : file creation time
0x18-0x19 : 16 bit int (little endian) : file size (in blocks)
0x1a-0x1b : 16 bit int (little endian) : offset of header (in blocks) from file start
0x1c-0x1f : unused (all zero)
*/

import Util from '../../../util/util';

import DreamcastBasics from './Basics';
import DreamcastUtil from '../Util';

const {
  LITTLE_ENDIAN,
} = DreamcastBasics;

const FILE_TYPE_OFFSET = 0x00;
const COPY_PROTECT_OFFSET = 0x01;
const FIRST_BLOCK_NUMBER_OFFSET = 0x02;
const FILENAME_OFFSET = 0x04;
const FILENAME_LENGTH = 12;
const FILENAME_ENCODING = 'US-ASCII';
const FILE_CREATION_TIME_OFFSET = 0x10;
const FILE_SIZE_IN_BLOCKS_OFFSET = 0x18;
const FILE_HEADER_OFFSET_IN_BLOCKS_OFFSET = 0x1A;

const FILE_TYPE_LOOKUP = {
  0x00: 'No file',
  0x33: 'Data',
  0xCC: 'Game',
};

const UNKNOWN_FILE_TYPE = 'Unknown';

const COPY_PROTECT_COPY_OKAY = 0x00;
// const COPY_PROTECT_NO_COPY = 0xFF;

const DIRECTORY_ENTRY_PADDING_VALUE = 0x00;

const DIRECTORY_ENTRY_LENGTH = 32;

export default class DreamcastDirectoryEntry {
  static LENGTH = DIRECTORY_ENTRY_LENGTH;

  static writeDirectoryEntry(/* saveFile */) {
    const arrayBuffer = Util.getFilledArrayBuffer(DIRECTORY_ENTRY_LENGTH, DIRECTORY_ENTRY_PADDING_VALUE);

    return arrayBuffer;
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
    const fileType = Object.hasOwn(FILE_TYPE_LOOKUP, fileTypeVal) ? FILE_TYPE_LOOKUP[fileTypeVal] : UNKNOWN_FILE_TYPE;
    const copyProtected = dataView.getUint8(COPY_PROTECT_OFFSET) !== COPY_PROTECT_COPY_OKAY;
    const firstBlockNumber = dataView.getUint16(FIRST_BLOCK_NUMBER_OFFSET, LITTLE_ENDIAN);
    const filename = Util.readNullTerminatedString(uint8Array, FILENAME_OFFSET, FILENAME_ENCODING, FILENAME_LENGTH);
    const fileCreationTime = DreamcastUtil.readBcdTimestamp(arrayBuffer, FILE_CREATION_TIME_OFFSET);
    const fileSizeInBlocks = dataView.getUint16(FILE_SIZE_IN_BLOCKS_OFFSET, LITTLE_ENDIAN);
    const fileHeaderOffsetInBlocks = dataView.getUint16(FILE_HEADER_OFFSET_IN_BLOCKS_OFFSET, LITTLE_ENDIAN);

    return {
      fileType,
      copyProtected,
      firstBlockNumber,
      filename,
      fileCreationTime,
      fileSizeInBlocks,
      fileHeaderOffsetInBlocks,
    };
  }
}
