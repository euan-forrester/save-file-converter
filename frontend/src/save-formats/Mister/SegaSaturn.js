/*
The Saturn core on the MiSTer stores out regular Saturn BIOS files, except "byte expanded".

Currently, it only emulates the Saturn's internal memory. There are eventual plans to also emulate the save cartridge, and when
that happens it is likely that the cartridge memory will be optionally appended to the internal memory -- the same as how the Sega CD
does it: https://github.com/MiSTer-devel/Saturn_MiSTer/issues/283
*/

import SegaSaturnSaveData from '../SegaSaturn/SegaSaturn';
import MednafenSegaSaturnSaveData from '../SegaSaturn/mednafen';

import GenesisUtil from '../../util/Genesis';

/*
The Mister Sega CD save file is a single file with the internal backup RAM (8kB) concatenated with the cartridge backup RAM (set to 512kB)

Most other platforms store 2 files, but the Mister stores just one for consistency with its other cores.

Once the file is parsed, like all platforms the Mister interfaces with Sega CD data via its BIOS, meaning that all saves are the same.

In the example saves I was given, one of them was a 520kB (8kB + 512kB) file but without the BRAM_FORMAT at the end of the second section
(that section was completely blank). So I guess that part wasn't valid, and we should just truncate the file.
*/

import Util from '../../util/util';

const MISTER_INTERNAL_SAVE_SIZE = SegaSaturnSaveData.INTERNAL_SAVE_SIZE * 2;
const MISTER_CARTRIDGE_SAVE_SIZE = SegaSaturnSaveData.CARTRIDGE_SAVE_SIZE * 2;

const MISTER_PADDING_VALUE = 0x00;

const MISTER_GARBAGE_LENGTH = 0x40; // Some saves (from an earlier version of the core?) contain data for the first 0x40 bytes that looks like: "BBcaUcRkmUFprRaaBmc UFRomrFmraat" rather than " B a c k U p R a m   F o r m a t", which still reads correctly if you look at every other byte, but fails GenesisUtil.isByteExpanded()

export default class MisterSegaSaturnSaveData {
  static INTERNAL_MEMORY = 'internal-memory';

  static RAM_CART = 'ram-cart';

  static getMisterFileExtension() {
    return 'sav';
  }

  static getRawFileExtension() {
    return 'bkr';
  }

  static adjustOutputSizesPlatform() {
    return 'segasaturn';
  }

  static createWithNewSize(/* misterSaveData, newSize */) {
    /*
    // Just leave the mister data alone: it can't load anything other than the original 512kB ram cart size.
    // But other platforms/emulators may need a different ram cart size
    const newRawCartArrayBuffer = SegaCdUtil.resize(misterSaveData.rawRamCartSaveArrayBuffer, newSize);

    return new MisterSegaSaturnSaveData(misterSaveData.rawInternalSaveArrayBuffer, newRawRamCartArrayBuffer, misterSaveData.misterArrayBuffer);
    */
  }

  static createFromMisterData(misterArrayBuffer) {
    // The file can be either just internal backup memory,
    // or internal backup memory concatenated with cart backup memory

    let internalArrayBuffer = misterArrayBuffer.slice(0, MISTER_INTERNAL_SAVE_SIZE);
    let cartArrayBuffer = GenesisUtil.byteExpand(SegaSaturnSaveData.createEmptySave(SegaSaturnSaveData.CARTRIDGE_BLOCK_SIZE), MISTER_PADDING_VALUE);

    if (misterArrayBuffer.byteLength === (MISTER_INTERNAL_SAVE_SIZE + MISTER_CARTRIDGE_SAVE_SIZE)) {
      cartArrayBuffer = misterArrayBuffer.slice(MISTER_INTERNAL_SAVE_SIZE, MISTER_INTERNAL_SAVE_SIZE + MISTER_CARTRIDGE_SAVE_SIZE);
    }

    if (!GenesisUtil.isByteExpanded(internalArrayBuffer.slice(MISTER_GARBAGE_LENGTH)) || !GenesisUtil.isByteExpanded(cartArrayBuffer)) {
      throw new Error('This does not appear to be a MiSTer Sega Saturn save file: it is not byte expanded');
    }

    internalArrayBuffer = GenesisUtil.byteCollapse(internalArrayBuffer);
    cartArrayBuffer = GenesisUtil.byteCollapse(cartArrayBuffer);

    if (!SegaSaturnSaveData.isCorrectlyFormatted(internalArrayBuffer) || !SegaSaturnSaveData.isCorrectlyFormatted(cartArrayBuffer)) {
      throw new Error('This does not appear to be a MiSTer Sega Saturn save file');
    }

    return new MisterSegaSaturnSaveData(internalArrayBuffer, cartArrayBuffer, misterArrayBuffer);
  }

  static createFromRawData({ rawInternalSaveArrayBuffer = null, rawCartSaveArrayBuffer = null }) {
    // We can output either a large (64kB + 1024kB) save or a small (only 64kB) save depending on
    // whether we're passed an internal save buffer and/or a ram cart save buffer.
    // There are 4 cases, depending on which combination of raw file we are passed.

    let uncompressedRawInternalSaveArrayBuffer = null;
    let uncompressedRawCartSaveArrayBuffer = null;

    if (rawInternalSaveArrayBuffer !== null) {
      uncompressedRawInternalSaveArrayBuffer = MednafenSegaSaturnSaveData.createFromSegaSaturnData(rawInternalSaveArrayBuffer).getArrayBuffer();

      if (uncompressedRawInternalSaveArrayBuffer.byteLength !== SegaSaturnSaveData.INTERNAL_SAVE_SIZE) {
        throw new Error('This does not appear to be an internal Sega Saturn save file');
      }
    }

    if (rawCartSaveArrayBuffer !== null) {
      uncompressedRawCartSaveArrayBuffer = MednafenSegaSaturnSaveData.createFromSegaSaturnData(rawCartSaveArrayBuffer).getArrayBuffer();

      if (uncompressedRawCartSaveArrayBuffer.byteLength !== SegaSaturnSaveData.CARTRIDGE_SAVE_SIZE) {
        throw new Error('This does not appear to be a Sega Saturn cartridge save file');
      }
    }

    // Now that we've got our pieces resized and ready, we can see what we've got and figure out
    // whether to create a small or large mister file

    const emptyInternalSaveBuffer = SegaSaturnSaveData.createEmptySave(SegaSaturnSaveData.INTERNAL_BLOCK_SIZE);
    const emptyCartSaveBuffer = SegaSaturnSaveData.createEmptySave(SegaSaturnSaveData.CARTRIDGE_BLOCK_SIZE);

    if (uncompressedRawInternalSaveArrayBuffer !== null) {
      if (uncompressedRawCartSaveArrayBuffer !== null) {
        // We have both pieces, so we're creating a large mister file
        return new MisterSegaSaturnSaveData(
          uncompressedRawInternalSaveArrayBuffer,
          uncompressedRawCartSaveArrayBuffer,
          GenesisUtil.byteExpand(Util.concatArrayBuffers([uncompressedRawInternalSaveArrayBuffer, uncompressedRawCartSaveArrayBuffer]), MISTER_PADDING_VALUE),
        );
      }

      // We have the internal save data but not the ram cart save data, so create a small mister file
      return new MisterSegaSaturnSaveData(
        uncompressedRawInternalSaveArrayBuffer,
        emptyCartSaveBuffer,
        GenesisUtil.byteExpand(uncompressedRawInternalSaveArrayBuffer, MISTER_PADDING_VALUE),
      );
    }

    // We don't have an internal save buffer
    if (uncompressedRawCartSaveArrayBuffer !== null) {
      // We have only the ram cart data, so create a large mister file
      return new MisterSegaSaturnSaveData(
        emptyInternalSaveBuffer,
        uncompressedRawCartSaveArrayBuffer,
        GenesisUtil.byteExpand(Util.concatArrayBuffers([emptyInternalSaveBuffer, uncompressedRawCartSaveArrayBuffer]), MISTER_PADDING_VALUE),
      );
    }

    // We were given neither an internal nor a ram cart save buffer, so return a small mister file
    return new MisterSegaSaturnSaveData(
      emptyInternalSaveBuffer,
      emptyCartSaveBuffer,
      GenesisUtil.byteExpand(emptyInternalSaveBuffer, MISTER_PADDING_VALUE),
    );
  }

  // This constructor creates a new object from a binary representation of a MiSTer save data file
  constructor(rawInternalSaveArrayBuffer, rawCartSaveArrayBuffer, misterArrayBuffer) {
    this.rawInternalSaveArrayBuffer = rawInternalSaveArrayBuffer;
    this.rawCartSaveArrayBuffer = rawCartSaveArrayBuffer;
    this.misterArrayBuffer = misterArrayBuffer;
  }

  getRawArrayBuffer(index = MisterSegaSaturnSaveData.INTERNAL_MEMORY) {
    switch (index) {
      case MisterSegaSaturnSaveData.INTERNAL_MEMORY:
        return this.rawInternalSaveArrayBuffer;

      case MisterSegaSaturnSaveData.RAM_CART:
        return this.rawCartSaveArrayBuffer;

      default:
        throw new Error(`Unknown index: ${index}`);
    }
  }

  getMisterArrayBuffer() {
    return this.misterArrayBuffer;
  }
}
