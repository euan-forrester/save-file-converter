/* eslint no-bitwise: ["error", { "allow": ["^"] }] */

/*
PS3 files are a bit different from the PSP/DexDrive files. The PS3 just imports/exports individual save files, so there's
no representation of a whole memory card (there is one internally in the PS3, which is just a raw PS1 memory card,
but that's not user-facing unless the console is hacked)

The PS3 individual save files consist of a header then the regular PS1 save data. A description of the format can be
found here: https://psdevwiki.com/ps3/PS1_Savedata#PS1_Single_Save_.3F_.28.PSV.29

*/

import Ps1MemcardSaveData from './Memcard';
import Sony from './Sony';
import Util from '../../util/util';

// PS3 header

const HEADER_LENGTH = 0x84;
const HEADER_MAGIC = '\x00VSP\x00\x00\x00\x00';
const HEADER_MAGIC_ENCODING = 'US-ASCII';

const HEADER_FILENAME_PRODUCT_CODE_OFFSET = 0x64;
const HEADER_FILENAME_PRODUCT_CODE_LENGTH = 0x0C;
const HEADER_FILENAME_DESCRIPTION_OFFSET = 0x70;
const HEADER_FILENAME_DESCRIPTION_LENGTH = 0x08;
const HEADER_FILENAME_ENCODING = 'US-ASCII';

const SALT_SEED_OFFSET = 0x08;
const SALT_SEED_LENGTH = 0x14;

const SIGNATURE_OFFSET = 0x1C;
const SIGNATURE_LENGTH = 0x14;

// Filename of a PS1 save in the style of uLaunchElf
function getPs1IndividualFilename(ps3HeaderArrayBuffer, filenameTextDecoder) {
  const offset = HEADER_FILENAME_PRODUCT_CODE_OFFSET;
  const length = HEADER_FILENAME_PRODUCT_CODE_LENGTH + HEADER_FILENAME_DESCRIPTION_LENGTH;

  return Util.trimNull(filenameTextDecoder.decode(ps3HeaderArrayBuffer.slice(offset, offset + length)));
}

// Filename of a PS1 save in the style of a PS3:
// It's the product code concatted with the description encoded as hex bytes
// https://psdevwiki.com/ps3/PS1_Savedata#Filename_Format
function getPs3IndividualFilename(ps3HeaderArrayBuffer, filenameTextDecoder) {
  const productCode = Util.trimNull(
    filenameTextDecoder.decode(
      ps3HeaderArrayBuffer.slice(HEADER_FILENAME_PRODUCT_CODE_OFFSET, HEADER_FILENAME_PRODUCT_CODE_OFFSET + HEADER_FILENAME_PRODUCT_CODE_LENGTH),
    ),
  );
  const descriptionArrayBuffer = ps3HeaderArrayBuffer.slice(HEADER_FILENAME_DESCRIPTION_OFFSET, HEADER_FILENAME_DESCRIPTION_OFFSET + HEADER_FILENAME_DESCRIPTION_LENGTH);
  const descriptionArray = Util.getNullTerminatedArray(new Uint8Array(descriptionArrayBuffer), 0);
  const descriptionEncoded = Util.uint8ArrayToHex(descriptionArray);

  return `${productCode}${descriptionEncoded}.PSV`;
}

function createPs3SaveFile(ps1SaveFileArrayBuffer) {
  return ps1SaveFileArrayBuffer;
}

export default class Ps3SaveData {
  static createFromPs3SaveFiles(ps3SaveFiles) {
    // The PS3 image is the PS3 header then the regular memcard data

    const filenameTextDecoder = new TextDecoder(HEADER_FILENAME_ENCODING);

    const ps1SaveFiles = ps3SaveFiles.map((ps3SaveFile) => {
      // Parse the PS3-specific header

      const ps3HeaderArrayBuffer = ps3SaveFile.rawData.slice(0, HEADER_LENGTH);

      Util.checkMagic(ps3HeaderArrayBuffer, 0, HEADER_MAGIC, HEADER_MAGIC_ENCODING);

      // Parse the PS3 filename into a PS1 filename. PS3 filename is the PS1 filename plus an encoded form of the description.

      console.log(`Generated PS3 filename: '${getPs3IndividualFilename(ps3HeaderArrayBuffer, filenameTextDecoder)}'`);

      // Check the signature

      const saltSeed = ps3HeaderArrayBuffer.slice(SALT_SEED_OFFSET, SALT_SEED_OFFSET + SALT_SEED_LENGTH);
      const signatureCalculated = Sony.calculateSignature(ps3SaveFile.rawData, saltSeed, SALT_SEED_LENGTH, SIGNATURE_OFFSET, SIGNATURE_LENGTH);

      // Check the signature we generated against the one we found

      const signatureFound = Buffer.from(ps3HeaderArrayBuffer.slice(SIGNATURE_OFFSET, SIGNATURE_OFFSET + SIGNATURE_LENGTH));

      if (signatureFound.compare(signatureCalculated) !== 0) {
        throw new Error(`Save appears to be corrupted: expected signature ${signatureFound.toString('hex')} but calculated signature ${signatureCalculated.toString('hex')}`);
      }

      // Everything checks out

      return {
        startingBlock: 0, // Not needed to be set
        filename: getPs1IndividualFilename(ps3HeaderArrayBuffer, filenameTextDecoder),
        description: null, // Not needed to be set
        rawData: ps3SaveFile.rawData.slice(HEADER_LENGTH),
      };
    });

    console.log('Made list of ps1 save files: ', ps1SaveFiles);

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
