// Extracts some information from a Game Boy Advance ROM.
// Based on https://github.com/visualboyadvance-m/visualboyadvance-m/blob/master/src/gba/GBA.cpp#L1168

const INTERNAL_NAME_OFFSET = 0xA0;
const INTERNAL_NAME_LENGTH = 0x10;
const CHECKSUM_OFFSET = 0xBE;
const COMPLIMENT_CHECK_OFFSET = 0xBD;
const MAKER_OFFSET = 0xB0;
const LITTLE_ENDIAN = true;

export default class GbaRom {
  constructor(romArrayBuffer) {
    const textDecoder = new TextDecoder('utf-8');
    const dataView = new DataView(romArrayBuffer);

    const internalNameArrayBuffer = romArrayBuffer.slice(INTERNAL_NAME_OFFSET, INTERNAL_NAME_OFFSET + INTERNAL_NAME_LENGTH);
    const internalNameUint8Array = new Uint8Array(internalNameArrayBuffer);

    this.internalName = textDecoder.decode(internalNameUint8Array);
    this.checkSum = dataView.getUint16(CHECKSUM_OFFSET, LITTLE_ENDIAN);
    this.complimentCheck = dataView.getUint8(COMPLIMENT_CHECK_OFFSET);
    this.maker = dataView.getUint8(MAKER_OFFSET);
  }

  getInternalName() {
    return this.internalName;
  }

  getChecksum() {
    return this.checkSum;
  }

  getComplimentCheck() {
    return this.complimentCheck;
  }

  getMaker() {
    return this.maker;
  }
}
