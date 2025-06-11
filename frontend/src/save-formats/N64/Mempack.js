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
  if (!N64GameSerialCodeUtil.isCartSave(saveFile)) { /* eslint-disable-line no-use-before-define */
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

export default class N64MempackSaveData {
  static NUM_NOTES = NUM_NOTES;

  static TOTAL_SIZE = NUM_PAGES * PAGE_SIZE;

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

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
