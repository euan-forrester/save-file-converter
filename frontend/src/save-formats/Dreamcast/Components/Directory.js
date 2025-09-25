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
  static writeDirectory(saveFilesWithBlockInfo) {
    const directoryEntries = saveFilesWithBlockInfo.map((saveFile) => DreamcastDirectoryEntry.writeDirectoryEntry(saveFile));

    const directoryEntriesSize = directoryEntries.length * DreamcastDirectoryEntry.LENGTH;

    const padding = Util.getFilledArrayBuffer((BLOCK_SIZE * DIRECTORY_SIZE_IN_BLOCKS) - directoryEntriesSize, DIRECTORY_PADDING_VALUE);

    return Util.concatArrayBuffers([...directoryEntries, padding]);
  }

  static readDirectory(arrayBuffer) {
    const directoryEntries = ArrayUtil.createSequentialArray(0, MAX_DIRECTORY_ENTRIES).map((i) => {
      const directoryEntryArrayBuffer = arrayBuffer.slice(i * DIRECTORY_ENTRY_LENGTH, (i + 1) * DIRECTORY_ENTRY_LENGTH);

      return DreamcastDirectoryEntry.readDirectoryEntry(directoryEntryArrayBuffer);
    }).filter((directoryEntry) => directoryEntry !== null);

    return directoryEntries;
  }
}
