import CryptoDes from '../../util/crypto-des';

const ENCRYPTION_ALGORITHM = 'des-cbc';

const INCORRECT_FORMAT_ERROR_MESSAGE = 'This does not appear to be a PSP save file';

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
  constructor(encryptedArrayBuffer, decryptionKey, decryptionIv) {
    this.encryptedArrayBuffer = encryptedArrayBuffer;

    let unencryptedArrayBuffer = null;

    try {
      unencryptedArrayBuffer = CryptoDes.decrypt(encryptedArrayBuffer, ENCRYPTION_ALGORITHM, decryptionKey, decryptionIv);
    } catch (e) {
      throw new Error(INCORRECT_FORMAT_ERROR_MESSAGE, e); // Error trying to decrypt indicates that something is malformed
    }

    this.unencryptedArrayBuffer = unencryptedArrayBuffer;
  }

  getEncryptedArrayBuffer() {
    return this.encryptedArrayBuffer;
  }

  getUnencryptedArrayBuffer() {
    return this.unencryptedArrayBuffer;
  }
}