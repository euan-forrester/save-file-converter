/* eslint-disable no-bitwise */

/*
The standard format for individual saves on the GameCube appears to be the .GCI format.

It's a directory entry concatenated with the raw save data

Note that the starting block number in the directory entry is irrelevant here because the save will not be put back where it was:
https://github.com/suloku/gcmm/blob/95c737c2af0ebecfa2ef02a8c6c30496d0036e87/source/mcard.c#L225

0x00-0x3F: Directory entry
0x40-????: Game data (including the comment and icons)
*/

import GameCubeDirectoryEntry from './Components/DirectoryEntry';

const DATA_OFFSET = GameCubeDirectoryEntry.LENGTH;

export default class GameCubeGciSaveData {
  static convertSaveFilesToGcis(saveFiles) {
    return saveFiles.map((saveFile) => {
      console.log('Dude');
      return saveFile.blah;
    });
  }

  static convertGcisToSaveFiles(arrayBuffers) {
    return arrayBuffers.map((arrayBuffer) => {
      const directoryEntry = GameCubeDirectoryEntry.readDirectoryEntry(arrayBuffer);
      const rawData = arrayBuffer.slice(DATA_OFFSET);

      return {
        ...directoryEntry,
        rawData,
      };
    });
  }
}
