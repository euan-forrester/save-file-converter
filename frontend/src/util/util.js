import crypto from 'crypto';

export default class Util {
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

  static decrypt(encryptedArrayBuffer, algorithm, key, initializationVector) {
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(initializationVector, 'hex'));
    const encryptedBuffer = Buffer.from(encryptedArrayBuffer);
    const decryptedBuffer = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

    return Util.bufferToArrayBuffer(decryptedBuffer);
  }

  static encrypt(decryptedArrayBuffer, algorithm, key, initializationVector) {
    const cipher = crypto.createCipheriv(algorithm, key, Buffer.from(initializationVector, 'hex'));
    const decryptedBuffer = Buffer.from(decryptedArrayBuffer);
    const encryptedBuffer = Buffer.concat([cipher.update(decryptedBuffer), cipher.final()]);

    return Util.bufferToArrayBuffer(encryptedBuffer);
  }
}
