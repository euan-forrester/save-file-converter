/* eslint-disable no-underscore-dangle */

import PspEncryptionUtil from './PspEncryptionUtil';

// const INCORRECT_FORMAT_ERROR_MESSAGE = 'This does not appear to be a PSP save file';

export default class PspSaveData {
  static createFromEncryptedData(encryptedArrayBuffer, gameKey) {
    let dataLength = encryptedArrayBuffer.byteLength;

    const encryptedArrayPtr = PspEncryptionUtil.bufferToPtr(encryptedArrayBuffer);
    const gameKeyPtr = PspEncryptionUtil.bufferToPtr(gameKey);

    const dataLengthPtr = PspEncryptionUtil.intToPtr(dataLength);

    const result = PspEncryptionUtil.decryptSaveData(encryptedArrayPtr, dataLengthPtr, gameKeyPtr);

    if (result !== 0) {
      throw new Error(`Encountered error ${result} trying to decrypt save data`);
    }

    dataLength = PspEncryptionUtil.ptrToInt(dataLengthPtr);

    const unencryptedArrayBuffer = PspEncryptionUtil.ptrToArrayBuffer(encryptedArrayPtr, dataLength);

    PspEncryptionUtil.free(dataLengthPtr);
    PspEncryptionUtil.free(gameKeyPtr);
    PspEncryptionUtil.free(encryptedArrayPtr);

    return new PspSaveData(encryptedArrayBuffer, unencryptedArrayBuffer, null);
  }

  static createFromUnencryptedData(unencryptedArrayBuffer, encryptedFilename, paramSfoArrayBuffer, gameKey) {
    let dataLength = unencryptedArrayBuffer.byteLength;

    const unencryptedArrayPtr = PspEncryptionUtil.bufferToPtr(unencryptedArrayBuffer);
    const encryptedArrayPtrPtr = PspEncryptionUtil.intToPtr(0);
    const paramSfoArrayPtr = PspEncryptionUtil.bufferToPtr(paramSfoArrayBuffer);
    const gameKeyPtr = PspEncryptionUtil.bufferToPtr(gameKey);

    const dataLengthPtr = PspEncryptionUtil.intToPtr(dataLength);
    const paramSfoLength = paramSfoArrayBuffer.byteLength;

    const result = PspEncryptionUtil.encryptSaveData(unencryptedArrayPtr, encryptedArrayPtrPtr, dataLengthPtr, paramSfoArrayPtr, paramSfoLength, encryptedFilename, gameKeyPtr);

    if (result !== 0) {
      throw new Error(`Encountered error ${result} trying to decrypt save data`);
    }

    const encryptedArrayPtr = PspEncryptionUtil.ptrToInt(encryptedArrayPtrPtr);

    dataLength = PspEncryptionUtil.ptrToInt(dataLengthPtr);

    const encryptedArrayBuffer = PspEncryptionUtil.ptrToArrayBuffer(encryptedArrayPtr, dataLength);
    const newParamSfoArrayBuffer = PspEncryptionUtil.ptrToArrayBuffer(paramSfoArrayPtr, paramSfoLength);

    PspEncryptionUtil.free(dataLengthPtr);
    PspEncryptionUtil.free(encryptedArrayPtrPtr);
    PspEncryptionUtil.free(encryptedArrayPtr); // This was allocated in C++ but must be free'd here
    PspEncryptionUtil.free(gameKeyPtr);
    PspEncryptionUtil.free(paramSfoArrayPtr);
    PspEncryptionUtil.free(unencryptedArrayPtr);

    return new PspSaveData(encryptedArrayBuffer, unencryptedArrayBuffer, newParamSfoArrayBuffer);
  }

  // This constructor creates a new object from the encrypted and unencrypted binary representations of a PSP save data file
  constructor(encryptedArrayBuffer, unencryptedArrayBuffer, paramSfoArrayBuffer) {
    this.encryptedArrayBuffer = encryptedArrayBuffer;
    this.unencryptedArrayBuffer = unencryptedArrayBuffer;
    this.paramSfoArrayBuffer = paramSfoArrayBuffer;
  }

  getUnencryptedArrayBuffer() {
    return this.unencryptedArrayBuffer;
  }

  getEncryptedArrayBuffer() {
    return this.encryptedArrayBuffer;
  }

  getParamSfoArrayBuffer() {
    return this.paramSfoArrayBuffer;
  }
}
