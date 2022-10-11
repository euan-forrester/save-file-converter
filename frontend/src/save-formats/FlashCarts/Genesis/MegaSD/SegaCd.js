// The MegaSD produces a single file for Sega CD that's a concatenation of:
//
// - Magic
// - Internal memory
// - RAM cart

import SegaCdUtil from '../../../../util/SegaCd';
import Util from '../../../../util/util';

const MAGIC = 'BUP3';
const MAGIC_OFFSET = 0;
const MAGIC_ENCODING = 'US-ASCII';

const INTERNAL_MEMORY_OFFSET = 4;
const RAM_CART_OFFSET = INTERNAL_MEMORY_OFFSET + SegaCdUtil.INTERNAL_SAVE_SIZE;

export default class GenesisMegaSdSegaCdFlashCartSaveData {
  static INTERNAL_MEMORY = 'internal-memory';

  static RAM_CART = 'ram-cart';

  static FLASH_CART_RAM_CART_SIZE = 32768; // The RAM cart portion of a Mega SD file is this size

  static EMULATOR_RAM_CART_SIZE = 524288; // The emulators I've seen produce a RAM cart file of this size (note that the output size is changeable by the user)

  static createFromFlashCartData(flashCartArrayBuffer) {
    Util.checkMagic(flashCartArrayBuffer, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);

    if (flashCartArrayBuffer.byteLength !== (INTERNAL_MEMORY_OFFSET + SegaCdUtil.INTERNAL_SAVE_SIZE + GenesisMegaSdSegaCdFlashCartSaveData.FLASH_CART_RAM_CART_SIZE)) {
      throw new Error('This file does not appear to be a Mega SD Sega CD save file');
    }

    const flashCartInternalSaveArrayBuffer = flashCartArrayBuffer.slice(INTERNAL_MEMORY_OFFSET, INTERNAL_MEMORY_OFFSET + SegaCdUtil.INTERNAL_SAVE_SIZE);
    const flashCartRamCartSaveArrayBuffer = flashCartArrayBuffer.slice(RAM_CART_OFFSET, RAM_CART_OFFSET + GenesisMegaSdSegaCdFlashCartSaveData.FLASH_CART_RAM_CART_SIZE);

    const truncatedFlashCartInternalSaveBuffer = SegaCdUtil.truncateToActualSize(flashCartInternalSaveArrayBuffer);

    if (truncatedFlashCartInternalSaveBuffer.byteLength !== SegaCdUtil.INTERNAL_SAVE_SIZE) {
      throw new Error(`Internal save RAM is not the correct size. Must be ${SegaCdUtil.INTERNAL_SAVE_SIZE} bytes`);
    }

    const truncatedFlashCartRamCartSaveArrayBuffer = SegaCdUtil.truncateToActualSize(flashCartRamCartSaveArrayBuffer);
    const rawRamCartSaveArrayBuffer = SegaCdUtil.resize(truncatedFlashCartRamCartSaveArrayBuffer, GenesisMegaSdSegaCdFlashCartSaveData.EMULATOR_RAM_CART_SIZE);

    return new GenesisMegaSdSegaCdFlashCartSaveData(
      truncatedFlashCartInternalSaveBuffer,
      truncatedFlashCartRamCartSaveArrayBuffer,
      truncatedFlashCartInternalSaveBuffer,
      rawRamCartSaveArrayBuffer,
    );
  }

  static createFromRawData({ rawInternalSaveArrayBuffer = null, rawRamCartSaveArrayBuffer = null }) {
    let truncatedRawInternalSaveBuffer = SegaCdUtil.makeEmptySave(SegaCdUtil.INTERNAL_SAVE_SIZE);
    let truncatedRawRamCartSaveArrayBuffer = SegaCdUtil.makeEmptySave(GenesisMegaSdSegaCdFlashCartSaveData.EMULATOR_RAM_CART_SIZE);
    let flashCartRamCartSaveArrayBuffer = SegaCdUtil.makeEmptySave(GenesisMegaSdSegaCdFlashCartSaveData.FLASH_CART_RAM_CART_SIZE);

    if (rawInternalSaveArrayBuffer !== null) {
      truncatedRawInternalSaveBuffer = SegaCdUtil.truncateToActualSize(rawInternalSaveArrayBuffer);

      if (truncatedRawInternalSaveBuffer.byteLength !== SegaCdUtil.INTERNAL_SAVE_SIZE) {
        throw new Error(`Internal save RAM is not the correct size. Must be ${SegaCdUtil.INTERNAL_SAVE_SIZE} bytes`);
      }
    }

    if (rawRamCartSaveArrayBuffer !== null) {
      truncatedRawRamCartSaveArrayBuffer = SegaCdUtil.truncateToActualSize(rawRamCartSaveArrayBuffer);
      flashCartRamCartSaveArrayBuffer = SegaCdUtil.resize(truncatedRawRamCartSaveArrayBuffer, GenesisMegaSdSegaCdFlashCartSaveData.FLASH_CART_RAM_CART_SIZE);
    }

    return new GenesisMegaSdSegaCdFlashCartSaveData(
      truncatedRawInternalSaveBuffer,
      flashCartRamCartSaveArrayBuffer,
      truncatedRawInternalSaveBuffer,
      truncatedRawRamCartSaveArrayBuffer,
    );
  }

  static createWithNewSize(flashCartSaveData, newSize) {
    const newRawRamCartArrayBuffer = SegaCdUtil.resize(flashCartSaveData.rawRamCartSaveArrayBuffer, newSize);

    return new GenesisMegaSdSegaCdFlashCartSaveData(
      flashCartSaveData.flashCartInternalSaveArrayBuffer,
      flashCartSaveData.flashCartRamCartSaveArrayBuffer,
      flashCartSaveData.rawInternalSaveArrayBuffer,
      newRawRamCartArrayBuffer,
    );
  }

  static getFlashCartFileExtension() {
    return null; // See getFlashCartFileName()
  }

  static getFlashCartFileName(index = GenesisMegaSdSegaCdFlashCartSaveData.INTERNAL_MEMORY) {
    switch (index) {
      case GenesisMegaSdSegaCdFlashCartSaveData.INTERNAL_MEMORY:
        return 'cd-bram.brm';

      case GenesisMegaSdSegaCdFlashCartSaveData.RAM_CART:
        return 'cd-cart.srm';

      default:
        throw new Error(`Unknown index: ${index}`);
    }
  }

  static getRawFileExtension() {
    return 'brm';
  }

  static requiresRomClass() {
    return null;
  }

  static adjustOutputSizesPlatform() {
    return 'segacd';
  }

  static getRawDefaultRamCartSize() {
    return GenesisMegaSdSegaCdFlashCartSaveData.EMULATOR_RAM_CART_SIZE;
  }

  static getFlashCartDefaultRamCartSize() {
    return GenesisMegaSdSegaCdFlashCartSaveData.FLASH_CART_RAM_CART_SIZE;
  }

  constructor(flashCartInternalSaveArrayBuffer, flashCartRamCartSaveArrayBuffer, rawInternalSaveArrayBuffer, rawRamCartSaveArrayBuffer) {
    this.flashCartInternalSaveArrayBuffer = flashCartInternalSaveArrayBuffer;
    this.flashCartRamCartSaveArrayBuffer = flashCartRamCartSaveArrayBuffer;
    this.rawInternalSaveArrayBuffer = rawInternalSaveArrayBuffer;
    this.rawRamCartSaveArrayBuffer = rawRamCartSaveArrayBuffer;
  }

  getRawArrayBuffer(index = GenesisMegaSdSegaCdFlashCartSaveData.INTERNAL_MEMORY) {
    switch (index) {
      case GenesisMegaSdSegaCdFlashCartSaveData.INTERNAL_MEMORY:
        return this.rawInternalSaveArrayBuffer;

      case GenesisMegaSdSegaCdFlashCartSaveData.RAM_CART:
        return this.rawRamCartSaveArrayBuffer;

      default:
        throw new Error(`Unknown index: ${index}`);
    }
  }

  getFlashCartArrayBuffer(index = GenesisMegaSdSegaCdFlashCartSaveData.INTERNAL_MEMORY) {
    switch (index) {
      case GenesisMegaSdSegaCdFlashCartSaveData.INTERNAL_MEMORY:
        return this.flashCartInternalSaveArrayBuffer;

      case GenesisMegaSdSegaCdFlashCartSaveData.RAM_CART:
        return this.flashCartRamCartSaveArrayBuffer;

      default:
        throw new Error(`Unknown index: ${index}`);
    }
  }
}
