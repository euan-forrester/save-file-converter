/* eslint-disable no-underscore-dangle */

import createModule from '@/save-formats/PSP/psp-encryption/psp-encryption';
import pspEncryptionWasm from './psp-encryption/psp-encryption.wasm';

// const INCORRECT_FORMAT_ERROR_MESSAGE = 'This does not appear to be a PSP save file';

async function getModuleInstance() {
  // WASM integration with webpack 5 based on: https://gist.github.com/surma/b2705b6cca29357ebea1c9e6e15684cc
  const moduleOverrides = {
    locateFile: (s) => {
      if (s.endsWith('.wasm')) {
        return pspEncryptionWasm;
      }
      return s;
    },
  };

  return createModule(moduleOverrides);
}

function bufferToPtr(buffer, moduleInstance) {
  const array = new Uint8Array(buffer);

  const ptr = moduleInstance._malloc(array.length);

  for (let i = 0; i < array.length; i += 1) {
    moduleInstance.setValue(ptr + i, array[i], 'i8');
  }

  return ptr;
}

function ptrToArrayBuffer(ptr, length, moduleInstance) {
  const arrayBuffer = new ArrayBuffer(length);
  const array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < length; i += 1) {
    array[i] = moduleInstance.getValue(ptr + i, 'i8');
  }

  return arrayBuffer;
}

function intToPtr(n, moduleInstance) {
  const ptr = moduleInstance._malloc(4);

  moduleInstance.setValue(ptr, n, 'i32');

  return ptr;
}

function ptrToInt(ptr, moduleInstance) {
  return moduleInstance.getValue(ptr, 'i32');
}

export default class PspSaveData {
  static async init(deterministicSeed = null) {
    PspSaveData.moduleInstance = await getModuleInstance();

    if (deterministicSeed === null) {
      PspSaveData.moduleInstance._kirk_init();
    } else {
      PspSaveData.moduleInstance._kirk_init_deterministic(deterministicSeed);
    }

    PspSaveData.decryptSaveData = PspSaveData.moduleInstance.cwrap('decrypt_save_buffer', 'number', ['number', 'number', 'number']);
    PspSaveData.encryptSaveData = PspSaveData.moduleInstance.cwrap('encrypt_save_buffer', 'number', ['number', 'number', 'number', 'number', 'number', 'string', 'number']);
  }

  static createFromEncryptedData(encryptedArrayBuffer, gameKey) {
    let dataLength = encryptedArrayBuffer.byteLength;

    const encryptedArrayPtr = bufferToPtr(encryptedArrayBuffer, PspSaveData.moduleInstance);
    const gameKeyPtr = bufferToPtr(gameKey, PspSaveData.moduleInstance);

    const dataLengthPtr = intToPtr(dataLength, PspSaveData.moduleInstance);

    const result = PspSaveData.decryptSaveData(encryptedArrayPtr, dataLengthPtr, gameKeyPtr);

    if (result !== 0) {
      throw new Error(`Encountered error ${result} trying to decrypt save data`);
    }

    dataLength = ptrToInt(dataLengthPtr, PspSaveData.moduleInstance);

    const unencryptedArrayBuffer = ptrToArrayBuffer(encryptedArrayPtr, dataLength, PspSaveData.moduleInstance);

    PspSaveData.moduleInstance._free(dataLengthPtr);
    PspSaveData.moduleInstance._free(gameKeyPtr);
    PspSaveData.moduleInstance._free(encryptedArrayPtr);

    return new PspSaveData(encryptedArrayBuffer, unencryptedArrayBuffer, null);
  }

  static createFromUnencryptedData(unencryptedArrayBuffer, encryptedFilename, paramSfoArrayBuffer, gameKey) {
    let dataLength = unencryptedArrayBuffer.byteLength;

    const unencryptedArrayPtr = bufferToPtr(unencryptedArrayBuffer, PspSaveData.moduleInstance);
    const encryptedArrayPtrPtr = intToPtr(0, PspSaveData.moduleInstance);
    const paramSfoArrayPtr = bufferToPtr(paramSfoArrayBuffer, PspSaveData.moduleInstance);
    const gameKeyPtr = bufferToPtr(gameKey, PspSaveData.moduleInstance);

    const dataLengthPtr = intToPtr(dataLength, PspSaveData.moduleInstance);
    const paramSfoLength = paramSfoArrayBuffer.byteLength;

    const result = PspSaveData.encryptSaveData(unencryptedArrayPtr, encryptedArrayPtrPtr, dataLengthPtr, paramSfoArrayPtr, paramSfoLength, encryptedFilename, gameKeyPtr);

    if (result !== 0) {
      throw new Error(`Encountered error ${result} trying to decrypt save data`);
    }

    const encryptedArrayPtr = ptrToInt(encryptedArrayPtrPtr, PspSaveData.moduleInstance);

    dataLength = ptrToInt(dataLengthPtr, PspSaveData.moduleInstance);

    const encryptedArrayBuffer = ptrToArrayBuffer(encryptedArrayPtr, dataLength, PspSaveData.moduleInstance);
    const newParamSfoArrayBuffer = ptrToArrayBuffer(paramSfoArrayPtr, paramSfoLength, PspSaveData.moduleInstance);

    PspSaveData.moduleInstance._free(dataLengthPtr);
    PspSaveData.moduleInstance._free(encryptedArrayPtrPtr);
    PspSaveData.moduleInstance._free(encryptedArrayPtr); // This was allocated in C++ but must be free'd here
    PspSaveData.moduleInstance._free(gameKeyPtr);
    PspSaveData.moduleInstance._free(paramSfoArrayPtr);
    PspSaveData.moduleInstance._free(unencryptedArrayPtr);

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
