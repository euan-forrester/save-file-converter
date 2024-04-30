/*
I have no idea which emulator GB/C games use
*/

import SaveFilesUtil from '../../../util/SaveFiles';

const SRAM_OFFSET = 0x72D; // GB, GBC, and dual-compatibility games all appear to have their SRAM at this offset (despite having different file lengths for their save states)

function getRawArrayBufferFromSaveStateArrayBuffer(emulatorSaveStateArrayBuffer, saveSize) {
  if ((SRAM_OFFSET + saveSize) > emulatorSaveStateArrayBuffer.byteLength) {
    throw new Error('This does not appear to be a Gameboy save state file');
  }

  return emulatorSaveStateArrayBuffer.slice(SRAM_OFFSET, SRAM_OFFSET + saveSize);
}

export default class GbSaveStateData {
  static createFromSaveStateData(emulatorSaveStateArrayBuffer, saveSize) {
    const rawArrayBuffer = getRawArrayBufferFromSaveStateArrayBuffer(emulatorSaveStateArrayBuffer, saveSize);

    return new GbSaveStateData(emulatorSaveStateArrayBuffer, rawArrayBuffer, saveSize);
  }

  static createWithNewSize(emulatorSaveStateData, newSize) {
    // The user's emulator etc may require a different file size than the "true" size.
    // We need to make sure that if the user resizes multiple times they don't lose data.
    const originalRawArrayBuffer = getRawArrayBufferFromSaveStateArrayBuffer(emulatorSaveStateData.getEmulatorSaveStateArrayBuffer(), emulatorSaveStateData.getOriginalSaveSize());
    const newRawSaveData = SaveFilesUtil.resizeRawSave(originalRawArrayBuffer, newSize);

    return new GbSaveStateData(emulatorSaveStateData.getEmulatorSaveStateArrayBuffer(), newRawSaveData, emulatorSaveStateData.getOriginalSaveSize());
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

  constructor(emulatorSaveStateArrayBuffer, rawArrayBuffer, saveSize) {
    this.emulatorSaveStateArrayBuffer = emulatorSaveStateArrayBuffer;
    this.rawArrayBuffer = rawArrayBuffer;
    this.originalSaveSize = saveSize;
  }

  getRawArrayBuffer() {
    return this.rawArrayBuffer;
  }

  getEmulatorSaveStateArrayBuffer() {
    return this.emulatorSaveStateArrayBuffer;
  }

  getOriginalSaveSize() {
    return this.originalSaveSize;
  }
}
