/* eslint no-bitwise: ['error', { 'allow': ['&', '|', '^', '&=', '^=', '|='] }] */

/*
The N64 mempack format is described here:
https://github.com/bryc/mempak/wiki/MemPak-structure

The first 5 pages are header information.
Page 0: ID area, containing checksums
Page 1: "Inode" (index) information
Page 2: Repeat of page 1
Page 3, 4: Note table

The subsequent 123 pages are the actual save data
*/

import Util from '../../util/util';
import N64Util from '../../util/N64';

import N64Basics from './Components/Basics';
import N64IdArea from './Components/IdArea';
import N64InodeTable from './Components/InodeTable';
import N64NoteTable from './Components/NoteTable';
import N64GameSerialCodeUtil from './Components/GameSerialCodeUtil';

const {
  NUM_NOTES,
  NUM_PAGES,
  PAGE_SIZE,
  FIRST_SAVE_DATA_PAGE,
} = N64Basics;

// The first 5 pages are special header info
const ID_AREA_PAGE = 0;
const INODE_TABLE_PAGE = 1;
const INODE_TABLE_BACKUP_PAGE = 2; // Page 2 is a repeat of page 1, checked in case we encounter corruption of page 1
const NOTE_TABLE_PAGES = [3, 4];

const MAX_DATA_SIZE = (NUM_PAGES - FIRST_SAVE_DATA_PAGE) * PAGE_SIZE;

const FILENAME_ENCODING = 'utf8'; // Encoding to use when creating a filename for an individual note

// Using various cheating devices, it's possible to copy a save stored on a cartridge onto
// a controller pak. There are many potential cart save sizes (see http://micro-64.com/database/gamesave.shtml),
// but only the ones below will fit onto a controller pak: the next size up (32768 bytes) doesn't fit because of the 5
// pages taken up by system infomation.
//
// For some/all of these devices they apparently will skip pages at the end that are filled with padding, meaning
// that we should pad out any cart saves that we encounter to be one of these sizes. Some emulators will take an
// unpadded file just fine, but apparently others won't like it.

const CART_SAVE_SIZES = [
  512,
  2048,
];

const GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE = '\x3B\xAD\xD1\xE5';
const GAMESHARK_ACTIONREPLAY_CART_SAVE_PUBLISHER_CODE = '\xFA\xDE';
const BLACKBAG_CART_SAVE_GAME_SERIAL_CODE = '\xDE\xAD\xBE\xEF'; // #cute
const BLACKBAG_CART_SAVE_PUBLISHER_CODE = '\x12\x34'; // #cute

function getPage(pageNumber, arrayBuffer) {
  const offset = pageNumber * PAGE_SIZE;
  return arrayBuffer.slice(offset, offset + PAGE_SIZE);
}

function concatPages(pageNumbers, arrayBuffer) {
  const pages = pageNumbers.map((i) => getPage(i, arrayBuffer));
  return Util.concatArrayBuffers(pages);
}

// See comments above: cart saves can be stored in a controller pak file, but the cheat
// devices used to do so may truncate the file to eliminate portions that are all padding.
// We'll add that padding back for better compatibility with emulators.
function padCartSave(saveFile) {
  if (!N64MempackSaveData.isCartSave(saveFile)) { /* eslint-disable-line no-use-before-define */
    return saveFile;
  }

  for (let i = 0; i < CART_SAVE_SIZES.length; i += 1) {
    if (CART_SAVE_SIZES[i] === saveFile.rawData.byteLength) {
      return saveFile;
    }

    if (CART_SAVE_SIZES[i] > saveFile.rawData.byteLength) {
      let paddedRawData = saveFile.rawData;

      while (paddedRawData.byteLength < CART_SAVE_SIZES[i]) {
        paddedRawData = Util.concatArrayBuffers([paddedRawData, N64Basics.createEmptyBlock(PAGE_SIZE)]);
      }

      return {
        ...saveFile,
        rawData: paddedRawData,
      };
    }
  }

  return saveFile;
}

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

export default class N64MempackSaveData {
  static NUM_NOTES = NUM_NOTES;

  static TOTAL_SIZE = NUM_PAGES * PAGE_SIZE;

  static GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE = GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE;

  static GAMESHARK_ACTIONREPLAY_CART_SAVE_PUBLISHER_CODE = GAMESHARK_ACTIONREPLAY_CART_SAVE_PUBLISHER_CODE;

  static GAMESHARK_ACTIONREPLAY_CART_SAVE_REGION_CODE = N64GameSerialCodeUtil.getRegionCode(GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE);

  static GAMESHARK_ACTIONREPLAY_CART_SAVE_MEDIA_CODE = N64GameSerialCodeUtil.getMediaCode(GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE);

  static BLACKBAG_CART_SAVE_GAME_SERIAL_CODE = BLACKBAG_CART_SAVE_GAME_SERIAL_CODE;

  static BLACKBAG_CART_SAVE_PUBLISHER_CODE = BLACKBAG_CART_SAVE_PUBLISHER_CODE;

  static BLACKBAG_CART_SAVE_REGION_CODE = N64GameSerialCodeUtil.getRegionCode(BLACKBAG_CART_SAVE_GAME_SERIAL_CODE);

  static BLACKBAG_CART_SAVE_MEDIA_CODE = N64GameSerialCodeUtil.getMediaCode(BLACKBAG_CART_SAVE_GAME_SERIAL_CODE);

  static createFromN64MempackData(mempackArrayBuffer) {
    return new N64MempackSaveData(mempackArrayBuffer);
  }

  static createFromSaveFiles(saveFiles, randomNumberGenerator = null) {
    // Check to make sure that there's not too many save files, or too much data, or save files the wrong length

    if (saveFiles.length > NUM_NOTES) {
      throw new Error(`Found ${saveFiles.length} notes, but max is ${NUM_NOTES}`);
    }

    const totalSize = saveFiles.reduce((accumulator, x) => accumulator + x.rawData.byteLength);

    if (totalSize > MAX_DATA_SIZE) {
      throw new Error(`Total size of notes is ${totalSize} bytes, but max is ${MAX_DATA_SIZE}`);
    }

    saveFiles.forEach((x) => {
      if (x.rawData.byteLength === 0) {
        throw new Error(`Save file ${x.noteNate} does not contain any data`);
      }

      if (x.rawData.byteLength % PAGE_SIZE !== 0) {
        throw new Error(`All saves must be multiples of ${PAGE_SIZE} bytes, but save '${N64MempackSaveData.getDisplayName(x)}' is ${x.rawData.byteLength} bytes`);
      }
    });

    // Now make our header pages

    const idAreaPage = N64IdArea.createIdAreaPage(randomNumberGenerator);
    const { inodeTablePage, startingPages } = N64InodeTable.createInodeTablePage(saveFiles);

    const saveFilesWithStartingPage = saveFiles.map((x, i) => ({ ...x, startingPage: startingPages[i] }));

    const noteTablePage = N64NoteTable.createNoteTablePage(saveFilesWithStartingPage);

    // Technically, we should split each save into separate pages, then concat all 128 pages together to get the final
    // arraybuffer. But, we can cheat and just concat the existing saves together instead of splitting them apart first

    let dataPages = Util.concatArrayBuffers(saveFiles.map((x) => x.rawData));

    while (dataPages.byteLength < MAX_DATA_SIZE) {
      dataPages = Util.concatArrayBuffers([dataPages, N64Basics.createEmptyBlock(PAGE_SIZE)]);
    }

    const arrayBuffer = Util.concatArrayBuffers([idAreaPage, inodeTablePage, inodeTablePage, noteTablePage, dataPages]);

    return new N64MempackSaveData(arrayBuffer);
  }

  constructor(mempackArrayBuffer) {
    this.arrayBuffer = mempackArrayBuffer;

    // There are 5 pages of header information, then the rest are game save data

    // The first page, the ID Area, is a series of checksums plus some other stuff we'll ignore
    N64IdArea.checkIdArea(getPage(ID_AREA_PAGE, mempackArrayBuffer));

    // Now, check the note table
    const inodeArrayBuffer = getPage(INODE_TABLE_PAGE, mempackArrayBuffer);
    const inodeBackupArrayBuffer = getPage(INODE_TABLE_BACKUP_PAGE, mempackArrayBuffer);
    const noteTableArrayBuffer = concatPages(NOTE_TABLE_PAGES, mempackArrayBuffer);

    const noteInfo = N64NoteTable.readNoteTable(inodeArrayBuffer, noteTableArrayBuffer);
    let noteIndexes = {};

    try {
      noteIndexes = N64InodeTable.checkIndexes(inodeArrayBuffer, noteInfo.noteKeys);
    } catch (e) {
      // If we encounter something that appears to be corrupted in the main inode table, then
      // try again with the backup table
      try {
        noteIndexes = N64InodeTable.checkIndexes(inodeBackupArrayBuffer, noteInfo.noteKeys);
      } catch (e2) {
        throw new Error('Both primary and backup inode tables appear to be corrupted. Error from backup table follows', { cause: e2 });
      }
    }

    const saveFiles = noteInfo.notes.map((x) => ({
      ...x,
      pageNumbers: noteIndexes[x.startingPage],
      rawData: concatPages(noteIndexes[x.startingPage], mempackArrayBuffer),
    }));

    this.saveFiles = saveFiles.map((x) => padCartSave(x));
  }

  getSaveFiles() {
    return this.saveFiles;
  }

  static isCartSave(saveFile) {
    return ((saveFile.gameSerialCode === GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE) || (saveFile.gameSerialCode === BLACKBAG_CART_SAVE_GAME_SERIAL_CODE));
  }

  static getDisplayName(saveFile) {
    if (saveFile.noteNameExtension.length > 0) {
      return `${saveFile.noteName}.${saveFile.noteNameExtension}`;
    }

    return saveFile.noteName;
  }

  static createFilename(saveFile) {
    if (N64MempackSaveData.isCartSave(saveFile)) {
      // Here we want to make a user-friendly name, meaning having the correct extension for an emulator to load

      // NOTE: if we get into trouble again here with having a . in between the note name and the note name extension,
      // we'll again need to deal with the issue of users having legacy filenames on their machines

      return `${N64MempackSaveData.getDisplayName(saveFile)}.${N64Util.getFileExtension(saveFile.rawData)}`; // It's always going to be .eep because that's all that can fit in a mempack image: the next size up is the size of an entire mempack, which doesn't leave room for the system information
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
        gameSerialCode: GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE,
        publisherCode: GAMESHARK_ACTIONREPLAY_CART_SAVE_PUBLISHER_CODE,
      };
    }
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
