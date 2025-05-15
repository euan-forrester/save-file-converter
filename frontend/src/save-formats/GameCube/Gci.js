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

const GAME_CODE_AND_FILE_NAME_ENCODING = 'US-ASCII'; // In theory we could parse the whole object with shift-jis because the ASCII stuff will be decoded correctly, with the exception of backslash and tilde and then anything in "extended" ASCII above 0x7F

const DATA_OFFSET = GameCubeDirectoryEntry.LENGTH;

export default class GameCubeGciSaveData {
  static convertSaveFilesToGcis(saveFiles) {
    return saveFiles.map((saveFile) => {
      console.log('Dude');
      return saveFile.blah;
    });
  }

  static convertGcisToSaveFiles(arrayBuffers, overrideCommentEncoding) {
    return arrayBuffers.map((arrayBuffer) => {
      // It does not appear that we can automatically detect the encoding of the comments.
      // The encoding-japanese package that we use to encode/decode shift-jis strings can in theory
      // detect encoding, but for our example save files it returns "UTF32" for US-ASCII comments,
      // and any one of "UTF32", "UTF16", or "SJIS" for the Japanese ones (which are all in shift-jis)
      const commentEncoding = (overrideCommentEncoding !== undefined) ? overrideCommentEncoding : GAME_CODE_AND_FILE_NAME_ENCODING;

      const directoryEntry = GameCubeDirectoryEntry.readDirectoryEntry(arrayBuffer, GAME_CODE_AND_FILE_NAME_ENCODING);
      const rawData = arrayBuffer.slice(DATA_OFFSET);

      const comments = GameCubeDirectoryEntry.getComments(directoryEntry.commentStart, rawData, commentEncoding);

      return {
        ...directoryEntry,
        comments,
        rawData,
      };
    });
  }
}
