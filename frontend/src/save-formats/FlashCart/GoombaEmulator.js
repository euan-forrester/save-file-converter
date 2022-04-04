/*
Based on the Goomba Save Manager, specifically:
- Ignore the first 4 bytes of the file: https://github.com/libertyernie/goombasav/blob/master/main.c#L127
- Format for the header: https://github.com/libertyernie/goombasav/blob/master/goombasav.h#L101
- Criteria for "cleaning" the data first: https://github.com/libertyernie/goombasav/blob/master/goombasav.c#L330
*/

const LITTLE_ENDIAN = true;

// Note the GSM doesn't ever create the 'magic' value, and only copies it from another save. And the usage notes explicitly
// say that it cannot create a new save file. So I wonder if the magic is variable and difficult to get right

const MAGIC = 0xD831A757; // No idea what this represents, but it seems to be consistent at the beginning of the sample files I have, and GSM ignores it when reading
const MAGIC_OFFSET = 0;

const SIZE_OFFSET = 4; // Header + data size

const TYPE_OFFSET = 6;
const TYPE_SAVE_STATE = 0;
const TYPE_SRAM_SAVE = 1;
const TYPE_CONFIG_DATA = 2;
const TYPE_PALETTE = 5;

const UNCOMPRESSED_SIZE_OFFSET = 8;
const FRAME_COUNT_OFFSET = 12;
const CHECKSUM_OFFSET = 16;

const GAME_TITLE_OFFSET = 20;
const GAME_TITLE_LENGTH = 32;
const GAME_TITLE_ENCODING = 'US-ASCII';

const FILE_TYPE_NAMES = {
  TYPE_SAVE_STATE: 'Save state',
  TYPE_SRAM_SAVE: 'SRAM save',
  TYPE_CONFIG_DATA: 'Config data',
  TYPE_PALETTE: 'Palette',
}

import Util from '../../util/Util';

export default class GoombaEmulatorSaveData {
  static createFromGoombaData(goombaArrayBuffer) {
    const goombaDataView = new DataView(goombaArrayBuffer);
    const goombaUint8Array = new Uint8Array(goombaArrayBuffer);

    const magic = goombaDataView.getUint32(MAGIC_OFFSET, LITTLE_ENDIAN);

    if (magic !== MAGIC) {
      throw new Error(`File appears to be corrupted: expected 0x${MAGIC.toString('hex')} but found ${magic.toString('hex')}`);
    }

    const type = goombaDataView.getUint16(TYPE_OFFSET, LITTLE_ENDIAN);

    if (type !== TYPE_SRAM_SAVE) {
      throw new Error(`File appears to be ${FILE_TYPE_NAMES[type]} instead of ${FILE_TYPE_NAMES[TYPE_SRAM_SAVE]}`);
    }

    const compressedTotalSize = goombaDataView.getUint16(SIZE_OFFSET, LITTLE_ENDIAN);
    const uncompressedSize = goombaDataView.getUint32(UNCOMPRESSED_SIZE_OFFSET, LITTLE_ENDIAN);
    const frameCount = goombaDataView.getUint32(FRAME_COUNT_OFFSET, LITTLE_ENDIAN);
    const checksum = goombaDataView.getUint32(CHECKSUM_OFFSET, LITTLE_ENDIAN);

    const gameTitle = Util.readNullTerminatedString(goombaUint8Array, GAME_TITLE_OFFSET, GAME_TITLE_ENCODING, GAME_TITLE_LENGTH);

    return new GoombaEmulatorSaveData(goombaArrayBuffer, goombaArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    return new GoombaEmulatorSaveData(rawArrayBuffer, rawArrayBuffer);
  }

  constructor(rawArrayBuffer, goombaArrayBuffer) {
    this.rawArrayBuffer = rawArrayBuffer;
    this.goombaArrayBuffer = goombaArrayBuffer;
  }

  getRawArrayBuffer() {
    return this.rawArrayBuffer;
  }

  getGoombaArrayBuffer() {
    return this.goombaArrayBuffer;
  }
}
