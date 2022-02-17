/* eslint no-bitwise: ["error", { "allow": ["^"] }] */

// Class for Sony-specific stuff, such as calculating the signature of a save file

import createHash from 'create-hash';
import CryptoAes from '../../util/crypto-aes';
import Util from '../../util/util';

const ENCRYPTION_ALGORITHM = 'aes-128-ecb';
const ENCRYPTION_ALGORITHM_BLOCK_LENGTH = 0x10; // A block in AES is always 128 bits regardless of the key size
const ENCRYPTION_KEY = Buffer.from('AB5ABC9FC1F49DE6A051DBAEFA518859', 'hex'); // https://github.com/dots-tb/vita-mcr2vmp/blob/master/src/main.c#L15
const ENCRYPTION_IV = Buffer.alloc(0); // ECB doesn't use an IV, despite the code we're copying this from specifying one: https://github.com/nodejs/node/issues/10263
const ENCRYPTION_IV_PRETEND = Buffer.from('B30FFEEDB7DC5EB7133DA60D1B6B2CDC', 'hex'); // However, this series of bytes is used for a different purpose in our 'signature' algorithm below
const ENCRYPTION_KEY_LENGTH = ENCRYPTION_KEY.length;
const HASH_ALGORITHM = 'sha1';
const SALT_LENGTH = 0x40;

// It seems that the salt seed can be initialized to anything. vita-mcr2vmp initializes to to all zeros.
// save-editor.com initializes it to a sequence of incrementing values (0, 1, 2, 3, etc)
// After I used a save initially created by save-editor.com on my PSP for some time, I observed that the salt seed was replaced by a different
// sequence of incrementing values, starting at some other number. Perhaps they all get incremented every time the save is updated
// by the hardware?
//
// I'm not sure, but let's just play along and initialize ours to incrementing values as well.
const SALT_SEED_INIT = Buffer.from('000102030405060708090A0B0C0D0E0F10111213', 'hex');

// Based on https://github.com/dots-tb/vita-mcr2vmp/blob/master/src/aes.c#L491
function xorWithIv(arrayBuffer, startingOffset, ivBuffer) {
  const outputArrayBuffer = new ArrayBuffer(arrayBuffer.byteLength);
  const outputArray = new Uint8Array(outputArrayBuffer);

  const inputArray = new Uint8Array(arrayBuffer);
  const ivArray = new Uint8Array(ivBuffer);

  outputArray.set(inputArray);

  for (let i = 0; i < ENCRYPTION_ALGORITHM_BLOCK_LENGTH; i += 1) {
    outputArray[i + startingOffset] = inputArray[i + startingOffset] ^ ivArray[i];
  }

  return outputArrayBuffer;
}

// Based on https://github.com/dots-tb/vita-mcr2vmp/blob/master/src/main.c#L25
function xorWithByte(arrayBuffer, xorValue, length) {
  const outputArrayBuffer = new ArrayBuffer(arrayBuffer.byteLength);
  const outputArray = new Uint8Array(outputArrayBuffer);

  const inputArray = new Uint8Array(arrayBuffer);

  for (let i = 0; i < length; i += 1) {
    outputArray[i] = inputArray[i] ^ xorValue;
  }

  return outputArrayBuffer;
}

export default class Sony {
  static SALT_SEED_INIT = SALT_SEED_INIT;

  // Note that our arrayBuffer is for the entire PSP file, including the header which must in turn include the salt seed
  // The signature in the header is zero'ed out before the signature is calculated, but everything else must be there
  static calculateSignature(arrayBuffer, saltSeed, saltSeedLength, signatureOffset, signatureLength) {
    // First, we calculate our salt
    // Implmentation copied from: https://github.com/dots-tb/vita-mcr2vmp/blob/master/src/main.c#L105

    let salt = new ArrayBuffer(SALT_LENGTH);

    let workBuffer = new ArrayBuffer(ENCRYPTION_KEY_LENGTH); // In the code we're copying from, only this many bytes are actually used from this buffer, until the very end when it's repurposed to receive the final sha1 digest

    workBuffer = Util.setArrayBufferPortion(workBuffer, saltSeed, 0, 0, ENCRYPTION_KEY_LENGTH);
    workBuffer = CryptoAes.decrypt(workBuffer, ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, ENCRYPTION_IV);
    salt = Util.setArrayBufferPortion(salt, workBuffer, 0, 0, ENCRYPTION_KEY_LENGTH);

    workBuffer = Util.setArrayBufferPortion(workBuffer, saltSeed, 0, 0, ENCRYPTION_KEY_LENGTH);
    workBuffer = CryptoAes.encrypt(workBuffer, ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, ENCRYPTION_IV);
    salt = Util.setArrayBufferPortion(salt, workBuffer, ENCRYPTION_KEY_LENGTH, 0, ENCRYPTION_KEY_LENGTH);

    salt = xorWithIv(salt, 0, ENCRYPTION_IV_PRETEND); // The only place our IV is actually used: as a random series of bytes

    workBuffer = Util.fillArrayBuffer(workBuffer, 0xFF);
    workBuffer = Util.setArrayBufferPortion(workBuffer, saltSeed, 0, ENCRYPTION_KEY_LENGTH, saltSeedLength - ENCRYPTION_KEY_LENGTH);
    salt = xorWithIv(salt, ENCRYPTION_KEY_LENGTH, workBuffer);

    salt = Util.fillArrayBufferPortion(salt, saltSeedLength, SALT_LENGTH - saltSeedLength, 0);
    salt = xorWithByte(salt, 0x36, SALT_LENGTH);

    // Then we calculate our hash
    // Implementation copied from: https://github.com/dots-tb/vita-mcr2vmp/blob/master/src/main.c#L124

    const inputArrayBufferWithoutHash = Util.fillArrayBufferPortion(arrayBuffer, signatureOffset, signatureLength, 0);

    const hash1 = createHash(HASH_ALGORITHM);

    hash1.update(Buffer.from(salt));
    hash1.update(Buffer.from(inputArrayBufferWithoutHash));

    const hash1Output = hash1.digest();

    const hash2 = createHash(HASH_ALGORITHM);

    salt = xorWithByte(salt, 0x6A, SALT_LENGTH);

    hash2.update(Buffer.from(salt));
    hash2.update(hash1Output);

    return hash2.digest();
  }
}
