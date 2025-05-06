import Util from '@/util/util';

export default class HexUtil {
  static hexToArrayBuffer(hexString) {
    const u8 = new Uint8Array(hexString.length / 2);

    for (let i = 0; i < hexString.length; i += 2) {
      u8[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }

    return Util.bufferToArrayBuffer(u8);
  }
}
