/*
There are various emulators for the Saturn, some of which use slightly different save file formats.
Since everywhere on the site we tell people that "emulator/raw" format is the lingua franca, we need to
be able to read/write any emulator format for the Saturn transparently
*/

import MednafenSegaSaturnSaveData from './Emulators/mednafen';

const EMULATOR_CLASSES = [
  MednafenSegaSaturnSaveData,
];

export default class EmulatorSegaSaturnSaveData {
  static createWithNewSize(segaSaturnSaveData, newSize) {
    for (let i = 0; i < EMULATOR_CLASSES.length; i += 1) {
      try {
        return EMULATOR_CLASSES[i].createWithNewSize(segaSaturnSaveData, newSize);
      } catch (e) {
        // Try the next one
      }
    }

    throw new Error('This file does not appear to contain Sega Saturn emulator save data');
  }

  static createFromSegaSaturnData(arrayBuffer) {
    for (let i = 0; i < EMULATOR_CLASSES.length; i += 1) {
      try {
        return EMULATOR_CLASSES[i].createFromSegaSaturnData(arrayBuffer);
      } catch (e) {
        // Try the next one
      }
    }

    throw new Error('This file does not appear to contain Sega Saturn emulator save data');
  }

  static createFromSaveFiles(saveFiles, blockSize) {
    for (let i = 0; i < EMULATOR_CLASSES.length; i += 1) {
      try {
        return EMULATOR_CLASSES[i].createFromSaveFiles(saveFiles, blockSize);
      } catch (e) {
        // Try the next one
      }
    }

    throw new Error('This file does not appear to contain Sega Saturn emulator save data');
  }
}
