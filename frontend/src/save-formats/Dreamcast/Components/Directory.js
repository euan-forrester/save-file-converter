/* eslint-disable no-bitwise */

/*
Format taken from https://mc.pp.se/dc/vms/flashmem.html

The directory is just a sequence of directory entries

A directory entry that's all 0's is empty
*/

import Util from '../../../util/util';
import ArrayUtil from '../../../util/Array';

import DreamcastBasics from './Basics';
import DreamcastDirectoryEntry from './DirectoryEntry';

const {
  BLOCK_SIZE,
  DIRECTORY_SIZE_IN_BLOCKS,
  SAVE_AREA_SIZE_IN_BLOCKS,
} = DreamcastBasics;

const DIRECTORY_PADDING_VALUE = 0x00;

const MAX_DIRECTORY_ENTRIES = SAVE_AREA_SIZE_IN_BLOCKS;
const DIRECTORY_ENTRY_LENGTH = DreamcastDirectoryEntry.LENGTH;

export default class DreamcastDirectory {
  static writeDirectory(saveFiles) {
    if (saveFiles.length > MAX_DIRECTORY_ENTRIES) {
      throw new Error(`Unable to fit ${saveFiles.length} saves into a single VMU image. Max is ${MAX_DIRECTORY_ENTRIES}`);
    }

    let arrayBuffer = Util.getFilledArrayBuffer(BLOCK_SIZE * DIRECTORY_SIZE_IN_BLOCKS, DIRECTORY_PADDING_VALUE);

    saveFiles.forEach((saveFile, i) => {
      const directoryEntry = DreamcastDirectoryEntry.writeDirectoryEntry(saveFile);

      arrayBuffer = Util.setArrayBufferPortion(arrayBuffer, directoryEntry, i * DreamcastDirectoryEntry.LENGTH, 0, DreamcastDirectoryEntry.LENGTH);
    });

    return arrayBuffer;
  }

  static readDirectory(arrayBuffer) {
    const dataView = new DataView(arrayBuffer);

    const directoryEntries = ArrayUtil.createSequentialArray(0, MAX_DIRECTORY_ENTRIES).map((i) => {
      const directoryEntryArrayBuffer = arrayBuffer.slice(i * DIRECTORY_ENTRY_LENGTH, (i + 1) * DIRECTORY_ENTRY_LENGTH);

      return GameCubeDirectoryEntry.readDirectoryEntry(directoryEntryArrayBuffer);
    }).filter((directoryEntry) => directoryEntry !== null);

    return directoryEntries;
  }
}
