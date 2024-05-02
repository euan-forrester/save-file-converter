/*
I have no idea which emulator GB/C games use
*/

import EmulatorBase from './EmulatorBase';

const SRAM_OFFSET = 0x72D; // GB, GBC, and dual-compatibility games all appear to have their SRAM at this offset (despite having different file lengths for their save states)

export default class GbSaveStateData extends EmulatorBase {
  static getRawArrayBufferFromSaveStateArrayBuffer(emulatorSaveStateArrayBuffer, saveSize) {
    if ((SRAM_OFFSET + saveSize) > emulatorSaveStateArrayBuffer.byteLength) {
      throw new Error('This does not appear to be a Gameboy save state file');
    }

    return emulatorSaveStateArrayBuffer.slice(SRAM_OFFSET, SRAM_OFFSET + saveSize);
  }

  static createFromSaveStateData(emulatorSaveStateArrayBuffer, saveSize) {
    return super.createFromSaveStateData(emulatorSaveStateArrayBuffer, saveSize, GbSaveStateData);
  }

  static createWithNewSize(emulatorSaveStateData, newSize) {
    return super.createWithNewSize(emulatorSaveStateData, newSize, GbSaveStateData);
  }

  static getRawFileExtension() {
    return 'sav';
  }

  static adjustOutputSizesPlatform() {
    return 'gb';
  }

  static fileSizeIsRequiredToConvert() {
    return true;
  }
}
