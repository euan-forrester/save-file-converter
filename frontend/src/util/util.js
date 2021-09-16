import path from 'path';
import crypto from 'crypto';
import { pad, unpad } from 'pkcs7';

export default class Util {
  static changeFilenameExtension(filename, newExtension) {
    return `${path.basename(filename, path.extname(filename))}.${newExtension}`;
  }

  static removeFilenameExtension(filename) {
    return `${path.basename(filename, path.extname(filename))}`;
  }

  static resizeRawSave(arrayBuffer, newSize) {
    let newArrayBuffer = arrayBuffer;

    if (newSize < arrayBuffer.byteLength) {
      newArrayBuffer = arrayBuffer.slice(0, newSize);
    } else if (newSize > arrayBuffer.byteLength) {
      newArrayBuffer = new ArrayBuffer(newSize);

      const newArray = new Uint8Array(newArrayBuffer);
      const oldArray = new Uint8Array(arrayBuffer);

      newArray.fill(0); // Redundant but let's be explicit
      newArray.set(oldArray, 0);
    }

    return newArrayBuffer;
  }

  static bufferToArrayBuffer(b) {
    return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); // https://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer/31394257#31394257
  }

  static concatArrayBuffers(arrayBufferList) {
    const bufferList = arrayBufferList.map((ab) => Buffer.from(ab));

    return Util.bufferToArrayBuffer(Buffer.concat(bufferList));
  }

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

  // Check magic that's provided by a nice, human-readable string
  static checkMagic(arrayBuffer, offset, magic, magicEncoding) {
    const magicTextDecoder = new TextDecoder(magicEncoding);
    const magicFound = magicTextDecoder.decode(arrayBuffer.slice(offset, offset + magic.length));

    if (magicFound !== magic) {
      throw new Error(`Save appears corrupted: found '${magicFound}' instead of '${magic}'`);
    }
  }

  // Check magic that contains problematic bytes that aren't human-readable
  static checkMagicBytes(arrayBuffer, offset, magic) {
    const dataView = new DataView(arrayBuffer);

    for (let i = 0; i < magic.length; i += 1) {
      const magicFound = dataView.getUint8(offset + i);
      if (magicFound !== magic[i]) {
        throw new Error(`Save appears corrupted: found '${magicFound}' instead of '${magic[i]}'`);
      }
    }
  }

  static trimNull(s) {
    return s.replace(/\0[\s\S]*$/g, ''); // https://stackoverflow.com/questions/22809401/removing-a-null-character-from-a-string-in-javascript
  }
}
