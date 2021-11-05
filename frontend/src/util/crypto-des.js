// Put our crypto utils in a separate file because the 'crypto' package is quite big and we don't want
// to have to include it every time we need a small function from our Util class

// Also, rather than importing the node crypto module, which is huge, we're going to use
// just a portion of it as implemented in https://github.com/crypto-browserify/browserify-des

import DES from 'browserify-des';
import Util from './util';

export default class CryptoDes {
  static decrypt(encryptedArrayBuffer, algorithm, key, initializationVector) {
    const decipher = new DES({
      mode: algorithm,
      key,
      iv: initializationVector,
      decrypt: true,
    });

    const encryptedBuffer = Buffer.from(encryptedArrayBuffer);
    const decryptedBuffer = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

    return Util.bufferToArrayBuffer(decryptedBuffer);
  }

  static encrypt(decryptedArrayBuffer, algorithm, key, initializationVector) {
    const cipher = new DES({
      mode: algorithm,
      key,
      iv: initializationVector,
      decrypt: false,
    });

    const decryptedBuffer = Buffer.from(decryptedArrayBuffer);
    const encryptedBuffer = Buffer.concat([cipher.update(decryptedBuffer), cipher.final()]);

    return Util.bufferToArrayBuffer(encryptedBuffer);
  }
}
