// Extracts some information from a Game Boy ROM.

import Util from '../util/util';

const INTERNAL_NAME_OFFSET = 0x134;
const INTERNAL_NAME_LENGTH = 0x13;
const INTERNAL_NAME_ENCODING = 'US-ASCII';

export default class GbRom {
  constructor(romArrayBuffer) {
    const uint8Array = new Uint8Array(romArrayBuffer);

    this.internalName = Util.readNullTerminatedString(uint8Array, INTERNAL_NAME_OFFSET, INTERNAL_NAME_ENCODING, INTERNAL_NAME_LENGTH);
    this.romArrayBuffer = romArrayBuffer;
  }

  getInternalName() {
    return this.internalName;
  }

  getRomArrayBuffer() {
    return this.romArrayBuffer;
  }
}
