/*
I'm not 100% sure which emulator GBA games use.

It may be the VBA-next emulator: https://github.com/libretro/vba-next/blob/master/src/gba.cpp#L8820

It matches having the ROM internal name at the start of the file, and having the different types of save data at consistent offsets.

My tenuous belief that it's VBA-next comes from this: https://github.com/liriliri/luna/blob/master/src/retro-emulator/story.js#L20

And my tenuous belief that that package is relevant is because the sites I looked at seem to get their emulation from retroemulator[.]com (which in turn appears to get its ROMs from playroms[.]net)

In-game save data offsets
=========================

These found by creating the same save file in both the online emulator and a standalone emulator, then searching the online emulator file for the save data

512B EEPROM: 0x91000 (the first 512B of EEPROM data are also written at 0x90DEC so that offset could be used too for 512B saves. See VBA-Next source code)
8kB EEPROM: 0x91000
32kB SRAM: 0x93010
64kB Flash RAM: 0x93010
128kB Flash RAM: 0x93010
*/

import EmulatorBase from './EmulatorBase';

const EEPROM_OFFSET = 0x91000;
const SRAM_OFFSET = 0x93010;
const FLASH_RAM_OFFSET = 0x93010;

const SAVE_OFFSET = {
  512: EEPROM_OFFSET,
  8192: EEPROM_OFFSET,
  32768: SRAM_OFFSET,
  65536: FLASH_RAM_OFFSET,
  131072: FLASH_RAM_OFFSET,
};

export default class VbaNextSaveStateData extends EmulatorBase {
  static getRawArrayBufferFromSaveStateArrayBuffer(emulatorSaveStateArrayBuffer, saveSize) {
    if (!(saveSize in SAVE_OFFSET)) {
      throw new Error(`${saveSize} is not a valid save size for a GBA game`);
    }

    const rawSaveOffset = SAVE_OFFSET[saveSize];

    if ((rawSaveOffset + saveSize) > emulatorSaveStateArrayBuffer.byteLength) {
      throw new Error('This does not appear to be a VBA-Next save state file');
    }

    return emulatorSaveStateArrayBuffer.slice(rawSaveOffset, rawSaveOffset + saveSize);
  }

  static createFromSaveStateData(emulatorSaveStateArrayBuffer, saveSize) {
    return super.createFromSaveStateData(emulatorSaveStateArrayBuffer, saveSize, VbaNextSaveStateData);
  }

  static createWithNewSize(emulatorSaveStateData, newSize) {
    return super.createWithNewSize(emulatorSaveStateData, newSize, VbaNextSaveStateData);
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
