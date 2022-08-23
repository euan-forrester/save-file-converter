/*
The Mister Sega CD save file is a single file with the internal backup RAM (8kB) concatenated with the cartridge backup RAM (set to 512kB)

Most other platforms store 2 files, but the Mister stores just one for consistency with its other cores.

Once the file is parsed, like all platforms the Mister interfaces with Sega CD data via its BIOS, meaning that all saves are the same.

In the example saves I was given, one of them was a 520kB (8kB + 512kB) file but without the BRAM_FORMAT at the end of the second section
(that section was completely blank). So I guess that part wasn't valid, and we should just truncate the file.
*/

import SegaCdUtil from '../../util/SegaCd';
import Util from '../../util/util';

export default class MisterSegaCdSaveData {
  static INTERNAL_SAVE_INDEX = 0;

  static RAM_CART_SAVE_INDEX = 1;

  static RAM_CART_SIZE = 524288;

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
    const newRawRamCartArrayBuffer = SegaCdUtil.resize(misterSaveData.rawRamCartSaveArrayBuffer, newSize);

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

  static createFromRawData({ rawInternalSaveArrayBuffer = null, rawRamCartSaveArrayBuffer = null }) {
    // We can output either a large (8kB + 512kB) save or a small (only 8kB) save depending on
    // whether we're passed an internal save buffer and/or a ram cart save buffer.
    // There are 4 cases, depending on which combination of raw file we are passed.

    let truncatedRawInternalSaveBuffer = null;
    let truncatedRawRamCartSaveArrayBuffer = null;
    let misterRamCartSaveArrayBuffer = null;

    if (rawInternalSaveArrayBuffer !== null) {
      truncatedRawInternalSaveBuffer = SegaCdUtil.truncateToActualSize(rawInternalSaveArrayBuffer);

      if (truncatedRawInternalSaveBuffer.byteLength !== SegaCdUtil.INTERNAL_SAVE_SIZE) {
        throw new Error(`Internal save RAM is not the correct size. Must be ${SegaCdUtil.INTERNAL_SAVE_SIZE} bytes`);
      }
    }

    if (rawRamCartSaveArrayBuffer !== null) {
      truncatedRawRamCartSaveArrayBuffer = SegaCdUtil.truncateToActualSize(rawRamCartSaveArrayBuffer);
      misterRamCartSaveArrayBuffer = SegaCdUtil.resize(truncatedRawRamCartSaveArrayBuffer, MisterSegaCdSaveData.RAM_CART_SIZE);
    }

    // Now that we've got our pieces resized and ready, we can see what we've got and figure out
    // whether to create a small or large mister file

    if (truncatedRawInternalSaveBuffer !== null) {
      if (misterRamCartSaveArrayBuffer !== null) {
        // We have both pieces, so we're creating a large mister file
        return new MisterSegaCdSaveData(truncatedRawInternalSaveBuffer, truncatedRawRamCartSaveArrayBuffer, Util.concatArrayBuffers([truncatedRawInternalSaveBuffer, misterRamCartSaveArrayBuffer]));
      }

      // We have the internal save data but not the ram cart save data, so create a small mister file
      return new MisterSegaCdSaveData(truncatedRawInternalSaveBuffer, SegaCdUtil.makeEmptySave(MisterSegaCdSaveData.RAM_CART_SIZE), truncatedRawInternalSaveBuffer);
    }

    // We don't have an internal save buffer
    const emptyInternalSaveBuffer = SegaCdUtil.makeEmptySave(SegaCdUtil.INTERNAL_SAVE_SIZE);

    if (misterRamCartSaveArrayBuffer !== null) {
      // We have only the ram cart data, so create a large mister file
      return new MisterSegaCdSaveData(emptyInternalSaveBuffer, truncatedRawRamCartSaveArrayBuffer, Util.concatArrayBuffers([emptyInternalSaveBuffer, misterRamCartSaveArrayBuffer]));
    }

    // We were given neither an internal nor a ram cart save buffer, so return a small mister file
    return new MisterSegaCdSaveData(emptyInternalSaveBuffer, SegaCdUtil.makeEmptySave(MisterSegaCdSaveData.RAM_CART_SIZE), emptyInternalSaveBuffer);
  }

  // This constructor creates a new object from a binary representation of a MiSTer save data file
  constructor(rawInternalSaveArrayBuffer, rawRamCartSaveArrayBuffer, misterArrayBuffer) {
    this.rawInternalSaveArrayBuffer = rawInternalSaveArrayBuffer;
    this.rawRamCartSaveArrayBuffer = rawRamCartSaveArrayBuffer;
    this.misterArrayBuffer = misterArrayBuffer;
  }

  getRawArrayBuffer(index) {
    if (index === undefined) {
      return [
        {
          arrayBuffer: this.rawInternalSaveArrayBuffer,
          fileSuffix: ` - internal.${MisterSegaCdSaveData.getRawFileExtension()}`,
        },
        {
          arrayBuffer: this.rawRamCartSaveArrayBuffer,
          fileSuffix: ` - cart.${MisterSegaCdSaveData.getRawFileExtension()}`,
        },
      ];
    }

    switch (index) {
      case MisterSegaCdSaveData.INTERNAL_SAVE_INDEX:
        return this.rawInternalSaveArrayBuffer;

      case MisterSegaCdSaveData.RAM_CART_SAVE_INDEX:
        return this.rawRamCartSaveArrayBuffer;

      default:
        throw new Error(`Unknown index: ${index}`);
    }
  }

  getRawSaveSize() {
    // The internal save size can't be changed, but the ram cart one can
    return this.rawRamCartSaveArrayBuffer.byteLength;
  }

  getMisterArrayBuffer() {
    return this.misterArrayBuffer;
  }
}
