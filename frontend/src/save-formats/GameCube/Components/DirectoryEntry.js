/* eslint-disable no-bitwise */

/*
The directory entry format is reused in a few different gamecube file type

Here's the structure as assembled from reading
- https://github.com/dolphin-emu/dolphin/blob/ee27f03a4387baca6371a06068274135ff9547a5/Source/Core/Core/HW/GCMemcard/GCMemcard.h#L239
- https://www.gc-forever.com/yagcd/chap12.html#sec12.3.1
- http://www.surugi.com/projects/gcifaq.html
- https://github.com/suloku/gcmm/blob/master/source/gci.h#L12

0x00-0x03: Game code (last character is the region code)
0x04-0x05: Publisher ID
0x06:      unused (0xFF)
0x07:      Banner and icon flags: https://github.com/dolphin-emu/dolphin/blob/ee27f03a4387baca6371a06068274135ff9547a5/Source/Core/Core/HW/GCMemcard/GCMemcard.h#L254
0x08-0x27: File ID
0x28-0x2B: Date last modified
0x2C-0x2F: Icon graphic data offset
0x30-0x31: Icon graphic format: https://github.com/dolphin-emu/dolphin/blob/ee27f03a4387baca6371a06068274135ff9547a5/Source/Core/Core/HW/GCMemcard/GCMemcard.h#L273
0x32-0x33: Icon graphic speed: https://github.com/dolphin-emu/dolphin/blob/ee27f03a4387baca6371a06068274135ff9547a5/Source/Core/Core/HW/GCMemcard/GCMemcard.h#L281
0x34:      Permission attribute bitfield (public/no copy/no move)
0x35:      Copy counter
0x36-0x37: Starting block number
0x38-0x39: Save size in blocks
0x3A-0x3B: unused (0xFFFF)
0x3C-0x3F: Comment offset
*/

import GameCubeUtil from '../Util';
import Util from '../../../util/util';

import GameCubeBasics from './Basics';

const { LITTLE_ENDIAN } = GameCubeBasics;

const ENCODING = 'US-ASCII'; // From tests in Gci.spec.js with various Japanese-only games, I believe all the fields in this object are encoded as ASCII. Only the comments appear to be encoded as shift-jis in Japanese games

const GAME_CODE_OFFSET = 0x00;
const GAME_CODE_LENGTH = 4;
const REGION_CODE_OFFSET = 0x03;
const REGION_CODE_LENGTH = 1;
const PUBLISHER_CODE_OFFSET = 0x04;
const PUBLISHER_CODE_LENGTH = 2;
const BANNER_AND_ICON_FLAGS_OFFSET = 0x07;
const FILE_NAME_OFFSET = 0x08;
const FILE_NAME_LENGTH = 32;
const DATE_LAST_MODIFIED_OFFSET = 0x28;

const ICON_START_OFFSET = 0x2C;
const ICON_FORMAT_OFFSET = 0x30;
const ICON_SPEED_OFFSET = 0x32;

const PERMISSION_ATTRIBUTE_BITFIELD_OFFSET = 0x34;
const COPY_COUNTER_OFFSET = 0x35;
const SAVE_START_BLOCK_OFFSET = 0x36;
const SAVE_SIZE_BLOCKS_OFFSET = 0x38;

const COMMENT_START_OFFSET = 0x3C;
const COMMENT_LENGTH = 32;

const DIRECTORY_ENTRY_LENGTH = 0x40;
const DIRECTORY_ENTRY_PADDING_VALUE = 0xFF;
const DIRECTORY_ENTRY_FILE_NAME_FILL_VALUE = 0x00; // The filename should be filled with null characters so we don't read past the end of our string

export default class GameCubeDirectoryEntry {
  static ICON_SPEED_NONE = 0x00;

  static ICON_SPEED_FAST = 0x01;

  static ICON_SPEED_MIDDLE = 0x02;

  static ICON_SPEED_SLOW = 0x03;

  static PERMISSION_ATTRIBUTE_PUBLIC = 0x04;

  static PERMISSION_ATTRIBUTE_NO_COPY = 0x08;

  static PERMISSION_ATTRIBUTE_NO_MOVE = 0x10;

  static LENGTH = DIRECTORY_ENTRY_LENGTH;

  static writeDirectoryEntry(saveFile) {
    let arrayBuffer = Util.getFilledArrayBuffer(DIRECTORY_ENTRY_LENGTH, DIRECTORY_ENTRY_PADDING_VALUE);

    arrayBuffer = Util.fillArrayBufferPortion(arrayBuffer, FILE_NAME_OFFSET, FILE_NAME_LENGTH, DIRECTORY_ENTRY_FILE_NAME_FILL_VALUE);

    arrayBuffer = Util.setString(arrayBuffer, GAME_CODE_OFFSET, saveFile.gameCode, ENCODING, GAME_CODE_LENGTH);
    arrayBuffer = Util.setString(arrayBuffer, PUBLISHER_CODE_OFFSET, saveFile.publisherCode, ENCODING, PUBLISHER_CODE_LENGTH);
    arrayBuffer = Util.setString(arrayBuffer, FILE_NAME_OFFSET, saveFile.fileName, ENCODING, FILE_NAME_LENGTH);

    const dataView = new DataView(arrayBuffer);

    dataView.setUint8(BANNER_AND_ICON_FLAGS_OFFSET, saveFile.bannerAndIconFlags);
    dataView.setUint32(DATE_LAST_MODIFIED_OFFSET, saveFile.dateLastModifiedCode, LITTLE_ENDIAN);

    dataView.setUint32(ICON_START_OFFSET, saveFile.iconStartOffset, LITTLE_ENDIAN);
    dataView.setUint16(ICON_FORMAT_OFFSET, saveFile.iconFormatCode, LITTLE_ENDIAN);
    dataView.setUint16(ICON_SPEED_OFFSET, saveFile.iconSpeedCode, LITTLE_ENDIAN);

    dataView.setUint8(PERMISSION_ATTRIBUTE_BITFIELD_OFFSET, saveFile.permissionAttributeBitfield);
    dataView.setUint8(COPY_COUNTER_OFFSET, saveFile.copyCounter);
    dataView.setUint16(SAVE_START_BLOCK_OFFSET, saveFile.saveStartBlock, LITTLE_ENDIAN);
    dataView.setUint16(SAVE_SIZE_BLOCKS_OFFSET, saveFile.saveSizeBlocks, LITTLE_ENDIAN);
    dataView.setUint32(COMMENT_START_OFFSET, saveFile.commentStart, LITTLE_ENDIAN);

    return arrayBuffer;
  }

  static getComments(commentStart, rawDataArrayBuffer, encoding) {
    const uint8Array = new Uint8Array(rawDataArrayBuffer);

    const commentOffsets = [
      commentStart,
      commentStart + COMMENT_LENGTH,
    ];

    return commentOffsets.map((commentOffset) => Util.readNullTerminatedString(uint8Array, commentOffset, encoding, COMMENT_LENGTH));
  }

  static readDirectoryEntry(arrayBuffer) {
    const uint8Array = new Uint8Array(arrayBuffer);
    const dataView = new DataView(arrayBuffer);

    // An empty entry appears to be all 0xFF. Dolphin just checks the game code, so we will too
    // https://github.com/dolphin-emu/dolphin/blob/c9bdda63dc624995406c37f4e29e3b8c4696e6d0/Source/Core/Core/HW/GCMemcard/GCMemcard.cpp#L788
    // https://github.com/dolphin-emu/dolphin/blob/c9bdda63dc624995406c37f4e29e3b8c4696e6d0/Source/Core/Core/HW/GCMemcard/GCMemcard.h#L243
    const isValidEntry = uint8Array
      .slice(GAME_CODE_OFFSET, GAME_CODE_OFFSET + GAME_CODE_LENGTH)
      .reduce((accumulator, byteVal) => (accumulator || (byteVal !== 0xFF)), false);

    if (!isValidEntry) {
      return null;
    }

    const gameCode = Util.readString(uint8Array, GAME_CODE_OFFSET, ENCODING, GAME_CODE_LENGTH);
    const regionCode = Util.readString(uint8Array, REGION_CODE_OFFSET, ENCODING, REGION_CODE_LENGTH);
    const publisherCode = Util.readString(uint8Array, PUBLISHER_CODE_OFFSET, ENCODING, PUBLISHER_CODE_LENGTH);
    const bannerAndIconFlags = dataView.getUint8(BANNER_AND_ICON_FLAGS_OFFSET);
    const fileName = Util.readNullTerminatedString(uint8Array, FILE_NAME_OFFSET, ENCODING, FILE_NAME_LENGTH);
    const dateLastModifiedCode = dataView.getUint32(DATE_LAST_MODIFIED_OFFSET, LITTLE_ENDIAN);

    const iconStartOffset = dataView.getUint32(ICON_START_OFFSET, LITTLE_ENDIAN);
    const iconFormatCode = dataView.getUint16(ICON_FORMAT_OFFSET, LITTLE_ENDIAN);
    const iconSpeedCode = dataView.getUint16(ICON_SPEED_OFFSET, LITTLE_ENDIAN);

    const permissionAttributeBitfield = dataView.getUint8(PERMISSION_ATTRIBUTE_BITFIELD_OFFSET);
    const copyCounter = dataView.getUint8(COPY_COUNTER_OFFSET);
    const saveStartBlock = dataView.getUint16(SAVE_START_BLOCK_OFFSET, LITTLE_ENDIAN);
    const saveSizeBlocks = dataView.getUint16(SAVE_SIZE_BLOCKS_OFFSET, LITTLE_ENDIAN);
    const commentStart = dataView.getUint32(COMMENT_START_OFFSET, LITTLE_ENDIAN);

    return {
      gameCode,
      regionCode,
      region: GameCubeUtil.getRegionString(regionCode),
      publisherCode,
      bannerAndIconFlags,
      fileName,
      dateLastModifiedCode,
      dateLastModified: GameCubeUtil.getDate(dateLastModifiedCode),
      iconStartOffset,
      iconFormatCode,
      iconSpeedCode,
      permissionAttributeBitfield,
      copyCounter,
      saveStartBlock,
      saveSizeBlocks,
      commentStart,
    };
  }
}
