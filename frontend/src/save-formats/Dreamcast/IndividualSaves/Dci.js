/* eslint-disable no-bitwise */

/*
.DCI is a directory entry concatenated with the raw save data

Note that the starting block number in the directory entry is irrelevant here

0x00-0x3F: Directory entry
0x40-EOF:  Game data
*/

import Util from '../../../util/util';

import DreamcastBasics from '../Components/Basics';
import DreamcastDirectoryEntry from '../Components/DirectoryEntry';

const { BLOCK_SIZE } = DreamcastBasics;

const DATA_OFFSET = DreamcastDirectoryEntry.LENGTH;

const DEFAULT_START_BLOCK_NUMBER = 0; // Doesn't matter: the concept of where the save is located doesn't mean anything in this format

export default class DreamcastDciSaveData {
  static convertSaveFileToDci(saveFile) {
    const saveFileWithBlockInfo = {
      ...saveFile,
      firstBlockNumber: DEFAULT_START_BLOCK_NUMBER,
      fileSizeInBlocks: Math.ceil(saveFile.rawData.byteLength / BLOCK_SIZE),
    };

    const directoryEntryArrayBuffer = DreamcastDirectoryEntry.writeDirectoryEntry(saveFileWithBlockInfo);

    return Util.concatArrayBuffers([directoryEntryArrayBuffer, saveFileWithBlockInfo.rawData]);
  }

  static convertIndividualSaveToSaveFile(arrayBuffer, checkSaveSize = true) {
    const directoryEntry = DreamcastDirectoryEntry.readDirectoryEntry(arrayBuffer);
    const rawData = arrayBuffer.slice(DATA_OFFSET);

    if (checkSaveSize && (rawData.byteLength !== (directoryEntry.fileSizeInBlocks * BLOCK_SIZE))) {
      throw new Error(`File appears to be corrupt. Save size specified as ${directoryEntry.fileSizeInBlocks} blocks (${directoryEntry.fileSizeInBlocks * BLOCK_SIZE} bytes)`
        + ` but save data is ${rawData.byteLength} bytes`);
    }

    return {
      ...directoryEntry,
      rawData,
    };
  }
}
