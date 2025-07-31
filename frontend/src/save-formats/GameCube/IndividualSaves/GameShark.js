// A GameCube GameShark file is a .gci file with a 0x110 byte header prepended
//
// 0x00-0x05:  Magic ("GCSAVE")
// 0x10-0x109: Comment (encoding may be either US-ASCII or shift-jis)
// 0x110-EOF:  .gci file

import GameCubeGciSaveData from './Gci';
import GameCubeBasics from '../Components/Basics';

import Util from '../../../util/util';

const { BLOCK_SIZE } = GameCubeBasics;

const HEADER_LENGTH = 0x110;

const MAGIC = 'GCSAVE';
const MAGIC_OFFSET = 0;
const MAGIC_ENCODING = 'US-ASCII';

const COMMENT_OFFSET = 0x10;
const COMMENT_LENGTH = HEADER_LENGTH - COMMENT_OFFSET;

export default class GameCubeGameSharkSaveData {
  static convertIndividualSaveToSaveFile(arrayBuffer) {
    Util.checkMagic(arrayBuffer, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);

    const uint8Array = new Uint8Array(arrayBuffer);
    const gciArrayBuffer = arrayBuffer.slice(HEADER_LENGTH);

    const saveFile = GameCubeGciSaveData.convertIndividualSaveToSaveFile(gciArrayBuffer, false); // Save size in blocks may be set incorrectly, so don't check it: https://github.com/dolphin-emu/dolphin/blob/master/Source/Core/Core/HW/GCMemcard/GCMemcardUtils.cpp#L162

    const gameSharkComment = Util.readNullTerminatedString(uint8Array, COMMENT_OFFSET, saveFile.inferredCommentEncoding, COMMENT_LENGTH);

    return {
      ...saveFile,
      saveSizeBlocks: Math.ceil(saveFile.rawData.byteLength / BLOCK_SIZE), // Fix up the save size manually
      gameSharkComment,
    };
  }
}
