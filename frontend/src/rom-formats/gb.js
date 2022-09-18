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

const CARTRIDGE_TYPE_OFFSET = 0x147;
const SRAM_SIZE_OFFSET = 0x149;

const CARTRIDGE_TYPE_MBC2 = 0x5;
const CARTRIDGE_TYPE_MBC2_PLUS_BATTERY = 0x6;

function isMbc2(cartridgeType) {
  return ((cartridgeType === CARTRIDGE_TYPE_MBC2) || (cartridgeType === CARTRIDGE_TYPE_MBC2_PLUS_BATTERY));
}

function getSramSize(sramValue, cartridgeType) {
  // Memory Bank Controller 2 cartridge types must specify 0 for sramValue, but have SRAM
  if (isMbc2(cartridgeType)) {
    return 2048;
  }

  switch (sramValue) {
    case 0:
      return 0;

    case 1:
      return 2048;

    case 2:
      return 8192;

    case 3:
      return 32768;

    case 4:
      return 131072;

    case 5:
      return 65536;

    default:
      throw new Error(`Unknown SRAM size value: ${sramValue}. Valid values are 0 - 5`);
  }
}

export default class GbRom {
  constructor(romArrayBuffer) {
    const uint8Array = new Uint8Array(romArrayBuffer);

    this.isGbc = (uint8Array[GBC_FLAG_OFFSET] === GBC_FLAG_GB_AND_GBC) || (uint8Array[GBC_FLAG_OFFSET] === GBC_FLAG_GBC_ONLY);

    const internalNameLength = this.isGbc ? INTERNAL_NAME_LENGTH_GBC : INTERNAL_NAME_LENGTH_GB;

    this.internalName = Util.readNullTerminatedString(uint8Array, INTERNAL_NAME_OFFSET, INTERNAL_NAME_ENCODING, internalNameLength);
    this.cartridgeType = uint8Array[CARTRIDGE_TYPE_OFFSET];
    this.sramSize = getSramSize(uint8Array[SRAM_SIZE_OFFSET], this.cartridgeType);

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

  getCartridgeType() {
    return this.cartridgeType;
  }

  getSramSize() {
    return this.sramSize;
  }

  static getFileExtensions() {
    return [
      '.gb',
      '.gbc',
    ];
  }
}
