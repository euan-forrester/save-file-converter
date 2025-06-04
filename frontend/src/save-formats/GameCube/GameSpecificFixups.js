/* eslint-disable no-bitwise */

/*
There are various games for the GameCube where the save data depends on specifics from the memory card
(usually the serial number), and so moving the save to a different card (or the same card with a different format time)
will result in the game thinking the save is corrupted
*/

import GameCubeBasics from './Components/Basics';

import FZeroGxFixups from './GameSpecificFixups/FZeroGx';
import PhantasyStarOnlineFixups from './GameSpecificFixups/PhantasyStarOnline';

const { LITTLE_ENDIAN } = GameCubeBasics;

const FIXUP_CLASSES = [
  FZeroGxFixups,
  PhantasyStarOnlineFixups,
];

const HEADER_SERIAL_DATA_LENGTH = 32;

// Taken from https://github.com/dolphin-emu/dolphin/blob/master/Source/Core/Core/HW/GCMemcard/GCMemcard.cpp#L1249
// and https://github.com/bodgit/gc/blob/main/header.go#L64
// It's a bit confusing that both Dolphin and the gc library above refer to these checksums as "serials", which is
// also the name they give the first 12 bytes of the header.
function calculateHeaderSerials(headerBlock) {
  const headerBlockDataView = new DataView(headerBlock);

  let serial1 = 0;
  let serial2 = 0;

  for (let currentOffset = 0; currentOffset < HEADER_SERIAL_DATA_LENGTH; currentOffset += 8) {
    serial1 = (serial1 ^ headerBlockDataView.getUint32(currentOffset + 0, LITTLE_ENDIAN)) & 0xFFFFFFFF;
    serial2 = (serial2 ^ headerBlockDataView.getUint32(currentOffset + 4, LITTLE_ENDIAN)) & 0xFFFFFFFF;
  }

  return { serial1, serial2 };
}

export default class GameSpecificFixups {
  static fixupSaveFile(saveFile, headerBlock) {
    // All of the games so far want the same checksums from the card header
    const headerSerials = calculateHeaderSerials(headerBlock);

    let fixedSaveFile = saveFile;

    FIXUP_CLASSES.forEach((fixupClass) => { fixedSaveFile = fixupClass.fixupSaveFile(fixedSaveFile, headerSerials); });

    return fixedSaveFile;
  }
}
