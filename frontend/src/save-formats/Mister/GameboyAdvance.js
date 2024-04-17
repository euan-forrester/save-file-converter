/*
MiSTer GBA files are the same as emulator files with 2 exceptions:

- 512B EEPROM files must be padded out to 8192B, otherwise the core does not recognize them. This is because the core is unable to determine the EEPROM size from the ROM
- MiSTer GBA files may have RTC data appended to the end, which will be ignored by emulators so we can remove it

More information is here: https://misterfpga.org/viewtopic.php?t=2040

When going from a raw 8192B EEPROM save, we can't automatically truncate it for the MiSTer because we don't know whether it should be 512B or 8192B.
I think most emulators will accept either size, but regardless the user is able to select to truncate it in the interface.
*/

import SaveFilesUtil from '../../util/SaveFiles';
import PaddingUtil from '../../util/Padding';
import MathUtil from '../../util/Math';

const MISTER_MINIMUM_FILE_SIZE = 8192;
const MISTER_PADDING_VALUE = 0x00; // It doesn't matter what we use here: the core doesn't clear the data from the previous game, so it gets left uninitialized

export default class MisterGameboyAdvanceSaveData {
  static getMisterFileExtension() {
    return 'sav';
  }

  static getRawFileExtension() {
    return 'srm';
  }

  static adjustOutputSizesPlatform() {
    return 'gba';
  }

  static createWithNewSize(misterSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(misterSaveData.getRawArrayBuffer(), newSize);

    return MisterGameboyAdvanceSaveData.createFromRawData(newRawSaveData);
  }

  static createFromMisterData(misterArrayBuffer) {
    // Check if we have any RTC data appended
    let rawArrayBuffer = misterArrayBuffer;
    const hasRtcData = !MathUtil.isPowerOf2(misterArrayBuffer.byteLength);

    if (hasRtcData) {
      rawArrayBuffer = PaddingUtil.removePaddingFromEnd(misterArrayBuffer, misterArrayBuffer.byteLength - MathUtil.getNextSmallestPowerOf2(misterArrayBuffer.byteLength));
    }

    return new MisterGameboyAdvanceSaveData(rawArrayBuffer, misterArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    return new MisterGameboyAdvanceSaveData(rawArrayBuffer, PaddingUtil.padAtEndToMinimumSize(rawArrayBuffer, MISTER_PADDING_VALUE, MISTER_MINIMUM_FILE_SIZE));
  }

  // This constructor creates a new object from a binary representation of a MiSTer save data file
  constructor(rawArrayBuffer, misterArrayBuffer) {
    this.rawArrayBuffer = rawArrayBuffer;
    this.misterArrayBuffer = misterArrayBuffer;
  }

  getRawArrayBuffer() {
    return this.rawArrayBuffer;
  }

  getMisterArrayBuffer() {
    return this.misterArrayBuffer;
  }
}
