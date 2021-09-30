/* eslint no-bitwise: ['error', { 'allow': ['&', '^', '&=', '^=', '|='] }] */

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
import N64TextDecoder from './TextDecoder';

const LITTLE_ENDIAN = false;

const NUM_NOTES = 16; // A "note" is a save slot. It consists of >= 1 pages
const NUM_PAGES = 128;
const PAGE_SIZE = 256;
// const TOTAL_SIZE = (NUM_PAGES * PAGE_SIZE);

// The first 5 pages are special header info
const ID_AREA_PAGE = 0;
const INODE_TABLE_PAGE = 1;
const INODE_TABLE_BACKUP_PAGE = 2; // Page 2 is a repeat of page 1, checked in case we encounter corruption of page 1
const NOTE_TABLE_PAGES = [3, 4];
const FIRST_SAVE_DATA_PAGE = 5;

const ID_AREA_CHECKSUM_OFFSETS = [0x20, 0x60, 0x80, 0xC0]; // 4 different checksum in the ID Area, and if any of them match then the data is deemed valid
const ID_AREA_CHECKSUM_LENGTH = 28;
const ID_AREA_CHECKSUM_DESIRED_SUM_A_OFFSET = 28;
const ID_AREA_CHECKSUM_DESIRED_SUM_B_OFFSET = 30;

const NOTE_TABLE_BLOCK_SIZE = 32;
const NOTE_TABLE_GAME_SERIAL_CODE_OFFSET = 0;
const NOTE_TABLE_GAME_SERIAL_CODE_LENGTH = 4;
const NOTE_TABLE_PUBLISHER_CODE_OFFSET = 4;
const NOTE_TABLE_PUBLISHER_CODE_LENGTH = 2;
const NOTE_TABLE_STARTING_PAGE_OFFSET = 6;
const NOTE_TABLE_STATUS_OFFSET = 8;
const NOTE_TABLE_OCCUPIED_BIT = 0x2;
const NOTE_TABLE_UNUSED_OFFSET = 10;
const NOTE_TABLE_NOTE_NAME_EXTENSION_OFFSET = 12;
const NOTE_TABLE_NOTE_NAME_EXTENSION_LENGTH = 4;
const NOTE_TABLE_NOTE_NAME_OFFSET = 16;
const NOTE_TABLE_NOTE_NAME_LENGTH = 16;

const INODE_TABLE_CHECKSUM_OFFSET = 1; // Is the 0th byte also part of the checksum?
const INODE_TABLE_ENTRY_STOP = 1;
const INODE_TABLE_ENTRY_EMPTY = 3;

const GAME_SERIAL_CODE_MEDIA_INDEX = 0;
const GAME_SERIAL_CODE_REGION_INDEX = 3;

function getPage(pageNumber, arrayBuffer) {
  const offset = pageNumber * PAGE_SIZE;
  return arrayBuffer.slice(offset, offset + PAGE_SIZE);
}

function concatPages(pageNumbers, arrayBuffer) {
  const pages = pageNumbers.map((i) => getPage(i, arrayBuffer));
  return Util.concatArrayBuffers(pages);
}

function getNextPageNumber(inodePageDataView, pageNumber) {
  return inodePageDataView.getUint16(pageNumber * 2, LITTLE_ENDIAN);
}

function getStringCode(uint8Array) {
  // Made to be compatible with the strings fed to https://github.com/bryc/mempak/blob/master/js/codedb.js in case we want to use those lookup tables.
  // Note that there's only 1 code there (the publisher for Wave Race 64) that actually uses the - at this time,
  // but may as well make the output here match exactly just in case.
  return String.fromCharCode(...uint8Array).replace(/\0/g, '-');
}

// Taken from https://github.com/bryc/mempak/blob/master/js/parser.js#L147
// Calculate checksums of 4 byte arrays and compare them against the checksum
// listed in the file. They're redundant, so if any are correct then the file
// is deems not corrupted.
//
// Also fix up a common error along the way
function checkIdArea(arrayBuffer) {
  let foundValidBlock = false;

  const dataView = new DataView(arrayBuffer);
  const array = new Uint8Array(arrayBuffer);

  ID_AREA_CHECKSUM_OFFSETS.forEach((offset) => {
    let sumA = 0x0;
    let sumB = 0xFFF2;

    for (let i = 0; i < ID_AREA_CHECKSUM_LENGTH; i += 2) {
      sumA += dataView.getUint16(offset + i, LITTLE_ENDIAN);
      sumA &= 0xFFFF;
    }

    sumB -= sumA;

    const desiredSumA = dataView.getUint16(offset + ID_AREA_CHECKSUM_DESIRED_SUM_A_OFFSET, LITTLE_ENDIAN);
    let desiredSumB = dataView.getUint16(offset + ID_AREA_CHECKSUM_DESIRED_SUM_B_OFFSET, LITTLE_ENDIAN);

    // Fix incorrect checksums found in many DexDrive files
    // https://github.com/bryc/mempak/blob/master/js/parser.js#L127
    //
    // FIXME: Note that here we're operating on a copy of the data (a slice) and so this won't affect what's written out
    if ((desiredSumB !== sumB) && ((desiredSumB ^ 0x0C) === sumB) && (desiredSumA === sumA)) {
      desiredSumB ^= 0xC;
      array[offset + 31] ^= 0xC;
    }

    foundValidBlock = foundValidBlock || ((desiredSumA === sumA) && (desiredSumB === sumB));
  });

  if (!foundValidBlock) {
    throw new Error('File appears to be corrupt - checksums in ID Area do not match');
  }
}

// Taken from https://github.com/bryc/mempak/blob/master/js/parser.js#L173
function readNoteTable(inodePageArrayBuffer, noteTableArrayBuffer) {
  const noteKeys = [];
  const noteTable = [];

  const noteTableArray = new Uint8Array(noteTableArrayBuffer);

  const noteTableDataView = new DataView(noteTableArrayBuffer);
  const inodePageDataView = new DataView(inodePageArrayBuffer);

  for (let currentByte = 0; currentByte < noteTableArrayBuffer.byteLength; currentByte += NOTE_TABLE_BLOCK_SIZE) {
    const id = currentByte / NOTE_TABLE_BLOCK_SIZE;

    const startingPage = noteTableDataView.getUint16(currentByte + NOTE_TABLE_STARTING_PAGE_OFFSET, LITTLE_ENDIAN);
    const nextPage = getNextPageNumber(inodePageDataView, startingPage);

    const firstPageValid = (startingPage >= FIRST_SAVE_DATA_PAGE) && (startingPage < NUM_PAGES);
    const unusedBytesAreZero = (noteTableDataView.getUint16(currentByte + NOTE_TABLE_UNUSED_OFFSET, LITTLE_ENDIAN) === 0);
    const nextPageValid = (nextPage === INODE_TABLE_ENTRY_STOP) || ((nextPage >= FIRST_SAVE_DATA_PAGE) && (nextPage < NUM_PAGES));

    if (firstPageValid && unusedBytesAreZero && nextPageValid) {
      noteKeys.push(startingPage);

      // Apparently sometimes this bit is unset, but it needs to be set.
      // FIXME: Currently, this only affects a copy of the data (a slice) and not the actual data written out
      noteTableArray[currentByte + NOTE_TABLE_STATUS_OFFSET] |= NOTE_TABLE_OCCUPIED_BIT;

      const gameSerialCodeArray = noteTableArray.slice(currentByte + NOTE_TABLE_GAME_SERIAL_CODE_OFFSET, currentByte + NOTE_TABLE_GAME_SERIAL_CODE_OFFSET + NOTE_TABLE_GAME_SERIAL_CODE_LENGTH);
      const publisherCodeArray = noteTableArray.slice(currentByte + NOTE_TABLE_PUBLISHER_CODE_OFFSET, currentByte + NOTE_TABLE_PUBLISHER_CODE_OFFSET + NOTE_TABLE_PUBLISHER_CODE_LENGTH);

      const gameSerialCodeSum = gameSerialCodeArray.reduce((accumulator, n) => accumulator + n);
      const publisherCodeSum = publisherCodeArray.reduce((accumulator, n) => accumulator + n);

      // These indicate that something was corrupted in the file and needs manual fixing
      // This only seems to affect one entry: the publisher for Wave Race 64. We'll maintain this fixup for compatibility with https://github.com/bryc/mempak/blob/master/js/codedb.js
      // FIXME: This repair only affects a copy of the data (a slice) and not the actual data written out
      if (gameSerialCodeSum === 0) {
        gameSerialCodeArray[NOTE_TABLE_GAME_SERIAL_CODE_LENGTH - 1] |= 1;
      }

      if (publisherCodeSum === 0) {
        publisherCodeArray[NOTE_TABLE_PUBLISHER_CODE_LENGTH - 1] |= 1;
      }

      const gameSerialCode = getStringCode(gameSerialCodeArray);
      const publisherCode = getStringCode(publisherCodeArray); // Between the fixups in this function and just above, this turns the publisher 0x0000 for Wave Race 64 to 0x2D01, for use in the mempak lookup yable listed above

      let noteName = N64TextDecoder.decode(
        noteTableArray.slice(
          currentByte + NOTE_TABLE_NOTE_NAME_OFFSET,
          currentByte + NOTE_TABLE_NOTE_NAME_OFFSET + NOTE_TABLE_NOTE_NAME_LENGTH,
        ),
      );

      if (noteTableArray[NOTE_TABLE_NOTE_NAME_EXTENSION_OFFSET] !== 0) {
        noteName += '.';
        noteName += N64TextDecoder.decode(
          noteTableArray.slice(
            currentByte + NOTE_TABLE_NOTE_NAME_EXTENSION_OFFSET,
            currentByte + NOTE_TABLE_NOTE_NAME_EXTENSION_OFFSET + NOTE_TABLE_NOTE_NAME_EXTENSION_LENGTH,
          ),
        );
      }

      noteTable[id] = {
        pageNumbers: startingPage,
        gameSerialCode,
        publisherCode,
        noteName,
        region: gameSerialCode.charAt(GAME_SERIAL_CODE_REGION_INDEX),
        media: gameSerialCode.charAt(GAME_SERIAL_CODE_MEDIA_INDEX),
      };

      console.log(`For ID '${id}':`);
      console.log(`  Page numbers '${noteTable[id].pageNumbers}'`);
      console.log(`  Note name '${noteTable[id].noteName}'`);
      console.log(`  Game serial code '${noteTable[id].gameSerialCode}'`);
      console.log(`  Publisher code '${noteTable[id].publisherCode}'`);
      console.log(`  Region: '${noteTable[id].region}'`);
      console.log(`  Media: '${noteTable[id].media}'`);
    }
  }

  return {
    noteKeys,
    noteTable,
  };
}

// Taken from https://github.com/bryc/mempak/blob/master/js/parser.js#L269
//
// The implementation there performs quite a number of consistency checks on this data, and if
// an anomoly is found then it switches to using the backup inode page. Because these checks therefore
// influence how the data is parsed, we'll replicate them here
function checkIndexes(inodeArrayBuffer, noteTableKeys) {
  const inodePageDataView = new DataView(inodeArrayBuffer);

  const found = {
    parsed: [],
    empty: [],
    stops: [],
    keys: [],
    values: [],
    duplicates: {},
  };

  // First, go through each entry and make sure that all the values are within range,
  // and there are no duplicates

  for (let currentPage = FIRST_SAVE_DATA_PAGE; currentPage < NUM_PAGES; currentPage += 1) {
    const nextPage = getNextPageNumber(inodePageDataView, currentPage);

    if (nextPage === INODE_TABLE_ENTRY_STOP) {
      found.stops.push(currentPage);
    } else if (nextPage === INODE_TABLE_ENTRY_EMPTY) {
      found.empty.push(currentPage);
    } else if ((nextPage >= FIRST_SAVE_DATA_PAGE) && (nextPage < NUM_PAGES)) {
      if (found.duplicates[nextPage]) {
        throw new Error(`Found duplicate entries in inode table. Both ${found.duplicates[nextPage]} and ${currentPage} point to page ${nextPage}`);
      }

      found.values.push(nextPage);
      found.keys.push(currentPage);
      found.duplicates[nextPage] = currentPage;
    } else {
      throw new Error(`Inode table contains illegal value: ${nextPage} at page ${currentPage}`);
    }
  }

  // Figure out which keys we found are ones that begin a sequence, and then compare this against
  // what we found when parsing the note table. We should have found the same number of both
  // start keys and stops in the inode table as we found start keys in the note table.

  const startKeysFound = found.keys.filter((x) => !found.values.includes(x));

  if ((noteTableKeys.length !== startKeysFound.length) || (noteTableKeys.length !== found.stops.length)) {
    throw new Error(`Found ${noteTableKeys.length} starting keys in the note table, but found ${startKeysFound.length} starting keys and ${found.stops.length} stop leys in inode table`);
  }

  startKeysFound.forEach((x) => {
    if (!noteTableKeys.includes(x)) {
      throw new Error(`Found start key ${x} in inode table which doesn't exist in note table`);
    }
  });

  // Get the index sequence for each note

  const noteIndexes = {};
  startKeysFound.forEach((startingPage) => {
    const indexes = [startingPage];
    let currentPage = startingPage;
    let nextPage = getNextPageNumber(inodePageDataView, currentPage);

    while (nextPage !== INODE_TABLE_ENTRY_STOP) { // We've already validated that all of these are >= FIRST_SAVE_DATA_PAGE and < NUM_PAGES
      indexes.push(nextPage);
      currentPage = nextPage;
      nextPage = getNextPageNumber(inodePageDataView, currentPage);
    }

    noteIndexes[startingPage] = indexes;
    found.parsed.push(...indexes.slice(1)); // We didn't 'find' the starting index, so remove it from here because we use this to check our integrity below
  });

  // Check that we parsed and found the same number of keys
  if (found.parsed.length !== found.keys.length) {
    throw new Error(`We encountered ${found.parsed.length} keys when following the various index sequences, but found ${found.keys.length} keys when looking through the entire inode table.`);
  }

  // We've passed all of our validations, so we can fixup our checksums.
  // Apparently valid files can have invalid checksums, so we won't actually
  // check the checksums: only calculate and update them.
  // https://github.com/bryc/mempak/blob/master/js/parser.js#L325

  let sum = 0;
  for (let currentPage = FIRST_SAVE_DATA_PAGE; currentPage < NUM_PAGES; currentPage += 1) {
    // The code we're copying this from adds up all the bytes rather than the uint16s like we're doing here.
    // But, since we already validated that each of these uint16s is < NUM_PAGES (128) then we can assume that all
    // of the high bytes are 0
    sum += getNextPageNumber(inodePageDataView, currentPage);
    sum &= 0xFF;
  }

  // Is the 0th byte also part of the checksum?
  // The code we're copying this from doesn't update the 0th byte, so we'll leave it alone too
  // https://github.com/bryc/mempak/blob/master/js/parser.js#L330
  //
  // FIXME: This only updates a copy of the data (a slice) and not the actual data written out
  inodePageDataView.setUint8(INODE_TABLE_CHECKSUM_OFFSET, sum);

  return noteIndexes;
}

export default class N64MempackSaveData {
  static NUM_NOTES = NUM_NOTES;

  static createFromN64MempackData(mempackArrayBuffer) {
    return new N64MempackSaveData(mempackArrayBuffer);
  }

  static createFromSaveFiles(saveFiles) {
    this.saveFiles = saveFiles;
  }

  constructor(mempackArrayBuffer) {
    this.arrayBuffer = mempackArrayBuffer;

    // There are 5 pages of header information, then the rest are game save data

    // The first page, the ID Area, is a series of checksums plus some other stuff we'll ignore
    checkIdArea(getPage(ID_AREA_PAGE, mempackArrayBuffer));

    // Now, check the note table
    let inodeArrayBuffer = getPage(INODE_TABLE_PAGE, mempackArrayBuffer);
    let inodeBackupArrayBuffer = getPage(INODE_TABLE_BACKUP_PAGE, mempackArrayBuffer);
    const noteTableArrayBuffer = concatPages(NOTE_TABLE_PAGES, mempackArrayBuffer);

    const noteInfo = readNoteTable(inodeArrayBuffer, noteTableArrayBuffer);

    try {
      checkIndexes(inodeArrayBuffer, noteInfo.noteKeys);

      // If we pass our index checks, then the parimary inode page is good and we can replace the backup with it
      // FIXME: This only affects a copy of the data (a slice) and not the actual data written out
      inodeBackupArrayBuffer = inodeArrayBuffer;
    } catch (e) {
      // If we encounter something that appears to be corrupted in the main inode table, then
      // try again with the backup table
      try {
        checkIndexes(inodeBackupArrayBuffer, noteInfo.noteKeys);

        // Our primary table is corrupted but our backup is okay, so write the backup over the primary
        // FIXME: This only affects a copy of the data (a slice) and not the actual data written out
        inodeArrayBuffer = inodeBackupArrayBuffer;
      } catch (e2) {
        throw new Error('Both primary and backup inode tables appear to be corrupted. Error from backup table follows', { cause: e2 });
      }
    }

    this.saveFiles = [];
  }

  getSaveFiles() {
    return this.saveFiles;
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
