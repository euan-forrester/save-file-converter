/* eslint-disable no-bitwise */

import Util from './util';

const BRAM_SIZE = 2048;

const MAGIC = 'HUBM'; // Marker at the beginning that signifies correctly-formatted BRAM
const MAGIC_ENCODING = 'US-ASCII';
const MAGIC_OFFSET = 0;

export default class PcEngineUtil {
  static verifyPcEngineData(arrayBuffer) {
    if (arrayBuffer.byteLength !== BRAM_SIZE) {
      throw new Error(`File is the incorrect size: expected ${BRAM_SIZE} bytes but found ${arrayBuffer.byteLength} bytes`);
    }

    return Util.checkMagic(arrayBuffer, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);
  }
}
