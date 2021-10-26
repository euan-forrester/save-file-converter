/* eslint no-bitwise: ["error", { "allow": ["^"] }] */

/*
The PSP data format for PS1 Classics is:
- 128 byte header that contains a seed and a signature
- Normal PS1 memory card data

The format is described here: https://www.psdevwiki.com/ps3/PS1_Savedata#Virtual_Memory_Card_PSP_.28.VMP.29

Note that the description of the signature in that link is incorrect. The signature is generated using a convoluted series
of encryption and hashes with some other random operations thrown in for good measure. The implementation below is
based on https://github.com/dots-tb/vita-mcr2vmp
*/

import crypto from 'crypto';
import Ps1MemcardSaveData from './Memcard';
import Util from '../../util/util';

// PSP header

const HEADER_LENGTH = 0x80;
const HEADER_MAGIC = [0, 0x50, 0x4D, 0x56, HEADER_LENGTH, 0, 0, 0, 0, 0, 0, 0]; // 'PMV' + the header length. The 0x80 byte is problematic for decoding into US-ASCII (or other charsets), so just do this one as an array

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
const SALT_SEED_OFFSET = 0x0C;
const SALT_SEED_LENGTH = 0x14;

const SIGNATURE_OFFSET = 0x20;
const SIGNATURE_LENGTH = 0x14;

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

// Note that our arrayBuffer is for the entire PSP file, including the header which must in turn include the salt seed
// The signature in the header is zero'ed out before the signature is calculated, but everything else must be there
function calculateSignature(arrayBuffer, saltSeed) {
  // First, we calculate our salt
  // Implmentation copied from: https://github.com/dots-tb/vita-mcr2vmp/blob/master/src/main.c#L105

  let salt = new ArrayBuffer(SALT_LENGTH);

  let workBuffer = new ArrayBuffer(ENCRYPTION_KEY_LENGTH); // In the code we're copying from, only this many bytes are actually used from this buffer, until the very end when it's repurposed to receive the final sha1 digest

  workBuffer = Util.setArrayBufferPortion(workBuffer, saltSeed, 0, 0, ENCRYPTION_KEY_LENGTH);
  workBuffer = Util.decrypt(workBuffer, ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, ENCRYPTION_IV);
  salt = Util.setArrayBufferPortion(salt, workBuffer, 0, 0, ENCRYPTION_KEY_LENGTH);

  workBuffer = Util.setArrayBufferPortion(workBuffer, saltSeed, 0, 0, ENCRYPTION_KEY_LENGTH);
  workBuffer = Util.encrypt(workBuffer, ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, ENCRYPTION_IV);
  salt = Util.setArrayBufferPortion(salt, workBuffer, ENCRYPTION_KEY_LENGTH, 0, ENCRYPTION_KEY_LENGTH);

  salt = xorWithIv(salt, 0, ENCRYPTION_IV_PRETEND); // The only place our IV is actually used: as a random series of bytes

  workBuffer = Util.fillArrayBuffer(workBuffer, 0xFF);
  workBuffer = Util.setArrayBufferPortion(workBuffer, saltSeed, 0, ENCRYPTION_KEY_LENGTH, SALT_SEED_LENGTH - ENCRYPTION_KEY_LENGTH);
  salt = xorWithIv(salt, ENCRYPTION_KEY_LENGTH, workBuffer);

  salt = Util.fillArrayBufferPortion(salt, SALT_SEED_LENGTH, SALT_LENGTH - SALT_SEED_LENGTH, 0);
  salt = xorWithByte(salt, 0x36, SALT_LENGTH);

  // Then we calculate our hash
  // Implementation copied from: https://github.com/dots-tb/vita-mcr2vmp/blob/master/src/main.c#L124

  const inputArrayBufferWithoutHash = Util.fillArrayBufferPortion(arrayBuffer, SIGNATURE_OFFSET, SIGNATURE_LENGTH, 0);

  const hash1 = crypto.createHash(HASH_ALGORITHM);

  hash1.update(Buffer.from(salt));
  hash1.update(Buffer.from(inputArrayBufferWithoutHash));

  const hash1Output = hash1.digest();

  const hash2 = crypto.createHash(HASH_ALGORITHM);

  salt = xorWithByte(salt, 0x6A, SALT_LENGTH);

  hash2.update(Buffer.from(salt));
  hash2.update(hash1Output);

  return hash2.digest();
}

export default class PspSaveData {
  static createFromPspData(pspArrayBuffer) {
    return new PspSaveData(pspArrayBuffer);
  }

  static createFromSaveFiles(saveFiles) {
    // The PSP image is the PSP header then the regular memcard data

    // First, construct the basic header from the magic and the initial salt seed

    const headerArrayBuffer = new ArrayBuffer(HEADER_LENGTH);
    const headerArray = new Uint8Array(headerArrayBuffer);
    const memcardSaveData = Ps1MemcardSaveData.createFromSaveFiles(saveFiles);

    headerArray.set(HEADER_MAGIC, 0);

    const saltSeedArray = new Uint8Array(SALT_SEED_INIT);

    headerArray.set(saltSeedArray, SALT_SEED_OFFSET);

    // Then concat that with the rest of the memcard data

    const combinedArrayBuffer = Util.concatArrayBuffers([headerArrayBuffer, memcardSaveData.getArrayBuffer()]);

    // Now we can calculate our signature

    const saltSeed = Util.bufferToArrayBuffer(SALT_SEED_INIT);
    const signatureCalculated = calculateSignature(combinedArrayBuffer, saltSeed);

    // Inject the signature and we're done! We'll parse it again
    // to pull out the file descriptions

    const finalArrayBuffer = Util.setArrayBufferPortion(combinedArrayBuffer, signatureCalculated, SIGNATURE_OFFSET, 0, SIGNATURE_LENGTH);

    return PspSaveData.createFromPspData(finalArrayBuffer);
  }

  // This constructor creates a new object from a binary representation of a PSP PS1 save data file
  constructor(arrayBuffer) {
    this.arrayBuffer = arrayBuffer;

    // Parse the PSP-specific header

    const pspHeaderArrayBuffer = arrayBuffer.slice(0, HEADER_LENGTH);

    Util.checkMagicBytes(pspHeaderArrayBuffer, 0, HEADER_MAGIC);

    const saltSeed = pspHeaderArrayBuffer.slice(SALT_SEED_OFFSET, SALT_SEED_OFFSET + SALT_SEED_LENGTH);
    const signatureCalculated = calculateSignature(arrayBuffer, saltSeed);

    // Check the signature we generated against the one we found

    const signatureFound = Buffer.from(pspHeaderArrayBuffer.slice(SIGNATURE_OFFSET, SIGNATURE_OFFSET + SIGNATURE_LENGTH));

    if (signatureFound.compare(signatureCalculated) !== 0) {
      throw new Error(`Save appears to be corrupted: expected signature ${signatureFound.toString('hex')} but calculated signature ${signatureCalculated.toString('hex')}`);
    }

    // Parse the rest of the file
    const memcardArrayBuffer = arrayBuffer.slice(HEADER_LENGTH); // The remainder of the file is the actual contents of the memory card

    this.memoryCard = Ps1MemcardSaveData.createFromPs1MemcardData(memcardArrayBuffer);

    this.saveFiles = this.memoryCard.getSaveFiles();
  }

  getSaveFiles() {
    return this.saveFiles;
  }

  getMemoryCard() {
    return this.memoryCard;
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
