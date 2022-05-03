// Extracts some information from a Game Boy ROM.
// Information can be found here: https://gbdev.gg8.se/wiki/articles/The_Cartridge_Header#0134-0143_-_Title

import Util from '../util/util';

const INTERNAL_NAME_OFFSET = 0x134;
const INTERNAL_NAME_LENGTH_GB = 0x10;
const INTERNAL_NAME_LENGTH_GBC = 0xB;
const INTERNAL_NAME_ENCODING = 'US-ASCII';

const GBC_FLAG_OFFSET = 0x143;
const GBC_FLAG_GB_AND_GBC = 0x80;
const GBC_FLAG_GBC_ONLY = 0xC0;

export default class GbRom {
  constructor(romArrayBuffer) {
    const uint8Array = new Uint8Array(romArrayBuffer);

    this.isGbc = (uint8Array[GBC_FLAG_OFFSET] === GBC_FLAG_GB_AND_GBC) || (uint8Array[GBC_FLAG_OFFSET] === GBC_FLAG_GBC_ONLY);

    const internalNameLength = this.isGbc ? INTERNAL_NAME_LENGTH_GBC : INTERNAL_NAME_LENGTH_GB;

    this.internalName = Util.readNullTerminatedString(uint8Array, INTERNAL_NAME_OFFSET, INTERNAL_NAME_ENCODING, internalNameLength);
    this.romArrayBuffer = romArrayBuffer;
  }

  getInternalName() {
    return this.internalName;
  }

  getRomArrayBuffer() {
    return this.romArrayBuffer;
  }

  getIsGbc() {
    return this.isGbc;
  }

  static getFileExtensions() {
    return [
      '.gb',
      '.gbc',
    ];
  }
}
