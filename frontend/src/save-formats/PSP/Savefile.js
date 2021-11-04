export default class PspSaveData {
  static createFromEncryptedData(encryptedArrayBuffer, decryptionKey) {
    return new PspSaveData(encryptedArrayBuffer, decryptionKey);
  }

  /*
  static createFromUnencryptedData(unencryptedArrayBuffer, encryptionKey) {
    const encryptedArrayBuffer = unencryptedArrayBuffer;

    return new PspSaveData(encryptedArrayBuffer);
  }
  */

  // This constructor creates a new object from a binary representation of an encrypted PSP save data file
  constructor(encryptedArrayBuffer, decryptionKey) {
    this.encryptedArrayBuffer = encryptedArrayBuffer;

    console.log(decryptionKey);

    const unencryptedArrayBuffer = encryptedArrayBuffer;

    this.unencryptedArrayBuffer = unencryptedArrayBuffer;
  }

  getEncryptedArrayBuffer() {
    return this.encryptedArrayBuffer;
  }

  getUnencryptedArrayBuffer() {
    return this.unencryptedArrayBuffer;
  }
}
