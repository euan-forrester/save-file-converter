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
import N64TextDecoder from './TextDecoder';

const LITTLE_ENDIAN = false;

const NUM_NOTES = 16; // A "note" is a save slot. It consists of >= 1 pages
const NUM_PAGES = 128;
const PAGE_SIZE = 256;

// The first 5 pages are special header info
const ID_AREA_PAGE = 0;
const INODE_TABLE_PAGE = 1;
const INODE_TABLE_BACKUP_PAGE = 2; // Page 2 is a repeat of page 1, checked in case we encounter corruption of page 1
const NOTE_TABLE_PAGES = [3, 4];
const FIRST_SAVE_DATA_PAGE = 5;

const MAX_DATA_SIZE = (NUM_PAGES - FIRST_SAVE_DATA_PAGE) * PAGE_SIZE;

const ID_AREA_BLOCK_SIZE = 32;
const ID_AREA_CHECKSUM_OFFSETS = [0x20, 0x60, 0x80, 0xC0]; // 4 different checksum in the ID Area, and if any of them match then the data is deemed valid
const ID_AREA_CHECKSUM_LENGTH = 28;
const ID_AREA_DEVICE_OFFSET = 25;
const ID_AREA_BANK_SIZE_OFFSET = 26;
const ID_AREA_CHECKSUM_DESIRED_SUM_A_OFFSET = 28;
const ID_AREA_CHECKSUM_DESIRED_SUM_B_OFFSET = 30;
const DEVICE_CONTROLLER_PAK = 0x1;
const BANK_SIZE = 0x1;

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

function getNextPageNumber(inodePageDataView, pageNumber) {
  return inodePageDataView.getUint16(pageNumber * 2, LITTLE_ENDIAN);
}

function setNextPageNumber(inodePageDataView, pageNumber, nextPageNumber) {
  inodePageDataView.setUint16(pageNumber * 2, nextPageNumber, LITTLE_ENDIAN);
}

function createEmptyBlock(size) {
  const arrayBuffer = new ArrayBuffer(size);
  const array = new Uint8Array(arrayBuffer);

  array.fill(0);

  return arrayBuffer;
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
        paddedRawData = Util.concatArrayBuffers([paddedRawData, createEmptyBlock(PAGE_SIZE)]);
      }

      return {
        ...saveFile,
        rawData: paddedRawData,
      };
    }
  }

  return saveFile;
}

function decodeString(uint8Array) {
  // These fixups are made to be compatible with the strings fed to https://github.com/bryc/mempak/blob/master/js/codedb.js
  // in case we want to use those lookup tables.
  // Note that there's only 1 code there (the publisher for Wave Race 64) that actually uses the - at this time,
  // but may as well make the output here match exactly just in case.
  const uint8ArrayFixup = uint8Array.slice();

  const sum = uint8Array.reduce((accumulator, n) => accumulator + n);

  // These indicate that something was corrupted in the file and needs manual fixing
  // This only seems to affect one entry: the publisher for Wave Race 64. We'll maintain this fixup for compatibility with https://github.com/bryc/mempak/blob/master/js/codedb.js
  // FIXME: This repair only affects a copy of the data (a slice) and not the actual data written out
  if (sum === 0) {
    uint8ArrayFixup[uint8ArrayFixup.length - 1] |= 1;
  }

  return {
    stringCode: String.fromCharCode(...uint8Array),
    stringCodeFixup: String.fromCharCode(...uint8ArrayFixup).replace(/\0/g, '-'),
  };
}

function encodeString(string, encodedLength) {
  const output = new Uint8Array(encodedLength);

  output.fill(0);

  for (let i = 0; i < string.length; i += 1) {
    const charCode = string.charCodeAt(i);

    output[i] = ((charCode <= 127) ? charCode : 0);
  }

  return output;
}

// From https://github.com/bryc/mempak/blob/master/js/parser.js#L130
function calculateChecksumsOfBlock(arrayBuffer) {
  const dataView = new DataView(arrayBuffer);

  let sumA = 0x0;
  let sumB = 0xFFF2;

  for (let i = 0; i < ID_AREA_CHECKSUM_LENGTH; i += 2) {
    sumA += dataView.getUint16(i, LITTLE_ENDIAN);
    sumA &= 0xFFFF;
  }

  sumB -= sumA;

  return {
    sumA,
    sumB,
  };
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
    const block = arrayBuffer.slice(offset, offset + ID_AREA_BLOCK_SIZE);
    const { sumA, sumB } = calculateChecksumsOfBlock(block);

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

function randomByte() {
  return 0 | Math.random() * 256;
}

// Based on https://github.com/bryc/mempak/blob/master/js/state.js#L13
function createIdAreaPage() {
  // This page is 4 copies of the same block at different offsets

  const checksumBlock = new ArrayBuffer(ID_AREA_BLOCK_SIZE);
  const checksumBlockDataView = new DataView(checksumBlock);

  checksumBlockDataView.setUint8(1, randomByte() & 0x3F);
  checksumBlockDataView.setUint8(5, randomByte() & 0x7);
  checksumBlockDataView.setUint8(6, randomByte());
  checksumBlockDataView.setUint8(7, randomByte());
  checksumBlockDataView.setUint8(8, randomByte() & 0xF);
  checksumBlockDataView.setUint8(9, randomByte());
  checksumBlockDataView.setUint8(10, randomByte());
  checksumBlockDataView.setUint8(11, randomByte());
  checksumBlockDataView.setUint8(ID_AREA_DEVICE_OFFSET, DEVICE_CONTROLLER_PAK);
  checksumBlockDataView.setUint8(ID_AREA_BANK_SIZE_OFFSET, BANK_SIZE);

  const { sumA, sumB } = calculateChecksumsOfBlock(checksumBlock);

  checksumBlockDataView.setUint16(ID_AREA_CHECKSUM_DESIRED_SUM_A_OFFSET, sumA, LITTLE_ENDIAN);
  checksumBlockDataView.setUint16(ID_AREA_CHECKSUM_DESIRED_SUM_B_OFFSET, sumB, LITTLE_ENDIAN);

  // Now we can make our empty page

  let pageArrayBuffer = new ArrayBuffer(PAGE_SIZE);

  pageArrayBuffer = Util.fillArrayBuffer(pageArrayBuffer, 0);

  // Now copy our block to the various offsets it needs to be at

  ID_AREA_CHECKSUM_OFFSETS.forEach((offset) => {
    pageArrayBuffer = Util.setArrayBufferPortion(pageArrayBuffer, checksumBlock, offset, 0, ID_AREA_BLOCK_SIZE);
  });

  return pageArrayBuffer;
}

function getRegionCode(gameSerialCode) {
  return gameSerialCode.charAt(GAME_SERIAL_CODE_REGION_INDEX);
}

function getMediaCode(gameSerialCode) {
  return gameSerialCode.charAt(GAME_SERIAL_CODE_MEDIA_INDEX);
}

// Taken from https://github.com/bryc/mempak/blob/master/js/parser.js#L173
function readNoteTable(inodePageArrayBuffer, noteTableArrayBuffer) {
  const noteKeys = [];
  const notes = [];

  const noteTableArray = new Uint8Array(noteTableArrayBuffer);

  const noteTableDataView = new DataView(noteTableArrayBuffer);
  const inodePageDataView = new DataView(inodePageArrayBuffer);

  for (let currentByte = 0; currentByte < noteTableArrayBuffer.byteLength; currentByte += NOTE_TABLE_BLOCK_SIZE) {
    const noteIndex = currentByte / NOTE_TABLE_BLOCK_SIZE;

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

      const { stringCode: gameSerialCode, stringCodeFixup: gameSerialCodeFixup } = decodeString(gameSerialCodeArray);
      const { stringCode: publisherCode, stringCodeFixup: publisherCodeFixup } = decodeString(publisherCodeArray);

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

      notes.push({
        noteIndex,
        startingPage,
        gameSerialCode,
        gameSerialCodeFixup,
        publisherCode,
        publisherCodeFixup,
        noteName,
        region: getRegionCode(gameSerialCode),
        media: getMediaCode(gameSerialCode),
      });
    }
  }

  return {
    noteKeys,
    notes,
  };
}

function createNoteTablePage(saveFilesWithStartingPage) {
  const noteBlocks = saveFilesWithStartingPage.map((saveFile) => {
    const noteBlock = createEmptyBlock(NOTE_TABLE_BLOCK_SIZE);
    const noteBlockDataView = new DataView(noteBlock);
    const noteBlockArray = new Uint8Array(noteBlock);

    const noteNameParts = saveFile.noteName.split('.');

    if (noteNameParts.length > 1) {
      const noteNameExtensionEncoded = N64TextDecoder.encode(noteNameParts[1], NOTE_TABLE_NOTE_NAME_EXTENSION_LENGTH);

      noteBlockArray.set(noteNameExtensionEncoded, NOTE_TABLE_NOTE_NAME_EXTENSION_OFFSET);
    }

    const noteNameEncoded = N64TextDecoder.encode(noteNameParts[0], NOTE_TABLE_NOTE_NAME_LENGTH);
    const gameSerialEncoded = encodeString(saveFile.gameSerialCode, NOTE_TABLE_GAME_SERIAL_CODE_LENGTH);
    const publisherCodeEncoded = encodeString(saveFile.publisherCode, NOTE_TABLE_PUBLISHER_CODE_LENGTH);

    noteBlockArray.set(gameSerialEncoded, NOTE_TABLE_GAME_SERIAL_CODE_OFFSET);
    noteBlockArray.set(publisherCodeEncoded, NOTE_TABLE_PUBLISHER_CODE_OFFSET);

    noteBlockDataView.setUint16(NOTE_TABLE_STARTING_PAGE_OFFSET, saveFile.startingPage, LITTLE_ENDIAN);

    noteBlockArray[NOTE_TABLE_STATUS_OFFSET] = NOTE_TABLE_OCCUPIED_BIT;

    noteBlockArray.set(noteNameEncoded, NOTE_TABLE_NOTE_NAME_OFFSET);

    return noteBlock;
  });

  while (noteBlocks.length < NUM_NOTES) {
    noteBlocks.push(createEmptyBlock(NOTE_TABLE_BLOCK_SIZE));
  }

  return Util.concatArrayBuffers(noteBlocks);
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

function createInodeTablePage(saveFiles) {
  // Here we can cheat a little and figure out what the linked list *would* look like if we actually
  // split each file into chunks

  let inodeTablePage = new ArrayBuffer(PAGE_SIZE);
  const startingPages = [];

  inodeTablePage = Util.fillArrayBuffer(inodeTablePage, 0);

  const inodeTablePageDataView = new DataView(inodeTablePage);

  let currentPage = FIRST_SAVE_DATA_PAGE;

  saveFiles.forEach((saveFile) => {
    startingPages.push(currentPage);

    for (let currentByteInFile = 0; currentByteInFile < (saveFile.rawData.byteLength - PAGE_SIZE); currentByteInFile += PAGE_SIZE) {
      setNextPageNumber(inodeTablePageDataView, currentPage, currentPage + 1);
      currentPage += 1;
    }

    setNextPageNumber(inodeTablePageDataView, currentPage, INODE_TABLE_ENTRY_STOP);
    currentPage += 1;
  });

  while (currentPage < NUM_PAGES) {
    setNextPageNumber(inodeTablePageDataView, currentPage, INODE_TABLE_ENTRY_EMPTY);
    currentPage += 1;
  }

  return {
    inodeTablePage,
    startingPages,
  };
}

export default class N64MempackSaveData {
  static NUM_NOTES = NUM_NOTES;

  static GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE = GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE;

  static GAMESHARK_ACTIONREPLAY_CART_SAVE_PUBLISHER_CODE = GAMESHARK_ACTIONREPLAY_CART_SAVE_PUBLISHER_CODE;

  static GAMESHARK_ACTIONREPLAY_CART_SAVE_REGION_CODE = getRegionCode(GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE);

  static GAMESHARK_ACTIONREPLAY_CART_SAVE_MEDIA_CODE = getMediaCode(GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE);

  static BLACKBAG_CART_SAVE_GAME_SERIAL_CODE = BLACKBAG_CART_SAVE_GAME_SERIAL_CODE;

  static BLACKBAG_CART_SAVE_PUBLISHER_CODE = BLACKBAG_CART_SAVE_PUBLISHER_CODE;

  static BLACKBAG_CART_SAVE_REGION_CODE = getRegionCode(BLACKBAG_CART_SAVE_GAME_SERIAL_CODE);

  static BLACKBAG_CART_SAVE_MEDIA_CODE = getMediaCode(BLACKBAG_CART_SAVE_GAME_SERIAL_CODE);

  static createFromN64MempackData(mempackArrayBuffer) {
    return new N64MempackSaveData(mempackArrayBuffer);
  }

  static createFromSaveFiles(saveFiles) {
    // Check to make sure that there's not too many save files, or too much data, or save files the wrong length

    if (saveFiles.length > NUM_NOTES) {
      throw new Error(`Found ${saveFiles.length} notes, but max is ${NUM_NOTES}`);
    }

    const totalSize = saveFiles.reduce((accumulator, x) => accumulator + x.rawData.byteLength);

    if (totalSize > MAX_DATA_SIZE) {
      throw new Error(`Total size of notes is ${totalSize} bytes, but max is ${MAX_DATA_SIZE}`);
    }

    saveFiles.forEach((x) => {
      if (x.rawData.byteLength % PAGE_SIZE !== 0) {
        throw new Error(`All saves must be multiples of ${PAGE_SIZE} bytes, but save '${x.noteName}' is ${x.rawData.byteLength} bytes`);
      }
    });

    // Now make our header pages

    const idAreaPage = createIdAreaPage();
    const { inodeTablePage, startingPages } = createInodeTablePage(saveFiles);

    const saveFilesWithStartingPage = saveFiles.map((x, i) => ({ ...x, startingPage: startingPages[i] }));

    const noteTablePage = createNoteTablePage(saveFilesWithStartingPage);

    // Technically, we should split each save into separate pages, then concat all 128 pages together to get the final
    // arraybuffer. But, we can cheat and just concat the existing saves together instead of splitting them apart first

    let dataPages = Util.concatArrayBuffers(saveFiles.map((x) => x.rawData));

    while (dataPages.byteLength < MAX_DATA_SIZE) {
      dataPages = Util.concatArrayBuffers([dataPages, createEmptyBlock(PAGE_SIZE)]);
    }

    const arrayBuffer = Util.concatArrayBuffers([idAreaPage, inodeTablePage, inodeTablePage, noteTablePage, dataPages]);

    return new N64MempackSaveData(arrayBuffer);
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
    let noteIndexes = {};

    try {
      noteIndexes = checkIndexes(inodeArrayBuffer, noteInfo.noteKeys);

      // If we pass our index checks, then the parimary inode page is good and we can replace the backup with it
      // FIXME: This only affects a copy of the data (a slice) and not the actual data written out
      inodeBackupArrayBuffer = inodeArrayBuffer;
    } catch (e) {
      // If we encounter something that appears to be corrupted in the main inode table, then
      // try again with the backup table
      try {
        noteIndexes = checkIndexes(inodeBackupArrayBuffer, noteInfo.noteKeys);

        // Our primary table is corrupted but our backup is okay, so write the backup over the primary
        // FIXME: This only affects a copy of the data (a slice) and not the actual data written out
        inodeArrayBuffer = inodeBackupArrayBuffer;
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

  static createFilename(saveFile) {
    if (N64MempackSaveData.isCartSave(saveFile)) {
      // Here we want to make a user-friendly name. Note that all files that can fit in a Controller Pak are EEPROM files

      return `${saveFile.noteName}.eep`;
    }

    // We need to encode all the stuff that goes into the note table into our file name

    const noteNameEncoded = Buffer.from(saveFile.noteName, FILENAME_ENCODING).toString('hex');
    const gameSerialCodeEncoded = Buffer.from(saveFile.gameSerialCode, FILENAME_ENCODING).toString('hex');
    const publisherCodeEncoded = Buffer.from(saveFile.publisherCode, FILENAME_ENCODING).toString('hex');

    return `RAW-${noteNameEncoded}-${gameSerialCodeEncoded}-${publisherCodeEncoded}`;
  }

  static parseFilename(filename) {
    if (filename.startsWith('RAW-')) {
      const filenamePortions = filename.split('-');

      try {
        if (filenamePortions.length !== 4) {
          throw new Error('Wrong number of parts in filename');
        }

        const noteName = Buffer.from(filenamePortions[1], 'hex').toString(FILENAME_ENCODING);
        const gameSerialCode = Buffer.from(filenamePortions[2], 'hex').toString(FILENAME_ENCODING);
        const publisherCode = Buffer.from(filenamePortions[3], 'hex').toString(FILENAME_ENCODING);

        return {
          noteName,
          gameSerialCode,
          publisherCode,
        };
      } catch (e) {
        throw new Error('Filename not in correct format. Format should be \'RAW-XXXX-XXXX-XXXX\'');
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

      return {
        noteName: Util.removeFilenameExtension(filename),
        gameSerialCode: GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE,
        publisherCode: GAMESHARK_ACTIONREPLAY_CART_SAVE_PUBLISHER_CODE,
      };
    }
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
