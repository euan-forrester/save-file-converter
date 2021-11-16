// /* eslint-disable no-underscore-dangle */
/* eslint-disable */

import createModule from '@/save-formats/PSP/kirk-engine/test-webassembly';

import(/* webpackChunkName: "kirkEngineWasmName" */ "./kirk-engine/test-webassembly.wasm");

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

export default class PspSaveData {
  static async createFromEncryptedData(encryptedArrayBuffer, gameKey) {
    const moduleInstance = await getModuleInstance();

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

    this.unencryptedArrayBuffer = encryptedArrayBuffer;
  }

  getEncryptedArrayBuffer() {
    return this.encryptedArrayBuffer;
  }

  getUnencryptedArrayBuffer() {
    return this.unencryptedArrayBuffer;
  }
}
