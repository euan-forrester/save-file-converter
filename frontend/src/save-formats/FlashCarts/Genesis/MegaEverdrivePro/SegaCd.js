import SegaCdUtil from '../../../../util/SegaCd';

export default class GenesisMegaEverdriveProSegaCdFlashCartSaveData {
  static INTERNAL_MEMORY = 'internal-memory';

  static RAM_CART = 'ram-cart';

  static FLASH_CART_RAM_CART_SIZE = 131072; // The Mega Everdrive Pro produces RAM cart files of this size as of firmware v24.1129

  static EMULATOR_RAM_CART_SIZE = 524288; // The emulators I've seen produce a RAM cart file of this size (note that the output size is changeable by the user)

  static createFromFlashCartData({ flashCartInternalSaveArrayBuffer = null, flashCartRamCartSaveArrayBuffer = null }) {
    let truncatedFlashCartInternalSaveBuffer = SegaCdUtil.makeEmptySave(SegaCdUtil.INTERNAL_SAVE_SIZE);
    let truncatedFlashCartRamCartSaveArrayBuffer = SegaCdUtil.makeEmptySave(GenesisMegaEverdriveProSegaCdFlashCartSaveData.FLASH_CART_RAM_CART_SIZE);
    let rawRamCartSaveArrayBuffer = SegaCdUtil.makeEmptySave(GenesisMegaEverdriveProSegaCdFlashCartSaveData.EMULATOR_RAM_CART_SIZE);

    if (flashCartInternalSaveArrayBuffer !== null) {
      truncatedFlashCartInternalSaveBuffer = SegaCdUtil.truncateToActualSize(flashCartInternalSaveArrayBuffer);

      if (truncatedFlashCartInternalSaveBuffer.byteLength !== SegaCdUtil.INTERNAL_SAVE_SIZE) {
        throw new Error(`Internal save RAM is not the correct size. Must be ${SegaCdUtil.INTERNAL_SAVE_SIZE} bytes`);
      }
    }

    if (flashCartRamCartSaveArrayBuffer !== null) {
      truncatedFlashCartRamCartSaveArrayBuffer = SegaCdUtil.truncateToActualSize(flashCartRamCartSaveArrayBuffer);
      rawRamCartSaveArrayBuffer = SegaCdUtil.resize(truncatedFlashCartRamCartSaveArrayBuffer, GenesisMegaEverdriveProSegaCdFlashCartSaveData.EMULATOR_RAM_CART_SIZE);
    }

    return new GenesisMegaEverdriveProSegaCdFlashCartSaveData(
      truncatedFlashCartInternalSaveBuffer,
      truncatedFlashCartRamCartSaveArrayBuffer,
      truncatedFlashCartInternalSaveBuffer,
      rawRamCartSaveArrayBuffer,
    );
  }

  static createFromRawData({ rawInternalSaveArrayBuffer = null, rawRamCartSaveArrayBuffer = null }) {
    let truncatedRawInternalSaveBuffer = SegaCdUtil.makeEmptySave(SegaCdUtil.INTERNAL_SAVE_SIZE);
    let truncatedRawRamCartSaveArrayBuffer = SegaCdUtil.makeEmptySave(GenesisMegaEverdriveProSegaCdFlashCartSaveData.EMULATOR_RAM_CART_SIZE);
    let flashCartRamCartSaveArrayBuffer = SegaCdUtil.makeEmptySave(GenesisMegaEverdriveProSegaCdFlashCartSaveData.FLASH_CART_RAM_CART_SIZE);

    if (rawInternalSaveArrayBuffer !== null) {
      truncatedRawInternalSaveBuffer = SegaCdUtil.truncateToActualSize(rawInternalSaveArrayBuffer);

      if (truncatedRawInternalSaveBuffer.byteLength !== SegaCdUtil.INTERNAL_SAVE_SIZE) {
        throw new Error(`Internal save RAM is not the correct size. Must be ${SegaCdUtil.INTERNAL_SAVE_SIZE} bytes`);
      }
    }

    if (rawRamCartSaveArrayBuffer !== null) {
      truncatedRawRamCartSaveArrayBuffer = SegaCdUtil.truncateToActualSize(rawRamCartSaveArrayBuffer);
      flashCartRamCartSaveArrayBuffer = SegaCdUtil.resize(truncatedRawRamCartSaveArrayBuffer, GenesisMegaEverdriveProSegaCdFlashCartSaveData.FLASH_CART_RAM_CART_SIZE);
    }

    return new GenesisMegaEverdriveProSegaCdFlashCartSaveData(
      truncatedRawInternalSaveBuffer,
      flashCartRamCartSaveArrayBuffer,
      truncatedRawInternalSaveBuffer,
      truncatedRawRamCartSaveArrayBuffer,
    );
  }

  static createWithNewSize(flashCartSaveData, newSize) {
    const newRawRamCartArrayBuffer = SegaCdUtil.resize(flashCartSaveData.rawRamCartSaveArrayBuffer, newSize);

    return new GenesisMegaEverdriveProSegaCdFlashCartSaveData(
      flashCartSaveData.flashCartInternalSaveArrayBuffer,
      flashCartSaveData.flashCartRamCartSaveArrayBuffer,
      flashCartSaveData.rawInternalSaveArrayBuffer,
      newRawRamCartArrayBuffer,
    );
  }

  static getFlashCartFileExtension() {
    return null; // See getFlashCartFileName()
  }

  static getFlashCartFileName(index = GenesisMegaEverdriveProSegaCdFlashCartSaveData.INTERNAL_MEMORY) {
    switch (index) {
      case GenesisMegaEverdriveProSegaCdFlashCartSaveData.INTERNAL_MEMORY:
        return 'cd-bram.brm';

      case GenesisMegaEverdriveProSegaCdFlashCartSaveData.RAM_CART:
        return 'cd-cart.srm';

      default:
        throw new Error(`Unknown index: ${index}`);
    }
  }

  static getRawFileExtension() {
    return 'brm';
  }

  static requiresRom() {
    return null;
  }

  static adjustOutputSizesPlatform() {
    return 'segacd';
  }

  static getRawDefaultRamCartSize() {
    return GenesisMegaEverdriveProSegaCdFlashCartSaveData.EMULATOR_RAM_CART_SIZE;
  }

  static getFlashCartDefaultRamCartSize() {
    return GenesisMegaEverdriveProSegaCdFlashCartSaveData.FLASH_CART_RAM_CART_SIZE;
  }

  constructor(flashCartInternalSaveArrayBuffer, flashCartRamCartSaveArrayBuffer, rawInternalSaveArrayBuffer, rawRamCartSaveArrayBuffer) {
    this.flashCartInternalSaveArrayBuffer = flashCartInternalSaveArrayBuffer;
    this.flashCartRamCartSaveArrayBuffer = flashCartRamCartSaveArrayBuffer;
    this.rawInternalSaveArrayBuffer = rawInternalSaveArrayBuffer;
    this.rawRamCartSaveArrayBuffer = rawRamCartSaveArrayBuffer;
  }

  getRawArrayBuffer(index = GenesisMegaEverdriveProSegaCdFlashCartSaveData.INTERNAL_MEMORY) {
    switch (index) {
      case GenesisMegaEverdriveProSegaCdFlashCartSaveData.INTERNAL_MEMORY:
        return this.rawInternalSaveArrayBuffer;

      case GenesisMegaEverdriveProSegaCdFlashCartSaveData.RAM_CART:
        return this.rawRamCartSaveArrayBuffer;

      default:
        throw new Error(`Unknown index: ${index}`);
    }
  }

  getFlashCartArrayBuffer(index = GenesisMegaEverdriveProSegaCdFlashCartSaveData.INTERNAL_MEMORY) {
    switch (index) {
      case GenesisMegaEverdriveProSegaCdFlashCartSaveData.INTERNAL_MEMORY:
        return this.flashCartInternalSaveArrayBuffer;

      case GenesisMegaEverdriveProSegaCdFlashCartSaveData.RAM_CART:
        return this.flashCartRamCartSaveArrayBuffer;

      default:
        throw new Error(`Unknown index: ${index}`);
    }
  }
}
