/* eslint-disable no-bitwise */

/*
Based on https://www.reddit.com/r/SegaSaturn/comments/1acty0v/comment/kjz73ft/
which is a machine translation of https://github.com/tpunix/SAROO/blob/master/doc/SAROO%E6%8A%80%E6%9C%AF%E7%82%B9%E6%BB%B4.txt
*/

import Util from '../../util/util';

const MAGIC = 'SaroSave';
const MAGIC_OFFSET = 0;
const MAGIC_ENCODING = 'US-ASCII';

export default class SarooSaveData {
  static createWithNewSize(/* segaSaturnSaveData, newSize */) {
    /*
    const newRawSaveData = SegaSaturnUtil.resize(segaSaturnSaveData.getArrayBuffer(), newSize);

    return SegaSaturnSaveData.createFromSegaSaturnData(newRawSaveData);
    */
  }

  static createFromSarooData(arrayBuffer) {
    Util.checkMagic(arrayBuffer, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);
  }

  static createFromSaveFiles(/* saveFiles, size */) {
    /*
    // Setup and make sure we have enough space for the files

    let segaCdArrayBuffer = SegaCdUtil.makeEmptySave(size);
    const initialFreeBlocks = SegaCdUtil.getTotalAvailableBlocks(segaCdArrayBuffer); // If we call SegaCdUtil.getNumFreeBlocks() it will subtract one because of the extra block that's reserved for the first file's directory entry

    const requiredBlocksForSaves = saveFiles.reduce((accumulatedBlocks, saveFile) => accumulatedBlocks + getRequiredBlocks(saveFile), 0);
    const requiredBlocksForDirectoryEntries = Math.ceil(saveFiles.length / 2);
    const requiredReservedBlocks = ((saveFiles.length % 2) === 0) ? 1 : 0; // We can store 2 directory entries in a block. We always need room for the next future directory entry. So, if there are an odd number of save files we can store the next one in our last block. But if there are an even number of save files we need to reserve the next block

    const requiredBlocks = requiredBlocksForSaves + requiredBlocksForDirectoryEntries + requiredReservedBlocks;

    if (requiredBlocks > initialFreeBlocks) {
      throw new Error(`The specified save files require a total of ${requiredBlocks} blocks of free space, but Sega CD save data of ${size} bytes only has ${initialFreeBlocks} free blocks`);
    }

    // Write the files
    */

    // return new SegaSaturnSaveData(segaSaturnArrayBuffer, saveFiles);
  }

  // This constructor creates a new object from a binary representation of Sega CD save data
  constructor(arrayBuffer, saveFiles, volumeInfo) {
    this.arrayBuffer = arrayBuffer;
    this.saveFiles = saveFiles;
    this.volumeInfo = volumeInfo;
  }

  getSaveFiles() {
    return this.saveFiles;
  }

  getVolumeInfo() {
    return this.volumeInfo;
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
