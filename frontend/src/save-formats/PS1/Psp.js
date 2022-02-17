/*
The PSP data format for PS1 Classics is:
- 128 byte header that contains a seed and a signature
- Normal PS1 memory card data

The format is described here: https://www.psdevwiki.com/ps3/PS1_Savedata#Virtual_Memory_Card_PSP_.28.VMP.29

Note that the description of the signature in that link is incorrect. The signature is generated using a convoluted series
of encryption and hashes with some other random operations thrown in for good measure. The implementation below is
based on https://github.com/dots-tb/vita-mcr2vmp
*/

// Also, rather than importing the node crypto module, which is huge, we're going to use
// just a portion of it as implemented in https://github.com/crypto-browserify/createHash

import Ps1MemcardSaveData from './Memcard';
import SonyUtil from './SonyUtil';
import Util from '../../util/util';

// PSP header

const HEADER_LENGTH = 0x80;
const HEADER_MAGIC = [0, 0x50, 0x4D, 0x56, HEADER_LENGTH, 0, 0, 0, 0, 0, 0, 0]; // 'PMV' + the header length. The 0x80 byte is problematic for decoding into US-ASCII (or other charsets), so just do this one as an array

const SALT_SEED_OFFSET = 0x0C;
const SALT_SEED_LENGTH = 0x14;

const SIGNATURE_OFFSET = 0x20;
const SIGNATURE_LENGTH = 0x14;

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

    const saltSeedArray = new Uint8Array(SonyUtil.SALT_SEED_INIT);

    headerArray.set(saltSeedArray, SALT_SEED_OFFSET);

    // Then concat that with the rest of the memcard data

    const combinedArrayBuffer = Util.concatArrayBuffers([headerArrayBuffer, memcardSaveData.getArrayBuffer()]);

    // Now we can calculate our signature

    const saltSeed = Util.bufferToArrayBuffer(SonyUtil.SALT_SEED_INIT);
    const signatureCalculated = SonyUtil.calculateSignature(combinedArrayBuffer, saltSeed, SALT_SEED_LENGTH, SIGNATURE_OFFSET, SIGNATURE_LENGTH);

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
    const signatureCalculated = SonyUtil.calculateSignature(arrayBuffer, saltSeed, SALT_SEED_LENGTH, SIGNATURE_OFFSET, SIGNATURE_LENGTH);

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
