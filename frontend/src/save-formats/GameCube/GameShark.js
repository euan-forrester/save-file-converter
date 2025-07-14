// A GameCube GameShark file is a .gci file the a 0x110 byte header prepended
//
// 0x00-0x05:  Magic ("GCSAVE")
// 0x10-0x109: Comment (encoding may be either US-ASCII or shift-jis)
// 0x110-EOF:  .gci file

import GameCubeGciSaveData from './Gci';

import Util from '../../util/util';

const HEADER_LENGTH = 0x110;

const MAGIC = 'GCSAVE';
const MAGIC_OFFSET = 0;
const MAGIC_ENCODING = 'US-ASCII';

const COMMENT_OFFSET = 0x10;
const COMMENT_LENGTH = HEADER_LENGTH - COMMENT_OFFSET;

export default class GameCubeGameSharkSaveData {
  static convertGameSharkToSaveFile(arrayBuffer) {
    Util.checkMagic(arrayBuffer, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);

    const uint8Array = new Uint8Array(arrayBuffer);
    const gciArrayBuffer = arrayBuffer.slice(HEADER_LENGTH);

    const [saveFile] = GameCubeGciSaveData.convertGcisToSaveFiles([gciArrayBuffer]);

    const gameSharkComment = Util.readNullTerminatedString(uint8Array, COMMENT_OFFSET, saveFile.inferredCommentEncoding, COMMENT_LENGTH);

    return {
      ...saveFile,
      gameSharkComment,
    };
  }
}
