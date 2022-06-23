/* eslint-disable no-bitwise */

// Extracts some information from an NES ROM.
//
// There are 2 different formats: iNES and NES 2.0:
// - iNES: https://www.nesdev.org/wiki/INES
// - NES 2.0: https://www.nesdev.org/wiki/NES_2.0

const LITTLE_ENDIAN = true;

const HEADER_LENGTH = 16; // Both formats have a header that's the same length

const MAGIC_OFFSET = 0;
const MAGIC = 0x1A53454E; // 'NES' followed by EOF, backwards

export default class NesRom {
  constructor(romArrayBuffer) {
    const dataView = new DataView(romArrayBuffer);

    const magic = dataView.getUint32(MAGIC_OFFSET, LITTLE_ENDIAN);

    if (magic !== MAGIC) {
      throw new Error('This does not appear to be an NES ROM');
    }

    // According to the wiki, everything that gets to here counts as being a valid iNES headered ROM, and there's
    // an additional check to see if it's an NES 2.0 headered ROM

    this.isNes20Header = ((dataView.getUint8(7) & 0x0C) === 0x80); // https://www.nesdev.org/wiki/NES_2.0#Identification

    this.romArrayBuffer = romArrayBuffer;
  }

  getIsNes20Header() {
    return this.isNes20Header;
  }

  getRomArrayBufferWithHeader() {
    return this.romArrayBuffer;
  }

  getRomArrayBufferWithoutHeader() {
    return this.romArrayBuffer.slice(HEADER_LENGTH);
  }

  static getFileExtensions() {
    return [
      '.nes',
    ];
  }
}
