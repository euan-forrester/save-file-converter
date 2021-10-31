// Put our crypto utils in a separate file because the 'crypto' package is quite big and we don't want
// to have to include it every time we need a small function from our Util class

import crypto from 'crypto';
import { pad, unpad } from 'pkcs7';
import Util from './util';

export default class Crypto {
  static decrypt(encryptedArrayBuffer, algorithm, key, initializationVector) {
    const decipher = crypto.createDecipheriv(algorithm, key, initializationVector);
    decipher.setAutoPadding(false); // Different platforms have different default padding: https://github.com/nodejs/node/issues/2794#issuecomment-139436581

    const encryptedBuffer = Buffer.from(encryptedArrayBuffer);
    const decryptedBuffer = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

    return Util.bufferToArrayBuffer(decryptedBuffer);
  }

  static encrypt(decryptedArrayBuffer, algorithm, key, initializationVector) {
    const cipher = crypto.createCipheriv(algorithm, key, initializationVector);
    cipher.setAutoPadding(false); // See note above. When encrypting for the Wii, for example, we don't want to add Node's PKCS padding

    const decryptedBuffer = Buffer.from(decryptedArrayBuffer);
    const encryptedBuffer = Buffer.concat([cipher.update(decryptedBuffer), cipher.final()]);

    return Util.bufferToArrayBuffer(encryptedBuffer);
  }

  static addPkcsPadding(arrayBuffer) {
    return Util.bufferToArrayBuffer(pad(new Uint8Array(arrayBuffer)));
  }

  static removePkcsPadding(arrayBuffer) {
    return Util.bufferToArrayBuffer(unpad(new Uint8Array(arrayBuffer)));
  }
}
