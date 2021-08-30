/* eslint no-bitwise: ["error", { "allow": ["^"] }] */

/*
The PSP data format for PS1 Classics is:
- 128 byte header that contains an encryption key and a SHA1 digest
- Normal PS1 memory card data

The format is described here: https://www.psdevwiki.com/ps3/PS1_Savedata#Virtual_Memory_Card_PSP_.28.VMP.29
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
const ENCRYPTION_IV_PRETEND = Buffer.from('B30FFEEDB7DC5EB7133DA60D1B6B2CDC', 'hex'); // However, this value is used in our 'signature' algorithm below
const ENCRYPTION_KEY_LENGTH = ENCRYPTION_KEY.length;

const SALT_SEED_OFFSET = 0x0C;
const SALT_SEED_LENGTH = 0x14;
const SALT_LENGTH = 0x40;

const HASH_ALGORITHM = 'sha1';
const HASH_OFFSET = 0x20;
const HASH_LENGTH = 0x14;

function printBytes(name, arrayBuffer) {
  let outputString = `${name}: `;
  const array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < array.length; i += 1) {
    outputString = outputString.concat(`${array[i].toString(16)} `);
  }

  console.log(outputString);
}

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

function setArrayBufferPortion(destination, source, destinationOffset, sourceOffset, length) {
  const destinationArray = new Uint8Array(destination);
  const sourceArray = new Uint8Array(source.slice(sourceOffset, sourceOffset + length));

  const output = new ArrayBuffer(destination.byteLength);
  const outputArray = new Uint8Array(output);

  outputArray.set(destinationArray);
  outputArray.set(sourceArray, destinationOffset);

  return output;
}

function fillArrayBufferPortion(arrayBuffer, startIndex, length, fillValue) {
  const outputArrayBuffer = new ArrayBuffer(arrayBuffer.byteLength);
  const outputArray = new Uint8Array(outputArrayBuffer);
  const inputArray = new Uint8Array(arrayBuffer);

  outputArray.set(inputArray);
  outputArray.fill(fillValue, startIndex, startIndex + length);

  return outputArrayBuffer;
}

function fillArrayBuffer(arrayBuffer, fillValue) {
  const outputArrayBuffer = new ArrayBuffer(arrayBuffer.byteLength);
  const outputArray = new Uint8Array(outputArrayBuffer);

  outputArray.fill(fillValue);

  return outputArrayBuffer;
}

export default class PspSaveData {
  static createFromPspData(pspArrayBuffer) {
    return new PspSaveData(pspArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    this.rawSaveData = rawArrayBuffer;
  }

  // This constructor creates a new object from a binary representation of a PSP PS1 save data file
  constructor(arrayBuffer) {
    this.arrayBuffer = arrayBuffer;

    // Parse the PSP-specific header

    const pspHeaderArrayBuffer = arrayBuffer.slice(0, HEADER_LENGTH);

    Util.checkMagicBytes(pspHeaderArrayBuffer, 0, HEADER_MAGIC);

    // Calculate the "signature" for the data
    // Signature implementation copied from: https://github.com/dots-tb/vita-mcr2vmp/blob/master/src/main.c#L90

    // First, we calculate our salt

    let salt = new ArrayBuffer(SALT_LENGTH);
    const saltSeed = pspHeaderArrayBuffer.slice(SALT_SEED_OFFSET, SALT_SEED_OFFSET + SALT_SEED_LENGTH);

    let workBuffer = new ArrayBuffer(ENCRYPTION_KEY_LENGTH); // In the code we're copying from, only this many bytes are actually used from this buffer, until the very end when it's repurposed to receive the final sha1 digest

    workBuffer = setArrayBufferPortion(workBuffer, saltSeed, 0, 0, ENCRYPTION_KEY_LENGTH); printBytes('workBuffer', workBuffer);
    workBuffer = Util.decrypt(workBuffer, ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, ENCRYPTION_IV);
    salt = setArrayBufferPortion(salt, workBuffer, 0, 0, ENCRYPTION_KEY_LENGTH); printBytes('salt', salt);

    workBuffer = setArrayBufferPortion(workBuffer, saltSeed, 0, 0, ENCRYPTION_KEY_LENGTH); printBytes('workBuffer', workBuffer);
    workBuffer = Util.encrypt(workBuffer, ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, ENCRYPTION_IV);
    salt = setArrayBufferPortion(salt, workBuffer, ENCRYPTION_KEY_LENGTH, 0, ENCRYPTION_KEY_LENGTH); printBytes('salt', salt);

    salt = xorWithIv(salt, 0, ENCRYPTION_IV_PRETEND); printBytes('salt', salt); // The only place our IV is actually used: as a random series of bytes

    workBuffer = fillArrayBuffer(workBuffer, 0xFF); printBytes('workBuffer', workBuffer);
    workBuffer = setArrayBufferPortion(workBuffer, saltSeed, 0, ENCRYPTION_KEY_LENGTH, SALT_SEED_LENGTH - ENCRYPTION_KEY_LENGTH); printBytes('workBuffer', workBuffer);
    salt = xorWithIv(salt, ENCRYPTION_KEY_LENGTH, workBuffer); printBytes('salt', salt);

    salt = fillArrayBufferPortion(salt, SALT_SEED_LENGTH, SALT_LENGTH - SALT_SEED_LENGTH, 0); printBytes('salt', salt);
    salt = xorWithByte(salt, 0x36, SALT_LENGTH); printBytes('salt', salt);

    // Then we calculate our hash
    // Implementation copied from: https://github.com/dots-tb/vita-mcr2vmp/blob/master/src/main.c#L124

    const inputArrayBufferWithoutHash = fillArrayBufferPortion(arrayBuffer, HASH_OFFSET, HASH_LENGTH, 0);

    const hash1 = crypto.createHash(HASH_ALGORITHM);

    hash1.update(Buffer.from(salt));
    hash1.update(Buffer.from(inputArrayBufferWithoutHash));

    const hash1Output = hash1.digest();

    const hash2 = crypto.createHash(HASH_ALGORITHM);

    salt = xorWithByte(salt, 0x6A, SALT_LENGTH);

    hash2.update(Buffer.from(salt));
    hash2.update(hash1Output);

    const hashCalculated = hash2.digest();

    // Check the hash we generated against the one we found

    const hashFound = Buffer.from(pspHeaderArrayBuffer.slice(HASH_OFFSET, HASH_OFFSET + HASH_LENGTH));

    console.log('\n\n\n');
    console.log(`Salt seed: '${Buffer.from(saltSeed).toString('hex')}' Salt: '${Buffer.from(salt).toString('hex')}'`);
    console.log(`Expected hash: '${hashFound.toString('hex')}' Calculated hash '${hashCalculated.toString('hex')}'`);

    if (hashFound.compare(hashCalculated) !== 0) {
      throw new Error(`Save appears to be corrupted: expected hash ${hashFound.toString('hex')} but calculated hash ${hashCalculated.toString('hex')}`);
    }

    // Parse the rest of the file
    const memcardArrayBuffer = arrayBuffer.slice(HEADER_LENGTH); // The remainder of the file is the actual contents of the memory card

    const memcard = Ps1MemcardSaveData.createFromPs1MemcardData(memcardArrayBuffer);

    this.saveFiles = memcard.getSaveFiles();
  }

  getSaveFiles() {
    return this.saveFiles;
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
