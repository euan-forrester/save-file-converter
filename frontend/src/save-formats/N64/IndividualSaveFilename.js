import Util from '../../util/util';
import N64Util from '../../util/N64';

import N64GameSerialCodeUtil from './Components/GameSerialCodeUtil';

const FILENAME_ENCODING = 'utf8'; // Encoding to use when creating a filename for an individual note

function parseNoteNameAndExtension(noteNameAndExtension) {
  // Here we are going to assume that if there's one . then it's intended to split the name from the extension (e.g. "T2-WAREHOUSE.P" for Tony Hawk)
  // and if there are 0 or > 1 .'s then it's just all the filename (e.g. "S.F. RUSH" for San Francisco Rush)

  const noteNameAndExtensionParts = noteNameAndExtension.split('.');

  let noteName = noteNameAndExtension;
  let noteNameExtension = '';

  if (noteNameAndExtensionParts.length === 2) {
    [noteName, noteNameExtension] = noteNameAndExtensionParts;
  }

  return {
    noteName,
    noteNameExtension,
  };
}

export default class N64IndividualSaveFilename {
  static getDisplayName(saveFile) {
    if (saveFile.noteNameExtension.length > 0) {
      return `${saveFile.noteName}.${saveFile.noteNameExtension}`;
    }

    return saveFile.noteName;
  }

  static createFilename(saveFile) {
    if (N64GameSerialCodeUtil.isCartSave(saveFile)) {
      // Here we want to make a user-friendly name, meaning having the correct extension for an emulator to load

      // NOTE: if we get into trouble again here with having a . in between the note name and the note name extension,
      // we'll again need to deal with the issue of users having legacy filenames on their machines

      return `${N64IndividualSaveFilename.getDisplayName(saveFile)}.${N64Util.getFileExtension(saveFile.rawData)}`; // It's always going to be .eep because that's all that can fit in a mempack image: the next size up is the size of an entire mempack, which doesn't leave room for the system information
    }

    // We need to encode all the stuff that goes into the note table into our file name.
    // Some of these portions can contain non-ASCII characters (For example, the publisher
    // code can be 0x0000), so encoding it as hex makes for an easy (if long) filename.

    const noteNameEncoded = Buffer.from(saveFile.noteName, FILENAME_ENCODING).toString('hex');
    const noteNameExtensionEncoded = Buffer.from(saveFile.noteNameExtension, FILENAME_ENCODING).toString('hex');
    const gameSerialCodeEncoded = Buffer.from(saveFile.gameSerialCode, FILENAME_ENCODING).toString('hex');
    const publisherCodeEncoded = Buffer.from(saveFile.publisherCode, FILENAME_ENCODING).toString('hex');

    return `RAW-${noteNameEncoded}-${noteNameExtensionEncoded}-${gameSerialCodeEncoded}-${publisherCodeEncoded}`;
  }

  static parseFilename(filename) {
    if (filename.startsWith('RAW-')) {
      const filenamePortions = filename.split('-');

      // We originally had a bug where the notename was encoded as "<notename>.<notenameextension>" which caused issues
      // when the notename itself had a . in it, such as "S.F. Rush". Users may have legacy filenames on their system, and
      // so we have to support either the old format or the new format

      try {
        if (filenamePortions.length === 4) {
          // Old style

          const noteNameAndExtension = Buffer.from(filenamePortions[1], 'hex').toString(FILENAME_ENCODING);
          const gameSerialCode = Buffer.from(filenamePortions[2], 'hex').toString(FILENAME_ENCODING);
          const publisherCode = Buffer.from(filenamePortions[3], 'hex').toString(FILENAME_ENCODING);

          const { noteName, noteNameExtension } = parseNoteNameAndExtension(noteNameAndExtension);

          return {
            noteName,
            noteNameExtension,
            gameSerialCode,
            publisherCode,
          };
        }

        if (filenamePortions.length === 5) {
          // New style

          const noteName = Buffer.from(filenamePortions[1], 'hex').toString(FILENAME_ENCODING);
          const noteNameExtension = Buffer.from(filenamePortions[2], 'hex').toString(FILENAME_ENCODING);
          const gameSerialCode = Buffer.from(filenamePortions[3], 'hex').toString(FILENAME_ENCODING);
          const publisherCode = Buffer.from(filenamePortions[4], 'hex').toString(FILENAME_ENCODING);

          return {
            noteName,
            noteNameExtension,
            gameSerialCode,
            publisherCode,
          };
        }

        throw new Error('Wrong number of parts in filename');
      } catch (e) {
        throw new Error('Filename not in correct format. Format should be \'RAW-XXXX-XXXX-XXXX\' or \'RAW-XXXX-XXXX-XXXX-XXXX\'');
      }
    } else {
      // Otherwise, we have to assume it's a cart save. So, it could set its game/publisher code to
      // be either Gameshark or Black Bag. The Black Bag file manager is I believe a defunct program
      // that ran on individual computers, and would be hard for most people to get running on their
      // modern machines. Whereas if we assign it to Gameshark, then someone could use the Gameshark
      // hardware to load it onto a real cart, regardless of whether the file was originally from
      // the Black Bag software.
      //
      // So, we'll just assign everything to Gameshark

      const noteNameAndExtension = Util.removeFilenameExtension(filename).trim().toUpperCase(); // There's no lower case arabic characters in the N64 text encoding

      const { noteName, noteNameExtension } = parseNoteNameAndExtension(noteNameAndExtension);

      return {
        noteName,
        noteNameExtension,
        gameSerialCode: N64GameSerialCodeUtil.GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE,
        publisherCode: N64GameSerialCodeUtil.GAMESHARK_ACTIONREPLAY_CART_SAVE_PUBLISHER_CODE,
      };
    }
  }
}
