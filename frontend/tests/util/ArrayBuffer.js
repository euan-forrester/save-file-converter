import { readFile, writeFile, stat } from 'fs/promises';

export default class ArrayBufferUtil {
  static async fileExists(filename) {
    try {
      await stat(filename);
    } catch (e) {
      return false;
    }

    return true;
  }

  static async readArrayBuffer(filename) {
    const b = await readFile(filename); // returns a Node Buffer object
    return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); // https://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer/31394257#31394257
  }

  static async writeArrayBuffer(filename, arrayBuffer) {
    await writeFile(filename, Buffer.from(arrayBuffer));
  }

  static arrayBuffersEqual(ab1, ab2, ignoreBytes = 0) {
    if (ab1.byteLength !== ab2.byteLength) {
      return false;
    }

    const u81 = new Uint8Array(ab1);
    const u82 = new Uint8Array(ab2);

    for (let i = 0; i < (ab1.byteLength - ignoreBytes); i += 1) {
      if (u81[i] !== u82[i]) {
        return false;
      }
    }

    return true;
  }
}
