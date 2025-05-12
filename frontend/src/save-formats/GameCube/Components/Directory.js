/* eslint-disable no-bitwise */

/*
The directory entry format is reused in a few different gamecube file type

Here's the structure as assembled from reading
- https://github.com/dolphin-emu/dolphin/blob/ee27f03a4387baca6371a06068274135ff9547a5/Source/Core/Core/HW/GCMemcard/GCMemcard.h#L316
- https://www.gc-forever.com/yagcd/chap12.html#sec12.3

Note that an invalid or empty directory entry is all 0xFF. So dolphin checks for the first 4 bytes of it (the game code):
https://github.com/dolphin-emu/dolphin/blob/c9bdda63dc624995406c37f4e29e3b8c4696e6d0/Source/Core/Core/HW/GCMemcard/GCMemcard.cpp#L788

0x0000-0x1FBF: Directory entries (max 127)
0x1FC0-0x1FF9: padding (0xFF)
0x1FFA-0x1FFB: Update counter
0x1FFC-0x1FFD: Additive checksum
0x1FFE-0x1FFF: Inverse checksum
*/

import ArrayUtil from '../../../util/Array';

import GameCubeUtil from '../Util';

import GameCubeBasics from './Basics';
import GameCubeDirectoryEntry from './DirectoryEntry';

const {
  LITTLE_ENDIAN,
} = GameCubeBasics;

const MAX_DIRECTORY_ENTRIES = 127;
const DIRECTORY_ENTRY_LENGTH = GameCubeDirectoryEntry.LENGTH;

const UPDATE_COUNTER_OFFSET = 0x1FFA;
const CHECKSUM_OFFSET = 0x01FFC;
const CHECKSUM_INVERSE_OFFSET = 0x01FFE;
const CHECKSUMMED_DATA_BEGIN_OFFSET = 0; // Checksummed data offset and size are taken from https://github.com/dolphin-emu/dolphin/blob/4f210df86a2d2362ef8087cf81b817b18c3d32e9/Source/Core/Core/HW/GCMemcard/GCMemcard.cpp#L1348
const CHECKSUMMED_DATA_SIZE = CHECKSUM_OFFSET - CHECKSUMMED_DATA_BEGIN_OFFSET;

export default class GameCubeDirectory {
  static writeDirectory(directoryEntries) {
    console.log('Dude');
    return directoryEntries.blah;
  }

  static readDirectory(arrayBuffer) {
    const dataView = new DataView(arrayBuffer);

    const updateCounter = dataView.getInt16(UPDATE_COUNTER_OFFSET, LITTLE_ENDIAN); // GameCube BIOS compares these as signed values: https://github.com/dolphin-emu/dolphin/blob/ee27f03a4387baca6371a06068274135ff9547a5/Source/Core/Core/HW/GCMemcard/GCMemcard.h#L325
    const checksum = dataView.getUint16(CHECKSUM_OFFSET, LITTLE_ENDIAN);
    const checksumInverse = dataView.getUint16(CHECKSUM_INVERSE_OFFSET, LITTLE_ENDIAN);

    const directoryEntries = ArrayUtil.createSequentialArray(0, MAX_DIRECTORY_ENTRIES).map((i) => {
      const directoryEntryArrayBuffer = arrayBuffer.slice(i * DIRECTORY_ENTRY_LENGTH, (i + 1) * DIRECTORY_ENTRY_LENGTH);

      return GameCubeDirectoryEntry.readDirectoryEntry(directoryEntryArrayBuffer);
    }).filter((directoryEntry) => directoryEntry !== null);

    const calculatedChecksums = GameCubeUtil.calculateChecksums(arrayBuffer, CHECKSUMMED_DATA_BEGIN_OFFSET, CHECKSUMMED_DATA_SIZE);

    if ((checksum !== calculatedChecksums.checksum) || (checksumInverse !== calculatedChecksums.checksumInverse)) {
      // The block is corrupted
      return null;
    }

    return {
      directoryEntries,
      updateCounter,
      checksum,
      checksumInverse,
    };
  }
}
