// /* eslint-disable no-underscore-dangle */
/* eslint-disable */

import createModule from '@/save-formats/PSP/kirk-engine/kirk-engine';

import(/* webpackChunkName: "kirkEngineWasmName" */ "./kirk-engine/kirk-engine.wasm");

// const INCORRECT_FORMAT_ERROR_MESSAGE = 'This does not appear to be a PSP save file';

async function getModuleInstance() {
    // This is a total hack to get the runtime name (with hash) of the .wasm file.
    // We import it above so that webpack will include it (and append a hash, thanks to our webpack config),
    // and the magic comment above results in a file called js/kirkEngineWasmName.[hash].js also being emitted (for some reason -- I don't see any documentation about this).
    // If we look in that file, we see some weird javascript that adds an item to
    // the array stored in window['webpackJsonp']. Take a look at that generated file
    // (it's simpler in production mode) so see how we're undoing it to get at the
    // name of the .wasm file.
    //
    // I think that the correct way of doing this is to make our webpack config
    // automatically append the hash to the .wasm filename when we request it,
    // like here: https://github.com/webpack/webpack/issues/86#issuecomment-179957661
    //
    // There's also this post: https://wildsilicon.com/blog/2018/emscripten-webpack/
    //
    // And webpack 5 has built-in support for wasm files. Not sure exactly what that means for this case.
    // It's especially confusing with Vue because webpack stuff is buried behind Vue stuff.
    //
    // I've spent days staring at this and just want to keep moving, so we'll go with this hack for now.

    // We want to use this formulation when in tests, or when running a local server on our desktop,
    // to get the file from our local machine in the src/ dir
    let moduleOverrides = {
      locateFile: (s) => `src/save-formats/PSP/kirk-engine/${s}`,
    };

    if (window && window['webpackJsonp'] && !window.webpackHotUpdate) { // webpackHotUpdate is defined if running a dev server on the local machine
      const wasmNameList = window['webpackJsonp'].filter(x => x[0][0] === 'kirkEngineWasmName');

      if (wasmNameList.length >= 1) {
        const a = {
          exports: '',
        };
        const s = {
          p: '',
        };
        const key = Object.keys(wasmNameList[0][1])[0]; // The object only has 1 key, which is some random number

        wasmNameList[0][1][key](a, null, s); // So we're looking at the first result found, which is a list with 2 elements. First was the name that we checked, and the second is an object with one key whose value is a function

        const wasmFilename = a.exports; // The function has the side effect of concat'ing the above empty strings together with the filename we're looking for

        // For development or production builds deployed to a remote server, we want to use this formulation
        // so that the wasm file emitted by webpack (with hash in filename) is loaded
        moduleOverrides = {
          locateFile: (s) => wasmFilename,
        };
      }
    }

    return await createModule(moduleOverrides);
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

  static async init() {
    PspSaveData.moduleInstance = await getModuleInstance();

    PspSaveData.moduleInstance._kirk_init();

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
