/* eslint-disable no-bitwise */

import PlatformSaveSizes from '../save-formats/PlatformSaveSizes';
import Util from './util';

// Thanks to ekeeke on github for their help understanding this!
// https://github.com/ekeeke/Genesis-Plus-GX/issues/449

const LITTLE_ENDIAN = false;

// This signature appears at the end of every BRAM file
// From https://github.com/ekeeke/Genesis-Plus-GX/blob/master/sdl/sdl1/main.c#L37
// and https://github.com/superctr/buram/blob/master/buram.c#L702
const BRAM_FORMAT = [
  0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x00, 0x00, 0x00, 0x00, 0x40, // Volume name: "___________", followed by 5 unknown bytes (maybe block size?): https://github.com/superctr/buram/blob/master/buram.c#L707
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // First 8: num free blocks, second 8: num files
  0x53, 0x45, 0x47, 0x41, 0x5f, 0x43, 0x44, 0x5f, 0x52, 0x4f, 0x4d, 0x00, 0x01, 0x00, 0x00, 0x00, // "SEGA_CD_ROM"
  0x52, 0x41, 0x4d, 0x5f, 0x43, 0x41, 0x52, 0x54, 0x52, 0x49, 0x44, 0x47, 0x45, 0x5f, 0x5f, 0x5f, // "RAM_CARTRIDGE___"
];

const BRAM_FORMAT_FIXED_OFFSET = 0x20; // The offset within BRAM_FORMAT where the values don't change even when the file size is different

const DIRECTORY_REPEAT_COUNT = 4;
const DIRECTORY_NUM_FREE_BLOCKS_OFFSET = 0x10;
const DIRECTORY_NUM_FILES_OFFSET = 0x18;

const BLOCK_SIZE = 0x40;
const NUM_RESERVED_BLOCKS = 3; // The first block is reserved, the last block contains the BRAM_FORMAT, and there's one more reserved for the first file to be written: https://github.com/superctr/buram/blob/master/buram.c#L713

const DIRECTORY_SIZE = 0x40; // A block
const DIRECTORY_ENTRY_SIZE = 0x20; // Half a block

// Taken from https://github.com/superctr/buram/blob/master/buram.c#L470
function readRepeatCode(arrayBuffer, offsetFromDirectory) {
  const startOffset = arrayBuffer.byteLength - DIRECTORY_SIZE + offsetFromDirectory;
  const dataView = new DataView(arrayBuffer);
  const codesFound = new Uint16Array(DIRECTORY_REPEAT_COUNT);

  let currentOffset = startOffset;

  for (let i = 0; i < DIRECTORY_REPEAT_COUNT; i += 1) {
    codesFound[i] = dataView.getUint16(currentOffset, LITTLE_ENDIAN);
    currentOffset += 2;
  }

  for (let i = 0; i < (DIRECTORY_REPEAT_COUNT / 2); i += 1) {
    let repeats = 0;

    for (let j = i + 1; j < DIRECTORY_REPEAT_COUNT; j += 1) {
      if (codesFound[i] === codesFound[j]) {
        repeats += 1;
      }
    }

    if (repeats > (DIRECTORY_REPEAT_COUNT / 2)) {
      return codesFound[i];
    }
  }

  throw new Error(`Unable to find repeat code at offset from directory 0x${offsetFromDirectory.toString(16)}`);
}

// Taken from https://github.com/superctr/buram/blob/master/buram.c#L498
function writeRepeatCode(arrayBuffer, offsetFromDirectory, value) {
  const startOffset = arrayBuffer.byteLength - DIRECTORY_SIZE + offsetFromDirectory;
  const dataView = new DataView(arrayBuffer);

  let currentOffset = startOffset;

  for (let i = 0; i < DIRECTORY_REPEAT_COUNT; i += 1) {
    dataView.setUint16(currentOffset, value, LITTLE_ENDIAN);
    currentOffset += 2;
  }
}

// Based on https://github.com/superctr/buram/blob/master/buram.c#L702
function fillInNewSize(bramFormat, newSize) {
  const totalFreeBlocks = (newSize / BLOCK_SIZE) - NUM_RESERVED_BLOCKS;

  writeRepeatCode(bramFormat, DIRECTORY_NUM_FREE_BLOCKS_OFFSET, totalFreeBlocks);
}

export default class SegaCdUtil {
  static INTERNAL_SAVE_SIZE = 8192; // Regardless of platform (mister/flash cart/emulator/etc the internal save size is always the same: it was 8kB in the original hardware. Although only one size of RAM cart was manufactured, many sizes are theoretically possible and so different platforms choose different ones)

  static getActualSize(inputArrayBuffer) {
    // We can have files that are padded out at the end, despite having the signature earlier in the file. Such a file
    // can only store data up until its signature, making that its 'true' size.
    //
    // So, try to find the second half of BRAM_FORMAT (which doesn't change) where the end would be for each possible save size
    const inputUint8Array = new Uint8Array(inputArrayBuffer);

    const sizeIndex = PlatformSaveSizes.segacd.findIndex(
      (size) => BRAM_FORMAT.slice(BRAM_FORMAT_FIXED_OFFSET).every(
        (byte, index) => (byte === inputUint8Array[size - BRAM_FORMAT_FIXED_OFFSET + index]),
      ),
    );

    if (sizeIndex === -1) {
      throw new Error('This does not appear to be a Sega CD save file');
    }

    return PlatformSaveSizes.segacd[sizeIndex];
  }

  static isCorrectlyFormatted(inputArrayBuffer) {
    try {
      SegaCdUtil.getActualSize(inputArrayBuffer);
    } catch (e) {
      return false;
    }

    return true;
  }

  static truncateToActualSize(inputArrayBuffer) {
    return inputArrayBuffer.slice(0, SegaCdUtil.getActualSize(inputArrayBuffer));
  }

  static makeEmptySave(size) {
    // An empty save buffer is all 0's with the BRAM_FORMAT at the end and the file size correctly encoded:
    // https://github.com/ekeeke/Genesis-Plus-GX/issues/449
    // https://github.com/superctr/buram/blob/master/buram.c#L702
    const initialData = Util.getFilledArrayBuffer(size - BRAM_FORMAT.length, 0x00);
    const bramFormat = new ArrayBuffer(BRAM_FORMAT.length);
    const bramFormatUint8Array = new Uint8Array(bramFormat);

    BRAM_FORMAT.forEach((byte, index) => { bramFormatUint8Array[index] = byte; });

    fillInNewSize(bramFormat, size);

    return Util.concatArrayBuffers([initialData, bramFormat]);
  }

  static getNumFiles(inputArrayBuffer) {
    return readRepeatCode(inputArrayBuffer, DIRECTORY_NUM_FILES_OFFSET);
  }

  static getNumFreeBlocks(inputArrayBuffer) {
    return readRepeatCode(inputArrayBuffer, DIRECTORY_NUM_FREE_BLOCKS_OFFSET);
  }

  static setNumFiles(inputArrayBuffer, value) {
    writeRepeatCode(inputArrayBuffer, DIRECTORY_NUM_FILES_OFFSET, value);
  }

  static setNumFreeBlocks(inputArrayBuffer, value) {
    writeRepeatCode(inputArrayBuffer, DIRECTORY_NUM_FREE_BLOCKS_OFFSET, value);
  }

  static resize(inputArrayBuffer, newSize) {
    if (PlatformSaveSizes.segacd.indexOf(newSize) === -1) {
      throw new Error(`${newSize} bytes is not a valid size for a Sega CD save`);
    }

    const inputArrayBufferActualSize = SegaCdUtil.truncateToActualSize(inputArrayBuffer);

    if (newSize === inputArrayBufferActualSize.byteLength) {
      return inputArrayBufferActualSize;
    }

    // We need to change the size

    // Begin by finding out how many saves are in the file. This determines the length of the footer info
    // at the end of the file

    const numFiles = SegaCdUtil.getNumFiles(inputArrayBufferActualSize);
    const footerLength = (numFiles + 1) * DIRECTORY_ENTRY_SIZE;

    // Next divide up the file into its components

    const bramFormatOffset = inputArrayBufferActualSize.byteLength - BRAM_FORMAT.length;
    const footerOffset = bramFormatOffset - footerLength;
    const initialData = inputArrayBufferActualSize.slice(0, footerOffset);
    const footerData = inputArrayBufferActualSize.slice(footerOffset, footerOffset + footerLength);
    const bramFormat = inputArrayBufferActualSize.slice(bramFormatOffset);

    // Now change the bytes in bramFormat to reflect the new size
    // From https://github.com/ekeeke/Genesis-Plus-GX/blob/master/sdl/sdl1/main.c#L824

    fillInNewSize(bramFormat, newSize);

    if (newSize > inputArrayBufferActualSize.byteLength) {
      // Make the file bigger by splicing in a blank block just before the footer and BRAM_FORMAT
      const blankArrayBuffer = Util.getFilledArrayBuffer(newSize - inputArrayBufferActualSize.byteLength, 0x00);

      return Util.concatArrayBuffers([initialData, blankArrayBuffer, footerData, bramFormat]);
    }

    // Make the file smaller by removing the last portion of initialData

    const numBytesToRemove = inputArrayBufferActualSize.byteLength - newSize;
    const initialDataSmallerLength = initialData.byteLength - numBytesToRemove;

    const initialDataSmaller = initialData.slice(0, initialDataSmallerLength);

    // Throw an error if the removed portion contains any data

    const dataRemoved = initialData.slice(initialDataSmallerLength);
    const dataRemovedUint8Array = new Uint8Array(dataRemoved); // Could use a bigger data type to require less iterations, but then need to check if the length here is a multiple of that datatype
    dataRemovedUint8Array.forEach((byte) => {
      if ((byte !== 0x00) && (byte !== 0xFF)) throw new Error(`Cannot resize file down to ${newSize} bytes because it would remove a portion that contains game data`);
    });

    // All good, so put the file back together

    return Util.concatArrayBuffers([initialDataSmaller, footerData, bramFormat]);
  }
}
