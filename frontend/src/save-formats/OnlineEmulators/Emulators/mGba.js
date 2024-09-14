/*
I'm not 100% sure which emulator GBA games in emulator.js use.

It may be the mGBA emulator: https://github.com/EmulatorJS/EmulatorJS/blob/0bf944370c020f9877ca6701081a1963e160b8b0/data/src/emulator.js#L26

And my tenuous belief that that package is relevant is because one site I looked at (www[.]retrogames[.]onl) mentions emulator.js if you dig deeply enough on the page of one of their games

Save data size in bytes is stored at offset 0x61004
Save data itself begins at 0x61030
*/

import EmulatorBase from './EmulatorBase';
import PlatformSaveSizes from '../../PlatformSaveSizes';

const LITTLE_ENDIAN = true;

const SAVE_SIZE_OFFSET = 0x61004;
const SAVE_OFFSET = 0x61030;

export default class MGbaSaveStateData extends EmulatorBase {
  static getRawArrayBufferFromSaveStateArrayBuffer(emulatorSaveStateArrayBuffer) {
    if (SAVE_OFFSET > emulatorSaveStateArrayBuffer.byteLength) {
      throw new Error('This does not appear to be an mGBA save state file: file is too short');
    }

    const emulatorSaveStateDataView = new DataView(emulatorSaveStateArrayBuffer);

    const saveSize = emulatorSaveStateDataView.getUint32(SAVE_SIZE_OFFSET, LITTLE_ENDIAN);

    if (PlatformSaveSizes.gba.indexOf(saveSize) < 0) {
      throw new Error(`This does not appear to be an mGBA save state file: ${saveSize} is not a valid GBA save file size`);
    }

    return emulatorSaveStateArrayBuffer.slice(SAVE_OFFSET, SAVE_OFFSET + saveSize);
  }

  static createFromSaveStateData(emulatorSaveStateArrayBuffer, saveSize) {
    return super.createFromSaveStateData(emulatorSaveStateArrayBuffer, saveSize, MGbaSaveStateData);
  }

  static createWithNewSize(emulatorSaveStateData, newSize) {
    return super.createWithNewSize(emulatorSaveStateData, newSize, MGbaSaveStateData);
  }

  static getRawFileExtension() {
    return 'sav';
  }

  static adjustOutputSizesPlatform() {
    return 'gba';
  }

  static fileSizeIsRequiredToConvert() {
    return false;
  }
}
