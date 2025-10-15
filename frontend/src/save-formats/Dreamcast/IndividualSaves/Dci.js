/* eslint-disable no-bitwise */

/*
.DCI is a directory entry concatenated with the raw save data

Note that the starting block number in the directory entry is irrelevant here

0x00-0x3F: Directory entry
0x40-EOF:  Game data (stored endian-sweapped)
*/

import Util from '../../../util/util';
import EndianUtil from '../../../util/Endian';

import DreamcastBasics from '../Components/Basics';
import DreamcastDirectoryEntry from '../Components/DirectoryEntry';

const {
  BLOCK_SIZE,
  WORD_SIZE_IN_BYTES,
} = DreamcastBasics;

const DATA_OFFSET = DreamcastDirectoryEntry.LENGTH;

const DEFAULT_FIRST_BLOCK_NUMBER = 0; // Doesn't matter: the concept of where the save is located doesn't mean anything in this format

export default class DreamcastDciSaveData {
  static convertSaveFileToDci(saveFile) {
    const saveFileWithBlockInfo = {
      ...saveFile,
      firstBlockNumber: DEFAULT_FIRST_BLOCK_NUMBER,
      fileSizeInBlocks: Math.ceil(saveFile.rawData.byteLength / BLOCK_SIZE),
    };

    const directoryEntryArrayBuffer = DreamcastDirectoryEntry.writeDirectoryEntry(saveFileWithBlockInfo);

    return Util.concatArrayBuffers([directoryEntryArrayBuffer, EndianUtil.swap(saveFileWithBlockInfo.rawData, WORD_SIZE_IN_BYTES)]);
  }

  static convertIndividualSaveToSaveFile(arrayBuffer, checkSaveSize = false) {
    const directoryEntry = DreamcastDirectoryEntry.readDirectoryEntry(arrayBuffer);
    const rawData = EndianUtil.swap(arrayBuffer.slice(DATA_OFFSET), WORD_SIZE_IN_BYTES);

    if (checkSaveSize && (rawData.byteLength !== (directoryEntry.fileSizeInBlocks * BLOCK_SIZE))) {
      throw new Error('This file appears to be corrupt');
    }

    const comments = DreamcastDirectoryEntry.getComments(directoryEntry.fileHeaderBlockNumber, rawData);

    return {
      ...directoryEntry,
      ...comments,
      rawData,
    };
  }
}
