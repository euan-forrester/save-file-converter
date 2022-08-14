import PlatformSaveSizes from '../save-formats/PlatformSaveSizes';

// Thanks to ekeeke on github for their help understanding this!
// https://github.com/ekeeke/Genesis-Plus-GX/issues/449

// This signature appears at the end of every BRAM file
// From https://github.com/ekeeke/Genesis-Plus-GX/blob/master/sdl/sdl1/main.c#L37
const BRAM_FORMAT = [
  0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x00, 0x00, 0x00, 0x00, 0x40,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x53, 0x45, 0x47, 0x41, 0x5f, 0x43, 0x44, 0x5f, 0x52, 0x4f, 0x4d, 0x00, 0x01, 0x00, 0x00, 0x00, // "SEGA_CD_ROM"
  0x52, 0x41, 0x4d, 0x5f, 0x43, 0x41, 0x52, 0x54, 0x52, 0x49, 0x44, 0x47, 0x45, 0x5f, 0x5f, 0x5f, // "RAM_CARTRIDGE___"
];

const BRAM_FORMAT_FIXED_OFFSET = 0x20; // The offset within BRAM_FORMAT where the values don't change even when the file size is different

// These offsets need to be modified to change the size of the file
// From https://github.com/ekeeke/Genesis-Plus-GX/blob/master/sdl/sdl1/main.c#L824
// const BRAM_SIZE_OFFSETS_1 = [ 0x10, 0x12, 0x14, 0x16 ];
// const BRAM_SIZE_OFFSETS_2 = [ 0x11, 0x13, 0x15, 0x17 ];

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
}
