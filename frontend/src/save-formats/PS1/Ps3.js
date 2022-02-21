/* eslint no-bitwise: ["error", { "allow": ["^"] }] */

/*
PS3 files are a bit different from the PSP/DexDrive files. The PS3 just imports/exports individual save files, so there's
no representation of a whole memory card (there is one internally in the PS3, which is just a raw PS1 memory card,
but that's not user-facing unless the console is hacked)

The PS3 individual save files consist of a header then the regular PS1 save data. A description of the format can be
found here: https://psdevwiki.com/ps3/PS1_Savedata#PS1_Single_Save_.3F_.28.PSV.29

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

const PLATFORM_INDICATOR_1_OFFSET = 0x38;
const PLATFORM_INDICATOR_2_OFFSET = 0x3C;

const PLATFORM_INDICATOR_1_PS1 = 0x14;
// const PLATFORM_INDICATOR_1_PS2 = 0x2C;
const PLATFORM_INDICATOR_2_PS1 = 0x1;
// const PLATFORM_INDICATOR_2_PS2 = 0x2;

const SAVE_SIZE_OFFSET = 0x40; // Size of the PS1/2 data in the save (so, excluding the PS3 header)
const SAVE_START_BYTE_OFFSET = 0x44; // How many bytes after the start of the file that the actual PS1/2 save starts
const SAVE_HEADER_SIZE_OFFSET = 0x48; // How big the initial "SC" header is within the save data
const SAVE_HEADER_SIZE_PS1 = Ps1MemcardSaveData.FRAME_SIZE * 4;

const FILENAME_PRODUCT_CODE_OFFSET = 0x64;
const FILENAME_PRODUCT_CODE_LENGTH = 0x0C;
const FILENAME_DESCRIPTION_OFFSET = 0x70;
const FILENAME_DESCRIPTION_LENGTH = 0x08;
const FILENAME_ENCODING = 'US-ASCII';

// Filename of a PS1 save in the style of uLaunchElf
function getPs1IndividualFilename(ps3HeaderArrayBuffer, filenameTextDecoder) {
  const offset = FILENAME_PRODUCT_CODE_OFFSET;
  const length = FILENAME_PRODUCT_CODE_LENGTH + FILENAME_DESCRIPTION_LENGTH;

  return Util.trimNull(filenameTextDecoder.decode(ps3HeaderArrayBuffer.slice(offset, offset + length)));
}

// Filename of a PS1 save in the style of a PS3:
// It's the product code concatted with the description encoded as hex bytes
// https://psdevwiki.com/ps3/PS1_Savedata#Filename_Format
function getPs3IndividualFilename(ps3HeaderArrayBuffer, filenameTextDecoder) {
  const productCode = Util.trimNull(
    filenameTextDecoder.decode(
      ps3HeaderArrayBuffer.slice(FILENAME_PRODUCT_CODE_OFFSET, FILENAME_PRODUCT_CODE_OFFSET + FILENAME_PRODUCT_CODE_LENGTH),
    ),
  );
  const descriptionArrayBuffer = ps3HeaderArrayBuffer.slice(FILENAME_DESCRIPTION_OFFSET, FILENAME_DESCRIPTION_OFFSET + FILENAME_DESCRIPTION_LENGTH);
  const descriptionArray = Util.getNullTerminatedArray(new Uint8Array(descriptionArrayBuffer), 0);
  const descriptionEncoded = Util.uint8ArrayToHex(descriptionArray);

  return `${productCode}${descriptionEncoded}.PSV`;
}

function createPs3SaveFile(ps1SaveFile) {
  // First create the header

  const ps3HeaderArrayBuffer = new ArrayBuffer(HEADER_LENGTH);
  const ps3HeaderArray = new Uint8Array(ps3HeaderArrayBuffer);
  const ps3HeaderDataView = new DataView(ps3HeaderArrayBuffer);

  const magicTextEncoder = new TextEncoder(MAGIC_ENCODING);
  const filenameTextEncoder = new TextEncoder(FILENAME_ENCODING);

  const encodedFilename = Ps1MemcardSaveData.encodeFilename(ps1SaveFile.filename, filenameTextEncoder);

  ps3HeaderArray.fill(0);

  ps3HeaderArray.set(magicTextEncoder.encode(HEADER_MAGIC), 0);
  ps3HeaderArray.set(new Uint8Array(SonyUtil.SALT_SEED_INIT), SALT_SEED_OFFSET);
  ps3HeaderArray.set(encodedFilename, FILENAME_PRODUCT_CODE_OFFSET);

  ps3HeaderDataView.setUint32(PLATFORM_INDICATOR_1_OFFSET, PLATFORM_INDICATOR_1_PS1, LITTLE_ENDIAN);
  ps3HeaderDataView.setUint32(PLATFORM_INDICATOR_2_OFFSET, PLATFORM_INDICATOR_2_PS1, LITTLE_ENDIAN);
  ps3HeaderDataView.setUint32(SAVE_SIZE_OFFSET, ps1SaveFile.rawData.byteLength, LITTLE_ENDIAN);
  ps3HeaderDataView.setUint32(SAVE_START_BYTE_OFFSET, HEADER_LENGTH, LITTLE_ENDIAN);
  ps3HeaderDataView.setUint32(SAVE_HEADER_SIZE_OFFSET, SAVE_HEADER_SIZE_PS1, LITTLE_ENDIAN);

  // These are listed as "unknown" on the ps3 dev wiki: https://psdevwiki.com/ps3/PS1_Savedata#PS1_Single_Save_.3F_.28.PSV.29
  // And in memcardrex they're filled in with the examples from the wiki: https://github.com/ShendoXT/memcardrex/blob/master/MemcardRex/ps1card.cs#L333
  // So we'll follow along with memcardrex
  ps3HeaderDataView.setUint32(0x5C, 0x2000, LITTLE_ENDIAN);
  ps3HeaderDataView.setUint32(0x60, 0x9003, LITTLE_ENDIAN);

  // Now we can calculate a signature

  const combinedArrayBuffer = Util.concatArrayBuffers([ps3HeaderArrayBuffer, ps1SaveFile.rawData]);

  const signature = SonyUtil.calculateSignature(combinedArrayBuffer, SonyUtil.SALT_SEED_INIT, SALT_SEED_LENGTH, SIGNATURE_OFFSET, SIGNATURE_LENGTH);

  const ps3SaveDataArrayBuffer = Util.setArrayBufferPortion(combinedArrayBuffer, signature, SIGNATURE_OFFSET, 0, SIGNATURE_LENGTH);

  // We're all done!

  const filenameTextDecoder = new TextDecoder(FILENAME_ENCODING);

  return {
    startingBlock: ps1SaveFile.startingBlock,
    filename: getPs3IndividualFilename(ps3HeaderArrayBuffer, filenameTextDecoder),
    description: ps1SaveFile.description,
    rawData: ps3SaveDataArrayBuffer,
  };
}

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

      if ((platformIndicator1 !== PLATFORM_INDICATOR_1_PS1) || (platformIndicator2 !== PLATFORM_INDICATOR_2_PS1)) {
        throw new Error('This does not appear to be a PS1 save file');
      }

      // Check the size etc

      const saveSize = ps3HeaderDataView.getUint32(SAVE_SIZE_OFFSET, LITTLE_ENDIAN);
      const saveStartByte = ps3HeaderDataView.getUint32(SAVE_START_BYTE_OFFSET, LITTLE_ENDIAN);
      const saveHeaderSize = ps3HeaderDataView.getUint32(SAVE_HEADER_SIZE_OFFSET, LITTLE_ENDIAN);

      if (saveSize !== ps1SaveDataArrayBuffer.byteLength) {
        throw new Error(`Size mismatch: size is specified as ${saveSize} bytes in the header but actual save size is ${ps1SaveDataArrayBuffer.byteLength} bytes`);
      }

      if (saveStartByte !== HEADER_LENGTH) {
        throw new Error('Save appears to be corrupted: save start byte does not match header size');
      }

      if (saveHeaderSize !== SAVE_HEADER_SIZE_PS1) {
        throw new Error(`Save appears to be corrupted: save header size appears incorrect. Got ${saveHeaderSize}`);
      }

      // Everything checks out
      //
      // Note that because we're creating this from PS1 save files, the new PS3 files that are created from this
      // will have a different salt seed and thus signature than the original ones. In theory, we should be outputting
      // the original PS3 saves again, but in practice who would want to convert a PS3 save to a PS3 save? So it shouldn't matter.

      return {
        startingBlock: null, // Not needed to be set
        filename: getPs1IndividualFilename(ps3HeaderArrayBuffer, filenameTextDecoder),
        description: null, // Not needed to be set
        rawData: ps1SaveDataArrayBuffer,
      };
    });

    const memcardSaveData = Ps1MemcardSaveData.createFromSaveFiles(ps1SaveFiles);

    return new Ps3SaveData(memcardSaveData.getArrayBuffer());
  }

  static createFromPs1SaveFiles(ps1SaveFiles) {
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
