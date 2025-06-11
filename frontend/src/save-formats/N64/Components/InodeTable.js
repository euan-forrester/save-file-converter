/* eslint-disable no-bitwise */

import Util from '../../../util/util';

import N64Basics from './Basics';

const {
  LITTLE_ENDIAN,
  NUM_PAGES,
  PAGE_SIZE,
  FIRST_SAVE_DATA_PAGE,
} = N64Basics;

const INODE_TABLE_ENTRY_STOP = 1;
const INODE_TABLE_ENTRY_EMPTY = 3;

function setNextPageNumber(inodePageDataView, pageNumber, nextPageNumber) {
  inodePageDataView.setUint16(pageNumber * 2, nextPageNumber, LITTLE_ENDIAN);
}

function getNextPageNumber(inodePageDataView, pageNumber) {
  return inodePageDataView.getUint16(pageNumber * 2, LITTLE_ENDIAN);
}

export default class N64InodeTable {
  static INODE_TABLE_ENTRY_STOP = INODE_TABLE_ENTRY_STOP;

  static getNextPageNumber(inodePageDataView, pageNumber) {
    return getNextPageNumber(inodePageDataView, pageNumber);
  }

  static createInodeTablePage(saveFiles) {
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

  // Taken from https://github.com/bryc/mempak/blob/master/js/parser.js#L269
  //
  // The implementation there performs quite a number of consistency checks on this data, and if
  // an anomoly is found then it switches to using the backup inode page. Because these checks therefore
  // influence how the data is parsed, we'll replicate them here
  static checkIndexes(inodeArrayBuffer, noteTableKeys) {
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
        found.keys.push(currentPage);
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
      throw new Error(`Found ${noteTableKeys.length} starting keys in the note table, but found ${startKeysFound.length} starting keys and ${found.stops.length} stop keys in inode table`);
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
      found.parsed.push(...indexes);
    });

    // Check that we parsed and found the same number of keys
    if (found.parsed.length !== found.keys.length) {
      throw new Error(`We encountered ${found.parsed.length} keys when following the various index sequences, but found ${found.keys.length} keys when looking through the entire inode table.`);
    }

    // We've passed all of our validations, so the last remaining part is the checksums
    // Apparently valid files can have invalid checksums, so we won't actually check the checksums
    // For DexDrive files, we parse the file and then re-create it entirely to avoid having to fix these sorts of things manually

    return noteIndexes;
  }
}
