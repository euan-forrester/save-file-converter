import createHash from 'create-hash';

import Util from './util';

export default class HashUtil {
  static getEncodedHash(arrayBuffer, hashAlgorithm, hashEncoding) {
    const hash = createHash(hashAlgorithm);
    hash.update(Buffer.from(arrayBuffer));
    const hashOutput = hash.digest();

    const hashString = Buffer.from(hashOutput).toString('hex').toLowerCase();

    const textEncoder = new TextEncoder(hashEncoding);

    return Util.bufferToArrayBuffer(textEncoder.encode(hashString));
  }
}
