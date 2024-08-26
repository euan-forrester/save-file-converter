/*
I'm not 100% sure which emulator GBA game in emulator.js use.

It may be the mGBA emulator: https://github.com/EmulatorJS/EmulatorJS/blob/0bf944370c020f9877ca6701081a1963e160b8b0/data/src/emulator.js#L26

And my tenuous belief that that package is relevant is because one site I looked at (www[.]retrogames[.]onl) mentions emulator.js if you dig deeply enough on the page of one of their games

In-game save data offsets
=========================

These found by creating the same save file in both the online emulator and a standalone emulator, then searching the online emulator file for the save data

512B EEPROM: 0x91000
8kB EEPROM: 0x61030
32kB SRAM: 0x93010
64kB Flash RAM: 0x93010
128kB Flash RAM: 0x93010
*/

import EmulatorBase from './EmulatorBase';

const EEPROM_OFFSET = 0x61030;
const SRAM_OFFSET = 0x93010;
const FLASH_RAM_OFFSET = 0x93010;

const SAVE_OFFSET = {
  512: EEPROM_OFFSET,
  8192: EEPROM_OFFSET,
  32768: SRAM_OFFSET,
  65536: FLASH_RAM_OFFSET,
  131072: FLASH_RAM_OFFSET,
};

export default class MGbaSaveStateData extends EmulatorBase {
  static getRawArrayBufferFromSaveStateArrayBuffer(emulatorSaveStateArrayBuffer, saveSize) {
    if (!(saveSize in SAVE_OFFSET)) {
      throw new Error(`${saveSize} is not a valid save size for a GBA game`);
    }

    const rawSaveOffset = SAVE_OFFSET[saveSize];

    if ((rawSaveOffset + saveSize) > emulatorSaveStateArrayBuffer.byteLength) {
      throw new Error('This does not appear to be a mGBA save state file');
    }

    return emulatorSaveStateArrayBuffer.slice(rawSaveOffset, rawSaveOffset + saveSize);
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
    return true;
  }
}
