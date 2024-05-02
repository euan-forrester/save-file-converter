/*
SNES9x save states appear to store the game's SRAM data after the magic "SRA:<size>:"
*/

import EmulatorBase from './EmulatorBase';
import Util from '../../../util/util';

const MAGIC = 'SRA:'; // Magic begins with this string
const SIZE_END_MAGIC = ':'; // Then we have the size of the SRAM data in bytes, which is terminated with this string
const MAGIC_ENCODING = 'US-ASCII';

export default class Snes9xSaveStateData extends EmulatorBase {
  static getRawArrayBufferFromSaveStateArrayBuffer(emulatorSaveStateArrayBuffer) {
    try {
      const magicOffset = Util.findMagic(emulatorSaveStateArrayBuffer, MAGIC, MAGIC_ENCODING);
      const sizeBeginOffset = magicOffset + MAGIC.length;
      const sizeEndOffset = Util.findMagic(emulatorSaveStateArrayBuffer, SIZE_END_MAGIC, MAGIC_ENCODING, sizeBeginOffset);

      const magicSizeDecoder = new TextDecoder(MAGIC_ENCODING);
      const saveSizeString = magicSizeDecoder.decode(emulatorSaveStateArrayBuffer.slice(sizeBeginOffset, sizeEndOffset));
      const saveSize = parseInt(saveSizeString, 10);

      const rawSaveBeginOffset = sizeEndOffset + SIZE_END_MAGIC.length;
      const rawSaveEndOffset = rawSaveBeginOffset + saveSize;

      return emulatorSaveStateArrayBuffer.slice(rawSaveBeginOffset, rawSaveEndOffset);
    } catch (e) {
      throw new Error('This does not appear to be a SNES9x save state file', e);
    }
  }

  static createFromSaveStateData(emulatorSaveStateArrayBuffer) {
    return super.createFromSaveStateData(emulatorSaveStateArrayBuffer, undefined, Snes9xSaveStateData);
  }

  static createWithNewSize(emulatorSaveStateData, newSize) {
    return super.createWithNewSize(emulatorSaveStateData, newSize, Snes9xSaveStateData);
  }

  static getRawFileExtension() {
    return 'sav';
  }

  static adjustOutputSizesPlatform() {
    return 'snes';
  }

  static fileSizeIsRequiredToConvert() {
    return false;
  }
}
