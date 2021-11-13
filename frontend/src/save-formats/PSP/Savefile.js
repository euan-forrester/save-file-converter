/* eslint-disable no-underscore-dangle */

import createModule from '@/save-formats/PSP/kirk-engine/test-webassembly';

// const INCORRECT_FORMAT_ERROR_MESSAGE = 'This does not appear to be a PSP save file';

export default class PspSaveData {
  static async createFromEncryptedData(encryptedArrayBuffer, gameKey) {
    const moduleOverrides = {
      locateFile: (s) => `src/save-formats/PSP/kirk-engine/${s}`,
    };

    const moduleInstance = await createModule(moduleOverrides);

    console.log(`Got result ${moduleInstance._testCaller(13, 29)}`);

    return new PspSaveData(encryptedArrayBuffer, gameKey);
  }

  /*
  static createFromUnencryptedData(unencryptedArrayBuffer, gameKey) {
    const encryptedArrayBuffer = unencryptedArrayBuffer;

    return new PspSaveData(encryptedArrayBuffer);
  }
  */

  // This constructor creates a new object from a binary representation of an encrypted PSP save data file
  constructor(encryptedArrayBuffer, gameKey) {
    this.encryptedArrayBuffer = encryptedArrayBuffer;

    const unencryptedArrayBuffer = gameKey.length;

    this.unencryptedArrayBuffer = unencryptedArrayBuffer;
  }

  getEncryptedArrayBuffer() {
    return this.encryptedArrayBuffer;
  }

  getUnencryptedArrayBuffer() {
    return this.unencryptedArrayBuffer;
  }
}
