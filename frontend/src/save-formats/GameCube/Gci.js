/* eslint-disable no-bitwise */

/*
The standard format for individual saves on the GameCube appears to be the .GCI format.

There are other potential formats recognized by Dolphin:
- .GCS: https://github.com/dolphin-emu/dolphin/blob/master/Source/Core/Core/HW/GCMemcard/GCMemcardUtils.cpp#L149
- .SAV: https://github.com/dolphin-emu/dolphin/blob/master/Source/Core/Core/HW/GCMemcard/GCMemcardUtils.cpp#L182

Dolphin distinguishes between them based on file size, because the blocks are the same but the header is different: https://github.com/dolphin-emu/dolphin/blob/master/Source/Core/Core/HW/GCMemcard/GCMemcardUtils.cpp#L212

.GCI is a directory entry concatenated with the raw save data

Note that the starting block number in the directory entry is irrelevant here

0x00-0x3F: Directory entry
0x40-EOF:  Game data (including the comment and icons)
*/

import Util from '../../util/util';

import GameCubeBasics from './Components/Basics';
import GameCubeDirectoryEntry from './Components/DirectoryEntry';

const { BLOCK_SIZE } = GameCubeBasics;

// Figuring out the encoding of the comments is tricky. In a real save file the encoding is specified in the header.
// However, this user-defined format takes the directory entry from the real format but omits the header.

// It does not appear that we can automatically detect the encoding of the comments.
// The encoding-japanese package that we use to encode/decode shift-jis strings can in theory
// detect encoding, but for our example save files it returns "UTF32" for US-ASCII comments,
// and any one of "UTF32", "UTF16", or "SJIS" for the Japanese ones (which are all in shift-jis)

// We could parse them always using shift-jis because the ASCII stuff will be decoded correctly, with the exception of backslash and tilde and then anything in "extended" ASCII above 0x7F

// But we can maybe do slightly better by trying to infer the encoding from the region of the game.
// Games from the Japan region we'll decode as shift-jis, and the other 2 regions (North American and Europe) we'll decode as US-ASCII

const GAME_CODE_AND_FILE_NAME_ENCODING = 'US-ASCII';

const SHIFT_JIS_COMMENT_REGIONS = ['Japan', 'Korea'];

const DATA_OFFSET = GameCubeDirectoryEntry.LENGTH;

const DEFAULT_START_BLOCK_NUMBER = 0; // Doesn't matter: the concept of where the save is located doesn't mean anything in this format

export default class GameCubeGciSaveData {
  static convertSaveFilesToGcis(saveFiles) {
    return saveFiles.map((saveFile) => {
      const saveFileWithBlockInfo = {
        ...saveFile,
        saveStartBlock: DEFAULT_START_BLOCK_NUMBER,
        saveSizeBlocks: saveFile.rawData.byteLength / BLOCK_SIZE,
      };

      const directoryEntryArrayBuffer = GameCubeDirectoryEntry.writeDirectoryEntry(saveFileWithBlockInfo);

      return Util.concatArrayBuffers([directoryEntryArrayBuffer, saveFileWithBlockInfo.rawData]);
    });
  }

  // Based on https://github.com/dolphin-emu/dolphin/blob/master/Source/Core/Core/HW/GCMemcard/GCMemcardUtils.cpp#L131
  static convertGcisToSaveFiles(arrayBuffers) {
    return arrayBuffers.map((arrayBuffer) => {
      const directoryEntry = GameCubeDirectoryEntry.readDirectoryEntry(arrayBuffer, GAME_CODE_AND_FILE_NAME_ENCODING);
      const rawData = arrayBuffer.slice(DATA_OFFSET);
      const inferredCommentEncoding = (SHIFT_JIS_COMMENT_REGIONS.indexOf(directoryEntry.region) >= 0) ? 'shift-jis' : 'US-ASCII'; // Note that this can be incorrect for Korean games: they can have the region E (USA)

      if (rawData.byteLength !== (directoryEntry.saveSizeBlocks * BLOCK_SIZE)) {
        throw new Error(`File appears to be corrupt. Save size specified as ${directoryEntry.saveSizeBlocks} blocks (${directoryEntry.saveSizeBlocks * BLOCK_SIZE} bytes)`
          + ` but save data is ${rawData.byteLength} bytes`);
      }

      const comments = GameCubeDirectoryEntry.getComments(directoryEntry.commentStart, rawData, inferredCommentEncoding);

      return {
        ...directoryEntry,
        inferredCommentEncoding,
        comments,
        rawData,
      };
    });
  }
}
