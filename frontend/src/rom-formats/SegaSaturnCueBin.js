// Extracts some information from a Sega Saturn .bin file for a game in .cue/.bin format
// Note that it must be the first track

import Util from '../util/util';

const MAGIC = 'SEGA SEGASATURN ';
const MAGIC_OFFSET = 0x10;
const MAGIC_ENCODING = 'US-ASCII';

const GAME_ID_OFFSET = 0x30;
const GAME_ID_LENGTH = 0x10;
const GAME_ID_ENCODING = 'US-ASCII';

export default class SegaSaturnCueBin {
  constructor(binArrayBuffer) {
    Util.checkMagic(binArrayBuffer, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);

    const binUint8Array = new Uint8Array(binArrayBuffer);

    this.gameId = Util.readNullTerminatedString(binUint8Array, GAME_ID_OFFSET, GAME_ID_ENCODING, GAME_ID_LENGTH);
  }

  getGameId() {
    return this.gameId;
  }

  static getFileExtensions() {
    return [
      '.bin',
    ];
  }
}
