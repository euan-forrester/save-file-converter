/*
I'm not 100% sure which emulator GB games in emulator.js use.

It may be the Gambatte emulator: https://github.com/EmulatorJS/EmulatorJS/blob/0bf944370c020f9877ca6701081a1963e160b8b0/data/src/emulator.js#L14

And my tenuous belief that that package is relevant is because one site I looked at (www[.]retrogames[.]onl) mentions emulator.js if you dig deeply enough on the page of one of their games

Magic 'sram' is at offset 0x747
Save data size in bytes is stored at offset 0x74B
Save data itself begins at 0x74F
*/

import EmulatorBase from './EmulatorBase';
import PlatformSaveSizes from '../../PlatformSaveSizes';
import Util from '../../../util/util';

const LITTLE_ENDIAN = false;

const MAGIC = 'sram';
const MAGIC_OFFSET = 0x747;
const MAGIC_ENCODING = 'US-ASCII';

const SAVE_SIZE_OFFSET = 0x74B;
const SAVE_OFFSET = 0x74F;

export default class GambatteSaveStateData extends EmulatorBase {
  static getRawArrayBufferFromSaveStateArrayBuffer(emulatorSaveStateArrayBuffer) {
    if (SAVE_OFFSET > emulatorSaveStateArrayBuffer.byteLength) {
      throw new Error('This does not appear to be an Gambatte save state file: file is too short');
    }

    Util.checkMagic(emulatorSaveStateArrayBuffer, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);

    const emulatorSaveStateDataView = new DataView(emulatorSaveStateArrayBuffer);

    const saveSize = emulatorSaveStateDataView.getUint32(SAVE_SIZE_OFFSET, LITTLE_ENDIAN);

    if (PlatformSaveSizes.gb.indexOf(saveSize) < 0) {
      throw new Error(`This does not appear to be an Gambatte save state file: ${saveSize} is not a valid Gameboy save file size`);
    }

    return emulatorSaveStateArrayBuffer.slice(SAVE_OFFSET, SAVE_OFFSET + saveSize);
  }

  static createFromSaveStateData(emulatorSaveStateArrayBuffer, saveSize) {
    return super.createFromSaveStateData(emulatorSaveStateArrayBuffer, saveSize, GambatteSaveStateData);
  }

  static createWithNewSize(emulatorSaveStateData, newSize) {
    return super.createWithNewSize(emulatorSaveStateData, newSize, GambatteSaveStateData);
  }

  static getRawFileExtension() {
    return 'sav';
  }

  static adjustOutputSizesPlatform() {
    return 'gb';
  }

  static fileSizeIsRequiredToConvert() {
    return false;
  }
}
