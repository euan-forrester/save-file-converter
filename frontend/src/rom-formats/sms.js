/* eslint-disable no-bitwise */

// Extracts some information from an SMS ROM.
//
// More info at: https://www.smspower.org/Development/ROMHeader

import Util from '../util/util';

const LITTLE_ENDIAN = true;

const MAGIC_OFFSET = 0x7FF0;
const MAGIC = 'TMR SEGA';
const MAGIC_ENCODING = 'US-ASCII';

const CHECKSUM_OFFSET = 0x7FFA;

export default class SmsRom {
  constructor(romArrayBuffer) {
    Util.checkMagic(romArrayBuffer, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);

    const dataView = new DataView(romArrayBuffer);

    this.checksum = dataView.getUint16(CHECKSUM_OFFSET, LITTLE_ENDIAN);

    this.romArrayBuffer = romArrayBuffer;
  }

  getChecksum() {
    return this.checksum;
  }

  static getFileExtensions() {
    return [
      '.sms',
    ];
  }
}
