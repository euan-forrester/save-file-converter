import { pad, unpad } from 'pkcs7';
import Util from '@/util/util';

export default class CryptoUtil {
  static addPkcsPadding(arrayBuffer) {
    return Util.bufferToArrayBuffer(pad(new Uint8Array(arrayBuffer)));
  }

  static removePkcsPadding(arrayBuffer) {
    return Util.bufferToArrayBuffer(unpad(new Uint8Array(arrayBuffer)));
  }
}
