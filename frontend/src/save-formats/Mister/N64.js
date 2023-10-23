/*
N64 saves on MiSTer can either include cart data, or controller pak data, or both.

The optional cart save portion comes first in the file, and it is the same endianness as PC emulators.

After that, there is an optional section where there are 4 mempack blocks appended to the file

If there is no cart save, then the file is just the 4 mempack blocks.

In most cases we can tell what the file contains by checking its size: 0x20000 bytes total for the optional 4 mempack saves, plus whatever the cart size is.

However the file size of a Flash RAM save is the same as a save that's just the 4 mempacks. We can attempt to disambiguate by trying to parse the mempack blocks.
A file that is all empty (e.g. all 0x00s) is impossible to disambiguate. Bad luck may also result in a Flash RAM file that accidentally parses as mempack blocks
*/

import N64Util from '../../util/N64';
import N64MempackSaveData from '../N64/Mempack';
import SaveFilesUtil from '../../util/SaveFiles';

const NUM_MEMPACKS = 4; // All 4 potential controller paks can be stored in a MiSTer save file
const ALL_MEMPACK_SIZE = N64MempackSaveData.TOTAL_SIZE * NUM_MEMPACKS;
const MEMPACK_DATA_INDEX_PREFIX = 'mempack-data';

function allBytesAreEqual(arrayBuffer, value) {
  const uint8Array = new Uint8Array(arrayBuffer);
  const count = uint8Array.reduce((accumulator, i) => ((i === value) ? accumulator + 1 : accumulator), 0);

  return (count === arrayBuffer.byteLength);
}

function getAllMempackDataIndexes() {
  return [...Array(NUM_MEMPACKS).keys()];
}

function splitAllMempackDatas(arrayBuffer) {
  return getAllMempackDataIndexes().map((i) => arrayBuffer.slice(i * N64MempackSaveData.TOTAL_SIZE, (i + 1) * N64MempackSaveData.TOTAL_SIZE));
}

function allMempackDataIsValid(arrayBuffer) {
  const mempackData = splitAllMempackDatas(arrayBuffer);
  let valid = true;

  try {
    mempackData.forEach((i) => N64MempackSaveData.createFromN64MempackData(i));
  } catch (e) {
    valid = false;
  }

  return valid;
}

export default class MisterN64SaveData {
  static CART_DATA = 'cart-data';

  static MEMPACK_DATA = getAllMempackDataIndexes().map((i) => `${MEMPACK_DATA_INDEX_PREFIX}-${i}`);

  static getMisterFileExtension() {
    return 'sav';
  }

  static getRawFileExtension(rawArrayBuffer) {
    return N64Util.getFileExtension(rawArrayBuffer);
  }

  static adjustOutputSizesPlatform() {
    return 'n64';
  }

  static createWithNewSize(misterSaveData, newSize) {
    const newRawCartSaveData = SaveFilesUtil.resizeRawSave(misterSaveData.getRawArrayBuffer(MisterN64SaveData.CART_DATA), newSize);

    // FIXME: Need to decide whether to have this return null if there's no mempack data, or an array of all nulls, or what

    const rawMempackSaveDatas = getAllMempackDataIndexes().map((i) => misterSaveData.getRawArrayBuffer(MisterN64SaveData.MEMPACK_DATA[i]));

    return MisterN64SaveData.createFromRawData(newRawCartSaveData, rawMempackSaveDatas);
  }

  static createFromMisterData(misterArrayBuffer) {
    let cartData = null;
    let allMempackData = null;

    // We're going to use the file size to determine what data is stored in the file. It could be cart data only, controller pak
    // data only, or both

    // The wrinkle is that a Flash RAM cart save, and controller pak data, are exactly the same size. So we need to disambiguate
    // between them. To do that, we'll try parsing the data as controller pak data. There's various checks in that parsing that will
    // likely fail for the random data that we would encounter if it was a Flash RAM save instead. There's always a chance of bad
    // luck here -- a Flash RAM save that happens to parse as controller pak data -- but this is very unlikely and there's a limited
    // number of Flash RAM games, which makes this even more unlikely

    if (misterArrayBuffer.byteLength < ALL_MEMPACK_SIZE) {
      // Here we just have cart data only
      cartData = misterArrayBuffer;
    } else if (misterArrayBuffer.byteLength > ALL_MEMPACK_SIZE) {
      // Here we have both cart data and controller pak data
      cartData = misterArrayBuffer.slice(0, ALL_MEMPACK_SIZE - misterArrayBuffer.byteLength);
      allMempackData = misterArrayBuffer.slice(ALL_MEMPACK_SIZE - misterArrayBuffer.byteLength);
    } else if (allBytesAreEqual(misterArrayBuffer, 0x00)) {
      // If the size is the same as either a Flash RAM save with no controller pak data, or no cart save and just controller pak data,
      // and data is all zeros, then it would parse correctly as controller pak data so it's ambiguous whether it represents
      // cart data or controller pak data and we'll report that we have both
      cartData = misterArrayBuffer;
      allMempackData = misterArrayBuffer;
    } else if (allMempackDataIsValid(misterArrayBuffer)) {
      // Here there is some non-zero data but the size indicated that it could be either a Flash RAM save with no controller pak data,
      // or no cart save and just controller pak data. So, we will try to parse it as controller pak data to determine which it is
      allMempackData = misterArrayBuffer;
    } else {
      cartData = misterArrayBuffer;
    }

    if ((cartData !== null) && !N64Util.isValidSize(cartData)) {
      throw new Error('This MiSTer N64 file does not appear to contain valid cart data');
    }

    if ((allMempackData !== null) && !allMempackDataIsValid(allMempackData)) {
      throw new Error('This MiSTer N64 file does not appear to contain valid mempack data');
    }

    const allMempackArrayBuffers = (allMempackData !== null) ? splitAllMempackDatas(allMempackData) : null;

    return new MisterN64SaveData(cartData, allMempackArrayBuffers, misterArrayBuffer);
  }

  static createFromRawData(rawCartArrayBuffer, rawMempackArrayBuffers = null) {
    // FIXME: Gotta concatenate everything together
    return new MisterN64SaveData(rawCartArrayBuffer, rawMempackArrayBuffers, rawCartArrayBuffer);
  }

  // This constructor creates a new object from a binary representation of a MiSTer save data file
  constructor(rawCartArrayBuffer, rawMempackArrayBuffers, misterArrayBuffer) {
    this.rawCartArrayBuffer = rawCartArrayBuffer;
    this.rawMempackArrayBuffers = rawMempackArrayBuffers;
    this.misterArrayBuffer = misterArrayBuffer;
  }

  getRawArrayBuffer(index = MisterN64SaveData.CART_DATA) {
    if (index === MisterN64SaveData.CART_DATA) {
      return this.rawCartArrayBuffer;
    }

    if (index.beginsWith(MEMPACK_DATA_INDEX_PREFIX)) {
      const mempackIndex = parseInt(index.charAt(index.length - 1), 10);
      return this.rawMempackArrayBuffers[mempackIndex];
    }

    throw new Error(`Unknown index: ${index}`);
  }

  getMisterArrayBuffer() {
    return this.misterArrayBuffer;
  }
}