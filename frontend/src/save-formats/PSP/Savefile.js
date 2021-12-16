// /* eslint-disable no-underscore-dangle */
/* eslint-disable */

import MathUtil from '@/util/Math';

import createModule from '@/save-formats/PSP/kirk-engine/kirk-engine';

import(/* webpackChunkName: "kirkEngineWasmName" */ "./kirk-engine/kirk-engine.wasm");

// const INCORRECT_FORMAT_ERROR_MESSAGE = 'This does not appear to be a PSP save file';

const MODE_SAVE_IS_ENCRYPTED = 3; // https://github.com/hrydgard/ppsspp/blob/master/Tools/SaveTool/decrypt.c#L115
const MODE_SAVE_IS_NOT_ENCRYPTED = 1;

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

export default class PspSaveData {
  static async createFromEncryptedData(encryptedArrayBuffer, gameKey) {
    const moduleInstance = await getModuleInstance();

    const decryptData = moduleInstance.cwrap('decrypt_data', 'number', ['number', 'array', 'number', 'number', 'array']);

    const encryptedArray = new Uint8Array(encryptedArrayBuffer);
    const gameKeyArray = new Uint8Array(gameKey);
    let dataLength = encryptedArrayBuffer.byteLength;
    let alignedLength = MathUtil.getNextMultipleOf16(dataLength);

    const dataLengthPtr = moduleInstance._malloc(4);
    const alignedLengthPtr = moduleInstance._malloc(4);

    moduleInstance.setValue(dataLengthPtr, dataLength, 'i32');
    moduleInstance.setValue(alignedLengthPtr, alignedLength, 'i32');

    console.log(`Before call: data length: ${dataLength}, aligned length: ${alignedLength}`);

    const result = decryptData(MODE_SAVE_IS_ENCRYPTED, encryptedArray, dataLengthPtr, alignedLengthPtr, gameKeyArray);

    dataLength = moduleInstance.getValue(dataLengthPtr, 'i32');
    alignedLength = moduleInstance.getValue(alignedLengthPtr, 'i32');

    moduleInstance._free(alignedLengthPtr);
    moduleInstance._free(dataLengthPtr);

    console.log(`After call: data length: ${dataLength}, aligned length: ${alignedLength}`);
    console.log(`Got back ${result} from decrypt_data()`);

    return new PspSaveData(encryptedArrayBuffer);
  }

  /*
  static createFromUnencryptedData(unencryptedArrayBuffer, gameKey) {
    const encryptedArrayBuffer = unencryptedArrayBuffer;

    return new PspSaveData(encryptedArrayBuffer);
  }
  */

  // This constructor creates a new object from a binary representation of an unencrypted PSP save data file
  constructor(unencryptedArrayBuffer) {
    this.unencryptedArrayBuffer = unencryptedArrayBuffer;
  }

  getUnencryptedArrayBuffer() {
    return this.unencryptedArrayBuffer;
  }
}
