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

const HEADER_MAGIC = [0, 0x50, 0x4D, 0x56, 0x80, 0, 0, 0, 0, 0, 0, 0]; // 'PMV'. The 0x80 byte is problematic for decoding into US-ASCII (or other charsets), so just do this one as an array
const HEADER_LENGTH = 128;

// Not sure how to correctly decrypt this stuff, or even if it's possible: https://www.ngemu.com/threads/ps1-ps2-emulator-to-ps3-psp-ps-vita-and-vice-versa-save-conversion-service.146727/post-2333969

const KEY_SEED_ENCRYPTION_ALGORITHM = 'aes-128-cbc';
const KEY_SEED_ENCRYPTION_KEY = Buffer.from('98C940975C1D10E87FE60EA3FD03A8BA', 'hex'); // https://playstationdev.wiki/pspdevwiki/index.php?title=Keys#PSP_Kirk_command_1_AESCBC128-CMAC_Key
const KEY_SEED_OFFSET = 0x0C;
const KEY_SEED_LENGTH = 0x14;

const SHA1_HMAC_OFFSET = 0x20;
const SHA1_HMAC_LENGTH = 0x14;

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

    // Check the SHA1 hmac
    const keySeed = pspHeaderArrayBuffer.slice(KEY_SEED_OFFSET, KEY_SEED_OFFSET + KEY_SEED_LENGTH);
    const keySeedDecrypted = Util.decrypt(keySeed, KEY_SEED_ENCRYPTION_ALGORITHM, KEY_SEED_ENCRYPTION_KEY, null);

    const memcardArrayBuffer = arrayBuffer.slice(HEADER_LENGTH); // The remainder of the file is the actual contents of the memory card

    const hmac = crypto.createHmac('sha1', keySeedDecrypted);
    hmac.update(Buffer.from(memcardArrayBuffer));
    const sha1HashCalculated = hmac.digest();

    const sha1HashFound = Buffer.from(pspHeaderArrayBuffer.slice(SHA1_HMAC_OFFSET, SHA1_HMAC_OFFSET + SHA1_HMAC_LENGTH));

    console.log(`SHA1 hash found: '${sha1HashFound}'`);
    console.log(`SHA1 hash calc:  '${sha1HashCalculated}'`);

    if (!sha1HashFound.equals(sha1HashCalculated)) {
      throw new Error('Save file appears to be corrupted: SHA1 hashes do not match');
    }

    // Parse the rest of the file
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
