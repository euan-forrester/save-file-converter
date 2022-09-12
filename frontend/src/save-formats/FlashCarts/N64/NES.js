// Some N64 flash carts support an NES core that runs on the FPGA, as opposed to the Neon64 emulator supported by others
// It seems that by default on an Everdrive 64 X7, it saves out 128kB save files, of which the first 8kB (or whatever) is the actual
// SRAM data, and the rest is padded with 0xAA. This can be changed in the Everdrive menu, under ROM Info for a particular ROM.
//
// The core is able to read in a "regualar" 8kB file, and then it rewrites it as 128kB again padded with 0xAA
//
// The emulator I tried was able to read in the 128kB file and ignore everything beyond the necessary first 8kB.

import SaveFilesUtil from '../../../util/SaveFiles';
import Util from '../../../util/util';

const PADDED_SIZE = 131072;
const PADDING_VALUE = 0xAA;

export default class N64NesFlashCartSaveData {
  static createFromFlashCartData(flashCartArrayBuffer) {
    return new N64NesFlashCartSaveData(flashCartArrayBuffer, flashCartArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    if (rawArrayBuffer.byteLength <= PADDED_SIZE) {
      const paddingArrayBuffer = Util.getFilledArrayBuffer(PADDED_SIZE - rawArrayBuffer.byteLength, PADDING_VALUE);
      const flashCartArrayBuffer = Util.concatArrayBuffers([rawArrayBuffer, paddingArrayBuffer]);

      return new N64NesFlashCartSaveData(flashCartArrayBuffer, flashCartArrayBuffer); // Pass the new array buffer as both raw and flash cart, because in the UI we want the size to show up as 128kB to prevent confusion and that size is read from the raw array buffer
    }

    return N64NesFlashCartSaveData(rawArrayBuffer, rawArrayBuffer);
  }

  static createWithNewSize(flashCartSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(flashCartSaveData.getRawArrayBuffer(), newSize);

    return N64NesFlashCartSaveData.createFromRawData(newRawSaveData);
  }

  static getFlashCartFileExtension() {
    return 'srm';
  }

  static getRawFileExtension() {
    return null; // NES saves have many possible extensions, and we just want to keep whatever the original extension was
  }

  static requiresRomClass() {
    return null;
  }

  static adjustOutputSizesPlatform() {
    return 'nes';
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
