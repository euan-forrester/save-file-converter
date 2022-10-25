/*
Swaps the endianness of N64 save data for SRAM and FlashRAM files. EEPROM files do not need to be endian swapped
*/

import N64Util from '../../../util/N64';
import SaveFilesUtil from '../../../util/SaveFiles';

const EEPROM_SIZES = [512, 2 * 1024]; // From http://micro-64.com/database/gamesave.shtml

function needsEndianSwap(arrayBuffer) {
  return (EEPROM_SIZES.indexOf(arrayBuffer.byteLength) < 0);
}

export default class N64FlashCartSaveData {
  static createFromFlashCartData(flashCartArrayBuffer) {
    const rawArrayBuffer = needsEndianSwap(flashCartArrayBuffer) ? N64Util.endianSwap(flashCartArrayBuffer, 'bigToLittleEndian') : flashCartArrayBuffer;

    return new N64FlashCartSaveData(flashCartArrayBuffer, rawArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    const flashCartArrayBuffer = needsEndianSwap(rawArrayBuffer) ? N64Util.endianSwap(rawArrayBuffer, 'littleToBigEndian') : rawArrayBuffer;

    return new N64FlashCartSaveData(flashCartArrayBuffer, rawArrayBuffer);
  }

  static createWithNewSize(n64FlashCartSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(n64FlashCartSaveData.getRawArrayBuffer(), newSize);

    return N64FlashCartSaveData.createFromRawData(newRawSaveData);
  }

  static getFlashCartFileExtension() {
    return null; // N64 saves have many possible extensions, and we just want to keep whatever the original extension was
  }

  static getRawFileExtension() {
    return null; // N64 saves have many possible extensions, and we just want to keep whatever the original extension was
  }

  static requiresRomClass() {
    return null;
  }

  static adjustOutputSizesPlatform() {
    return 'n64'; // Apparently N64 Everdrives will ignore a save that's the wrong size, and just overwrite it
  }

  constructor(flashCartArrayBuffer, rawArrayBuffer) {
    this.flashCartArrayBuffer = flashCartArrayBuffer;
    this.rawArrayBuffer = rawArrayBuffer;
  }

  getRawArrayBuffer() {
    return this.rawArrayBuffer;
  }

  getFlashCartArrayBuffer() {
    return this.flashCartArrayBuffer;
  }
}
