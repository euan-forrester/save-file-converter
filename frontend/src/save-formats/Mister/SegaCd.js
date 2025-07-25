/*
The Mister Sega CD save file is a single file with the internal backup RAM (8kB) concatenated with the cartridge backup RAM (set to 512kB)

Most other platforms store 2 files, but the Mister stores just one for consistency with its other cores.

Once the file is parsed, like all platforms the Mister interfaces with Sega CD data via its BIOS, meaning that all saves are the same.

In the example saves I was given, one of them was a 520kB (8kB + 512kB) file but without the BRAM_FORMAT at the end of the second section
(that section was completely blank). So I guess that part wasn't valid, and we should just truncate the file.
*/

import SegaCdUtil from '../../util/SegaCd';
import Util from '../../util/util';
import SegaError from '../SegaError';

export default class MisterSegaCdSaveData {
  static INTERNAL_MEMORY = 'internal-memory';

  static RAM_CART = 'ram-cart';

  static RAM_CART_SIZE = 524288; // Both the Mister and the emulators I've seen produce RAM cart files of this size

  static getMisterFileExtension() {
    return 'sav';
  }

  static getRawFileExtension() {
    return 'brm';
  }

  static adjustOutputSizesPlatform() {
    return 'segacd';
  }

  static createWithNewSize(misterSaveData, newSize) {
    // Just leave the mister data alone: it can't load anything other than the original 512kB ram cart size.
    // But other platforms/emulators may need a different ram cart size
    const newRawRamCartArrayBuffer = SegaCdUtil.resize(misterSaveData.rawCartSaveArrayBuffer, newSize);

    return new MisterSegaCdSaveData(misterSaveData.rawInternalSaveArrayBuffer, newRawRamCartArrayBuffer, misterSaveData.misterArrayBuffer);
  }

  static createFromMisterData(misterArrayBuffer) {
    // The file can be either just internal backup RAM (potentially with padding afterward),
    // or internal backup RAM concatenated with RAM cart backup RAM

    if (misterArrayBuffer.byteLength === (SegaCdUtil.INTERNAL_SAVE_SIZE + MisterSegaCdSaveData.RAM_CART_SIZE)) {
      let internalArrayBuffer = misterArrayBuffer.slice(0, SegaCdUtil.INTERNAL_SAVE_SIZE);
      let ramCartArrayBuffer = misterArrayBuffer.slice(SegaCdUtil.INTERNAL_SAVE_SIZE, SegaCdUtil.INTERNAL_SAVE_SIZE + MisterSegaCdSaveData.RAM_CART_SIZE);

      internalArrayBuffer = SegaCdUtil.isCorrectlyFormatted(internalArrayBuffer) ? SegaCdUtil.truncateToActualSize(internalArrayBuffer) : SegaCdUtil.makeEmptySave(SegaCdUtil.INTERNAL_SAVE_SIZE);
      ramCartArrayBuffer = SegaCdUtil.isCorrectlyFormatted(ramCartArrayBuffer) ? SegaCdUtil.truncateToActualSize(ramCartArrayBuffer) : SegaCdUtil.makeEmptySave(MisterSegaCdSaveData.RAM_CART_SIZE);

      return new MisterSegaCdSaveData(internalArrayBuffer, ramCartArrayBuffer, misterArrayBuffer);
    }

    return new MisterSegaCdSaveData(SegaCdUtil.truncateToActualSize(misterArrayBuffer), SegaCdUtil.makeEmptySave(MisterSegaCdSaveData.RAM_CART_SIZE), misterArrayBuffer);
  }

  static createFromRawData({ rawInternalSaveArrayBuffer = null, rawCartSaveArrayBuffer = null }) {
    // We can output either a large (8kB + 512kB) save or a small (only 8kB) save depending on
    // whether we're passed an internal save buffer and/or a ram cart save buffer.
    // There are 4 cases, depending on which combination of raw file we are passed.

    let truncatedRawInternalSaveBuffer = null;
    let truncatedRawCartSaveArrayBuffer = null;
    let misterRamCartSaveArrayBuffer = null;

    // since either file (or both files) could have errors, throw an object with all errors collected
    const conversionErrors = { internalSaveError: null, ramCartError: null };

    if (rawInternalSaveArrayBuffer !== null) {
      try {
        truncatedRawInternalSaveBuffer = SegaCdUtil.truncateToActualSize(rawInternalSaveArrayBuffer);
        if (truncatedRawInternalSaveBuffer.byteLength !== SegaCdUtil.INTERNAL_SAVE_SIZE) {
          conversionErrors.internalSaveError = `Internal save RAM is not the correct size. Must be ${SegaCdUtil.INTERNAL_SAVE_SIZE} bytes`;
        }
      } catch (error) {
        conversionErrors.internalSaveError = error.message;
      }
    }

    if (rawCartSaveArrayBuffer !== null) {
      try {
        truncatedRawCartSaveArrayBuffer = SegaCdUtil.truncateToActualSize(rawCartSaveArrayBuffer);
        misterRamCartSaveArrayBuffer = SegaCdUtil.resize(truncatedRawCartSaveArrayBuffer, MisterSegaCdSaveData.RAM_CART_SIZE);
      } catch (error) {
        conversionErrors.ramCartError = error.message;
      }
    }

    if ((conversionErrors.internalSaveError !== null) || (conversionErrors.ramCartError !== null)) {
      throw new SegaError(conversionErrors.internalSaveError, conversionErrors.ramCartError);
    }

    // Now that we've got our pieces resized and ready, we can see what we've got and figure out
    // whether to create a small or large mister file

    if (truncatedRawInternalSaveBuffer !== null) {
      if (misterRamCartSaveArrayBuffer !== null) {
        // We have both pieces, so we're creating a large mister file
        return new MisterSegaCdSaveData(truncatedRawInternalSaveBuffer, truncatedRawCartSaveArrayBuffer, Util.concatArrayBuffers([truncatedRawInternalSaveBuffer, misterRamCartSaveArrayBuffer]));
      }

      // We have the internal save data but not the ram cart save data, so create a small mister file
      return new MisterSegaCdSaveData(truncatedRawInternalSaveBuffer, SegaCdUtil.makeEmptySave(MisterSegaCdSaveData.RAM_CART_SIZE), truncatedRawInternalSaveBuffer);
    }

    // We don't have an internal save buffer
    const emptyInternalSaveBuffer = SegaCdUtil.makeEmptySave(SegaCdUtil.INTERNAL_SAVE_SIZE);

    if (misterRamCartSaveArrayBuffer !== null) {
      // We have only the ram cart data, so create a large mister file
      return new MisterSegaCdSaveData(emptyInternalSaveBuffer, truncatedRawCartSaveArrayBuffer, Util.concatArrayBuffers([emptyInternalSaveBuffer, misterRamCartSaveArrayBuffer]));
    }

    // We were given neither an internal nor a ram cart save buffer, so return a small mister file
    return new MisterSegaCdSaveData(emptyInternalSaveBuffer, SegaCdUtil.makeEmptySave(MisterSegaCdSaveData.RAM_CART_SIZE), emptyInternalSaveBuffer);
  }

  // This constructor creates a new object from a binary representation of a MiSTer save data file
  constructor(rawInternalSaveArrayBuffer, rawCartSaveArrayBuffer, misterArrayBuffer) {
    this.rawInternalSaveArrayBuffer = rawInternalSaveArrayBuffer;
    this.rawCartSaveArrayBuffer = rawCartSaveArrayBuffer;
    this.misterArrayBuffer = misterArrayBuffer;
  }

  getRawArrayBuffer(index = MisterSegaCdSaveData.INTERNAL_MEMORY) {
    switch (index) {
      case MisterSegaCdSaveData.INTERNAL_MEMORY:
        return this.rawInternalSaveArrayBuffer;

      case MisterSegaCdSaveData.RAM_CART:
        return this.rawCartSaveArrayBuffer;

      default:
        throw new Error(`Unknown index: ${index}`);
    }
  }

  getMisterArrayBuffer() {
    return this.misterArrayBuffer;
  }
}
