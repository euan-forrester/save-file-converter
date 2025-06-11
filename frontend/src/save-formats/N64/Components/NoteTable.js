/* eslint-disable no-bitwise */

import Util from '../../../util/util';

import N64TextDecoder from '../TextDecoder';

import N64Basics from './Basics';
import N64InodeTable from './InodeTable';
import N64GameSerialCodeUtil from './GameSerialCodeUtil';

const {
  LITTLE_ENDIAN,
  NUM_NOTES,
  NUM_PAGES,
  FIRST_SAVE_DATA_PAGE,
} = N64Basics;

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

    output[i] = ((charCode <= 255) ? charCode : 0);
  }

  return output;
}

export default class N64NoteTable {
  static createNoteTablePage(saveFilesWithStartingPage) {
    const noteBlocks = saveFilesWithStartingPage.map((saveFile) => {
      const noteBlock = N64Basics.createEmptyBlock(NOTE_TABLE_BLOCK_SIZE);
      const noteBlockDataView = new DataView(noteBlock);
      const noteBlockArray = new Uint8Array(noteBlock);

      const noteNameEncoded = N64TextDecoder.encode(saveFile.noteName, NOTE_TABLE_NOTE_NAME_LENGTH);
      const noteNameExtensionEncoded = N64TextDecoder.encode(saveFile.noteNameExtension, NOTE_TABLE_NOTE_NAME_EXTENSION_LENGTH);

      const gameSerialEncoded = encodeString(saveFile.gameSerialCode, NOTE_TABLE_GAME_SERIAL_CODE_LENGTH);
      const publisherCodeEncoded = encodeString(saveFile.publisherCode, NOTE_TABLE_PUBLISHER_CODE_LENGTH);

      noteBlockArray.set(gameSerialEncoded, NOTE_TABLE_GAME_SERIAL_CODE_OFFSET);
      noteBlockArray.set(publisherCodeEncoded, NOTE_TABLE_PUBLISHER_CODE_OFFSET);

      noteBlockDataView.setUint16(NOTE_TABLE_STARTING_PAGE_OFFSET, saveFile.startingPage, LITTLE_ENDIAN);

      noteBlockArray[NOTE_TABLE_STATUS_OFFSET] = NOTE_TABLE_OCCUPIED_BIT;

      noteBlockArray.set(noteNameEncoded, NOTE_TABLE_NOTE_NAME_OFFSET);
      noteBlockArray.set(noteNameExtensionEncoded, NOTE_TABLE_NOTE_NAME_EXTENSION_OFFSET);

      return noteBlock;
    });

    while (noteBlocks.length < NUM_NOTES) {
      noteBlocks.push(N64Basics.createEmptyBlock(NOTE_TABLE_BLOCK_SIZE));
    }

    return Util.concatArrayBuffers(noteBlocks);
  }

  // Taken from https://github.com/bryc/mempak/blob/master/js/parser.js#L173
  static readNoteTable(inodePageArrayBuffer, noteTableArrayBuffer) {
    const noteKeys = [];
    const notes = [];

    const noteTableArray = new Uint8Array(noteTableArrayBuffer);

    const noteTableDataView = new DataView(noteTableArrayBuffer);
    const inodePageDataView = new DataView(inodePageArrayBuffer);

    for (let currentByte = 0; currentByte < noteTableArrayBuffer.byteLength; currentByte += NOTE_TABLE_BLOCK_SIZE) {
      const noteIndex = currentByte / NOTE_TABLE_BLOCK_SIZE;

      const startingPage = noteTableDataView.getUint16(currentByte + NOTE_TABLE_STARTING_PAGE_OFFSET, LITTLE_ENDIAN);
      const nextPage = N64InodeTable.getNextPageNumber(inodePageDataView, startingPage);

      const firstPageValid = (startingPage >= FIRST_SAVE_DATA_PAGE) && (startingPage < NUM_PAGES);
      const unusedBytesAreZero = (noteTableDataView.getUint16(currentByte + NOTE_TABLE_UNUSED_OFFSET, LITTLE_ENDIAN) === 0);
      const nextPageValid = (nextPage === N64InodeTable.INODE_TABLE_ENTRY_STOP) || ((nextPage >= FIRST_SAVE_DATA_PAGE) && (nextPage < NUM_PAGES));

      if (firstPageValid && unusedBytesAreZero && nextPageValid) {
        noteKeys.push(startingPage);

        const gameSerialCodeArray = noteTableArray.slice(currentByte + NOTE_TABLE_GAME_SERIAL_CODE_OFFSET, currentByte + NOTE_TABLE_GAME_SERIAL_CODE_OFFSET + NOTE_TABLE_GAME_SERIAL_CODE_LENGTH);
        const publisherCodeArray = noteTableArray.slice(currentByte + NOTE_TABLE_PUBLISHER_CODE_OFFSET, currentByte + NOTE_TABLE_PUBLISHER_CODE_OFFSET + NOTE_TABLE_PUBLISHER_CODE_LENGTH);

        const { stringCode: gameSerialCode, stringCodeFixup: gameSerialCodeFixup } = decodeString(gameSerialCodeArray);
        const { stringCode: publisherCode, stringCodeFixup: publisherCodeFixup } = decodeString(publisherCodeArray);

        const noteName = N64TextDecoder.decode(
          noteTableArray.slice(
            currentByte + NOTE_TABLE_NOTE_NAME_OFFSET,
            currentByte + NOTE_TABLE_NOTE_NAME_OFFSET + NOTE_TABLE_NOTE_NAME_LENGTH,
          ),
        );

        const noteNameExtension = N64TextDecoder.decode(
          noteTableArray.slice(
            currentByte + NOTE_TABLE_NOTE_NAME_EXTENSION_OFFSET,
            currentByte + NOTE_TABLE_NOTE_NAME_EXTENSION_OFFSET + NOTE_TABLE_NOTE_NAME_EXTENSION_LENGTH,
          ),
        );

        notes.push({
          noteIndex,
          startingPage,
          gameSerialCode,
          gameSerialCodeFixup,
          publisherCode,
          publisherCodeFixup,
          noteName,
          noteNameExtension,
          region: N64GameSerialCodeUtil.getRegionCode(gameSerialCode),
          regionName: N64GameSerialCodeUtil.getRegionName(gameSerialCode),
          media: N64GameSerialCodeUtil.getMediaCode(gameSerialCode),
        });
      }
    }

    return {
      noteKeys,
      notes,
    };
  }
}
