/* eslint-disable no-bitwise */

import PlatformSaveSizes from '../save-formats/PlatformSaveSizes';
import Util from './util';

// Thanks to ekeeke on github for their help understanding this!
// https://github.com/ekeeke/Genesis-Plus-GX/issues/449

// This signature appears at the end of every BRAM file
// From https://github.com/ekeeke/Genesis-Plus-GX/blob/master/sdl/sdl1/main.c#L37
const BRAM_FORMAT = [
  0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x00, 0x00, 0x00, 0x00, 0x40,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // The first 8 of these change depending on the size of the file (see below)
  0x53, 0x45, 0x47, 0x41, 0x5f, 0x43, 0x44, 0x5f, 0x52, 0x4f, 0x4d, 0x00, 0x01, 0x00, 0x00, 0x00, // "SEGA_CD_ROM"
  0x52, 0x41, 0x4d, 0x5f, 0x43, 0x41, 0x52, 0x54, 0x52, 0x49, 0x44, 0x47, 0x45, 0x5f, 0x5f, 0x5f, // "RAM_CARTRIDGE___"
];

const BRAM_FORMAT_FIXED_OFFSET = 0x20; // The offset within BRAM_FORMAT where the values don't change even when the file size is different

const FOOTER_LENGTH = 0x40; // There appears to be another footer before the BRAM_FORMAT bytes

// These offsets need to be modified to change the size of the file
// From https://github.com/ekeeke/Genesis-Plus-GX/blob/master/sdl/sdl1/main.c#L824
const BRAM_SIZE_OFFSETS_1 = [0x10, 0x12, 0x14, 0x16];
const BRAM_SIZE_OFFSETS_2 = [0x11, 0x13, 0x15, 0x17];

export default class SegaCdUtil {
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

  static truncateToActualSize(inputArrayBuffer) {
    return inputArrayBuffer.slice(0, SegaCdUtil.getActualSize(inputArrayBuffer));
  }

  static resize(inputArrayBuffer, newSize) {
    if (PlatformSaveSizes.segacd.indexOf(newSize) === -1) {
      throw new Error(`${newSize} bytes is not a valid size for a Sega CD save`);
    }

    const inputArrayBufferActualSize = SegaCdUtil.truncateToActualSize(inputArrayBuffer);

    if (newSize > inputArrayBufferActualSize.byteLength) {
      // Splice in a blank block just before the footer and BRAM_FORMAT
      const footerOffset = inputArrayBufferActualSize.byteLength - FOOTER_LENGTH - BRAM_FORMAT.length;
      const bramFormatOffset = footerOffset + FOOTER_LENGTH;
      const initialData = inputArrayBufferActualSize.slice(0, footerOffset);
      const footerData = inputArrayBufferActualSize.slice(footerOffset, footerOffset + FOOTER_LENGTH);
      const bramFormat = inputArrayBufferActualSize.slice(bramFormatOffset);

      const blankArrayBuffer = Util.getFilledArrayBuffer(newSize - inputArrayBufferActualSize.byteLength, 0x00);

      // Now change the bytes in bramFormat to reflect the new size
      // From https://github.com/ekeeke/Genesis-Plus-GX/blob/master/sdl/sdl1/main.c#L824

      const bramFormatUint8Array = new Uint8Array(bramFormat);

      BRAM_SIZE_OFFSETS_1.forEach((offset) => { bramFormatUint8Array[offset] = (((newSize / 64) - 3) >> 8); });
      BRAM_SIZE_OFFSETS_2.forEach((offset) => { bramFormatUint8Array[offset] = (((newSize / 64) - 3) & 0xFF); });

      return Util.concatArrayBuffers([initialData, blankArrayBuffer, footerData, bramFormat]);
    }

    return inputArrayBufferActualSize; // FIXME: Need to resize downward
  }
}
