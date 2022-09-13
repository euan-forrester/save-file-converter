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

function padArrayBuffer(arrayBuffer, paddedSize) {
  if (arrayBuffer.byteLength <= paddedSize) {
    const paddingArrayBuffer = Util.getFilledArrayBuffer(paddedSize - arrayBuffer.byteLength, PADDING_VALUE);

    return Util.concatArrayBuffers([arrayBuffer, paddingArrayBuffer]);
  }

  return arrayBuffer;
}

export default class N64NesFlashCartSaveData {
  static createFromFlashCartData(flashCartArrayBuffer) {
    return new N64NesFlashCartSaveData(flashCartArrayBuffer, flashCartArrayBuffer, flashCartArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    const flashCartArrayBuffer = padArrayBuffer(rawArrayBuffer, PADDED_SIZE);

    return new N64NesFlashCartSaveData(flashCartArrayBuffer, flashCartArrayBuffer, rawArrayBuffer); // Pass the new array buffer as both raw and flash cart, because in the UI we want the size to show up as 128kB to prevent confusion and that size is read from the raw array buffer
  }

  static createWithNewSize(flashCartSaveData, newSize) {
    const newFlashCartArrayBuffer = SaveFilesUtil.resizeRawSave(flashCartSaveData.getOriginalRawArrayBuffer(), newSize, PADDING_VALUE);
    const newRawSaveData = SaveFilesUtil.resizeRawSave(flashCartSaveData.getOriginalRawArrayBuffer(), newSize);

    return new N64NesFlashCartSaveData(newFlashCartArrayBuffer, newRawSaveData, flashCartSaveData.getOriginalRawArrayBuffer());
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

  constructor(flashCartArrayBuffer, rawArrayBuffer, originalRawArrayBuffer) {
    this.flashCartArrayBuffer = flashCartArrayBuffer;
    this.rawArrayBuffer = rawArrayBuffer;
    this.originalRawArrayBuffer = originalRawArrayBuffer;
  }

  getRawArrayBuffer() {
    return this.rawArrayBuffer;
  }

  getOriginalRawArrayBuffer() {
    return this.originalRawArrayBuffer;
  }

  getFlashCartArrayBuffer() {
    return this.flashCartArrayBuffer;
  }
}
