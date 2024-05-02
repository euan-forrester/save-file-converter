/*
Base class for converting from save states for online emulators. Handles resizing multiple times without accidentally losing data
*/

import SaveFilesUtil from '../../../util/SaveFiles';

export default class EmulatorBase {
  static createFromSaveStateData(emulatorSaveStateArrayBuffer, saveSize, clazz) {
    // Note that saveSize may be undefined if we're converting from a platform that doesn't require it (e.g. snes9x).
    // So below we pass in rawArrayBuffer.byteLength as the original save size instead of relying on saveSize

    const rawArrayBuffer = clazz.getRawArrayBufferFromSaveStateArrayBuffer(emulatorSaveStateArrayBuffer, saveSize);

    return new clazz(emulatorSaveStateArrayBuffer, rawArrayBuffer, rawArrayBuffer.byteLength); // eslint-disable-line new-cap
  }

  static createWithNewSize(emulatorSaveStateData, newSize, clazz) {
    // The user's emulator etc may require a different file size than the "true" size.
    // We need to make sure that if the user resizes multiple times they don't lose data.
    const originalRawArrayBuffer = clazz.getRawArrayBufferFromSaveStateArrayBuffer(emulatorSaveStateData.getEmulatorSaveStateArrayBuffer(), emulatorSaveStateData.getOriginalSaveSize());
    const newRawSaveData = SaveFilesUtil.resizeRawSave(originalRawArrayBuffer, newSize);

    return new clazz(emulatorSaveStateData.getEmulatorSaveStateArrayBuffer(), newRawSaveData, emulatorSaveStateData.getOriginalSaveSize()); // eslint-disable-line new-cap
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
