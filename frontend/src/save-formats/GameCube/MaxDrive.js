// A GameCube MaxDrive file is a .gci file with a 0x80 byte header prepended
//
// Note that many, but not all, of the .gci fields are endian swapped. Specifically, the date and all of the text fields are not swapped.
//
// 0x00-0x0B: Magic ("DATELGC_SAVE")
// 0x10-0x47: Comment 1 (encoding may be either US-ASCII or shift-jis)
// 0x48-0x79: Comment 2
// 0x80-EOF:  .gci file

import GameCubeGciSaveData from './Gci';

import Util from '../../util/util';

const HEADER_LENGTH = 0x80;

const MAGIC = 'DATELGC_SAVE';
const MAGIC_OFFSET = 0;
const MAGIC_ENCODING = 'US-ASCII';

const COMMENT_OFFSETS = [0x10, 0x48];
const COMMENT_LENGTH = 0x38;

const BYTE_SWAP_OFFSETS = [ // https://github.com/dolphin-emu/dolphin/blob/master/Source/Core/Core/HW/GCMemcard/GCMemcardUtils.cpp#L94
  0x06, // Banner and icon flags
  0x2C, // Icon graphic data offset (4 bytes)
  0x2E, // Icon graphic data offset
  0x30, // Icon graphic format
  0x32, // Icon graphic speed
  0x34, // Permission attribute bitfield
  0x36, // Starting block number
  0x38, // Save size in blocks
  0x3A, // Unused
  0x3C, // Comment offset (4 bytes)
  0x3E, // Comment offset
];

export default class GameCubeMaxDriveSaveData {
  static convertMaxDriveToSaveFile(arrayBuffer) {
    Util.checkMagic(arrayBuffer, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);

    const uint8Array = new Uint8Array(arrayBuffer);
    const gciArrayBuffer = arrayBuffer.slice(HEADER_LENGTH);
    const gciDataView = new DataView(gciArrayBuffer);

    BYTE_SWAP_OFFSETS.forEach((offset) => gciDataView.setUint16(offset, gciDataView.getUint16(offset, false), true)); // Weirdly, most but not all entries are a different endianness

    const [saveFile] = GameCubeGciSaveData.convertGcisToSaveFiles([gciArrayBuffer]);

    const maxDriveComments = COMMENT_OFFSETS.map((commentOffset) => Util.readNullTerminatedString(uint8Array, commentOffset, saveFile.inferredCommentEncoding, COMMENT_LENGTH));

    return {
      ...saveFile,
      maxDriveComments,
    };
  }
}
