/* eslint-disable no-underscore-dangle */

import createModule from '@/save-formats/PSP/psp-encryption/psp-encryption';
import pspEncryptionWasm from './psp-encryption/psp-encryption.wasm';

async function getModuleInstance() {
  // We want to use this formulation when in tests to get the file from our local machine in the src/ dir

  // Our tests run within jsdom, which mimics a browser environment
  // But the wasm stuff expects node
  const isTest = typeof navigator === 'object' && (navigator.userAgent.includes('Node.js') || navigator.userAgent.includes('jsdom')); // https://github.com/jsdom/jsdom/issues/1537

  let moduleOverrides = {};

  if (isTest) {
    // Hacks to bypass checks after ENVIRONMENT_IS_NODE in psp-encryption.js
    process.release = {
      name: 'node',
    };
    process.versions = {
      node: 'v22.13.1',
    };

    moduleOverrides = {
      locateFile: (s) => `src/save-formats/PSP/psp-encryption/${s}`,
    };
  } else {
    // WASM integration with webpack 5 based on: https://gist.github.com/surma/b2705b6cca29357ebea1c9e6e15684cc
    moduleOverrides = {
      locateFile: (s) => {
        if (s.endsWith('.wasm')) {
          return pspEncryptionWasm;
        }
        return s;
      },
    };
  }

  return createModule(moduleOverrides);
}

export default class PspEncryptionUtil {
  static async init(deterministicSeed = null) {
    PspEncryptionUtil.moduleInstance = await getModuleInstance();

    if (deterministicSeed === null) {
      PspEncryptionUtil.moduleInstance._kirk_init();
    } else {
      PspEncryptionUtil.moduleInstance._kirk_init_deterministic(deterministicSeed);
    }

    PspEncryptionUtil.decryptSaveData = PspEncryptionUtil.moduleInstance.cwrap('decrypt_save_buffer', 'number', ['number', 'number', 'number']);
    PspEncryptionUtil.encryptSaveData = PspEncryptionUtil.moduleInstance.cwrap('encrypt_save_buffer', 'number', ['number', 'number', 'number', 'number', 'number', 'string', 'number']);
  }

  static bufferToPtr(buffer) {
    const array = new Uint8Array(buffer);

    const ptr = PspEncryptionUtil.moduleInstance._malloc(array.length);

    for (let i = 0; i < array.length; i += 1) {
      PspEncryptionUtil.moduleInstance.setValue(ptr + i, array[i], 'i8');
    }

    return ptr;
  }

  static ptrToArrayBuffer(ptr, length) {
    const arrayBuffer = new ArrayBuffer(length);
    const array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < length; i += 1) {
      array[i] = PspEncryptionUtil.moduleInstance.getValue(ptr + i, 'i8');
    }

    return arrayBuffer;
  }

  static intToPtr(n) {
    const ptr = PspEncryptionUtil.moduleInstance._malloc(4);

    PspEncryptionUtil.moduleInstance.setValue(ptr, n, 'i32');

    return ptr;
  }

  static ptrToInt(ptr) {
    return PspEncryptionUtil.moduleInstance.getValue(ptr, 'i32');
  }

  static free(ptr) {
    PspEncryptionUtil.moduleInstance._free(ptr);
  }
}
