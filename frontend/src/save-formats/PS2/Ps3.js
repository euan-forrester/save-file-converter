/* eslint no-bitwise: ["error", { "allow": ["^"] }] */

/*
PS2 files in the PS3 format are similar to but more elaborate than PS1 files in PS3 format.

They contain a set of files rather than just 1, which are all described in the header

*/

import Ps1MemcardSaveData from './Memcard';
import SonyUtil from '../SonyUtil';
import Util from '../../util/util';

// PS3 header

const HEADER_LENGTH = 0x84;
const LITTLE_ENDIAN = true;

const HEADER_MAGIC = '\x00VSP\x00\x00\x00\x00';
const MAGIC_ENCODING = 'US-ASCII';

const SALT_SEED_OFFSET = 0x08;
const SALT_SEED_LENGTH = 0x14;

const SIGNATURE_OFFSET = 0x1C;
const SIGNATURE_LENGTH = 0x14;

const PLATFORM_INDICATOR_1_OFFSET = 0x38; // psv-save-converter calls this a "header size" but it's not clear to me what it corresponds to in the header. And we already have a couple of other "header size"es. https://github.com/bucanero/psv-save-converter/blob/master/include/ps2mc.h#L55
const PLATFORM_INDICATOR_2_OFFSET = 0x3C;

const PLATFORM_INDICATOR_1_PS2 = 0x2C;
const PLATFORM_INDICATOR_2_PS2 = 0x2;

const SAVE_SIZE_OFFSET = 0x40; // Size of the PS1/2 data in the save (so, excluding the PS3 header)

export default class Ps3SaveData {
  static createFromPs3SaveFiles(ps3SaveFiles) {
    // The PS3 image is the PS3 header then the regular memcard data

    const filenameTextDecoder = new TextDecoder(FILENAME_ENCODING);

    const ps1SaveFiles = ps3SaveFiles.map((ps3SaveFile) => {
      // Parse the PS3-specific header

      const ps1SaveDataArrayBuffer = ps3SaveFile.rawData.slice(HEADER_LENGTH);
      const ps3HeaderArrayBuffer = ps3SaveFile.rawData.slice(0, HEADER_LENGTH);
      const ps3HeaderDataView = new DataView(ps3HeaderArrayBuffer);

      Util.checkMagic(ps3HeaderArrayBuffer, 0, HEADER_MAGIC, MAGIC_ENCODING);

      // Check the signature

      const saltSeed = ps3HeaderArrayBuffer.slice(SALT_SEED_OFFSET, SALT_SEED_OFFSET + SALT_SEED_LENGTH);
      const signatureCalculated = SonyUtil.calculateSignature(ps3SaveFile.rawData, saltSeed, SALT_SEED_LENGTH, SIGNATURE_OFFSET, SIGNATURE_LENGTH);
      const signatureFound = Buffer.from(ps3HeaderArrayBuffer.slice(SIGNATURE_OFFSET, SIGNATURE_OFFSET + SIGNATURE_LENGTH));

      if (signatureFound.compare(signatureCalculated) !== 0) {
        throw new Error(`Save appears to be corrupted: expected signature ${signatureFound.toString('hex')} but calculated signature ${signatureCalculated.toString('hex')}`);
      }

      // Check the platform

      const platformIndicator1 = ps3HeaderDataView.getUint32(PLATFORM_INDICATOR_1_OFFSET, LITTLE_ENDIAN);
      const platformIndicator2 = ps3HeaderDataView.getUint32(PLATFORM_INDICATOR_2_OFFSET, LITTLE_ENDIAN);

      if ((platformIndicator1 !== PLATFORM_INDICATOR_1_PS2) || (platformIndicator2 !== PLATFORM_INDICATOR_2_PS2)) {
        throw new Error('This does not appear to be a PS2 save file');
      }

      // Check the size etc

      const saveSize = ps3HeaderDataView.getUint32(SAVE_SIZE_OFFSET, LITTLE_ENDIAN);

      if (saveSize !== ps1SaveDataArrayBuffer.byteLength) {
        throw new Error(`Size mismatch: size is specified as ${saveSize} bytes in the header but actual save size is ${ps1SaveDataArrayBuffer.byteLength} bytes`);
      }

      // Everything checks out
      //
      // Note that because we're creating this from PS1 save files, the new PS3 files that are created from this
      // will have a different salt seed and thus signature than the original ones. In theory, we should be outputting
      // the original PS3 saves again, but in practice who would want to convert a PS3 save to a PS3 save? So it shouldn't matter.

      return {
        filename: '',
        rawData: ps1SaveDataArrayBuffer,
      };
    });

    const memcardSaveData = Ps1MemcardSaveData.createFromSaveFiles(ps1SaveFiles);

    return new Ps3SaveData(memcardSaveData.getArrayBuffer());
  }

  static createFromPs2SaveFiles(ps2SaveFiles) {
    const memcardSaveData = Ps1MemcardSaveData.createFromSaveFiles(ps1SaveFiles);

    return new Ps3SaveData(memcardSaveData.getArrayBuffer());
  }

  // This constructor creates a new object from a binary representation of a PS1 save data file
  constructor(arrayBuffer) {
    this.memoryCard = Ps1MemcardSaveData.createFromPs1MemcardData(arrayBuffer);

    this.saveFiles = this.memoryCard.getSaveFiles();

    this.ps3SaveFiles = this.saveFiles.map((ps1SaveFile) => createPs3SaveFile(ps1SaveFile));
  }

  getSaveFiles() {
    return this.saveFiles;
  }

  getPs3SaveFiles() {
    return this.ps3SaveFiles;
  }

  getMemoryCard() {
    return this.memoryCard;
  }
}
