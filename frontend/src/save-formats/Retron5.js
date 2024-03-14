/* eslint no-bitwise: ["error", { "allow": ["&", ">>>"] }] */

/*
The Retron5 data format is:

typedef struct
{
   uint32_t magic;
   uint16_t fmtVer;
   uint16_t flags;
   uint32_t origSize;
   uint32_t packed_size;
   uint32_t data_offset;
   uint32_t crc32;
   uint8_t data[0];
} t_retronDataHdr;
*/

import crc32 from 'crc-32';
import Util from '../util/util';
import MathUtil from '../util/Math';
import PaddingUtil from '../util/Padding';
import CompressionZlibUtil from '../util/CompressionZlib';

const LITTLE_ENDIAN = true;
const MAGIC = 0x354E5452; // "RTN5", except backwards
const FORMAT_VERSION = 1;
const FLAG_ZLIB_PACKED = 0x01;
const DATA_HEADER_SIZE = 24;

export default class Retron5SaveData {
  static createFromRetron5Data(retron5ArrayBuffer) {
    return new Retron5SaveData(retron5ArrayBuffer);
  }

  static createFromEmulatorData(emulatorArrayBuffer) {
    const originalChecksum = crc32.buf(new Uint8Array(emulatorArrayBuffer)) >>> 0; // '>>> 0' interprets the result as an unsigned integer: https://stackoverflow.com/questions/1822350/what-is-the-javascript-operator-and-how-do-you-use-it
    const originalSize = emulatorArrayBuffer.byteLength;

    const packedArrayBuffer = CompressionZlibUtil.compress(emulatorArrayBuffer);

    const retron5HeaderArrayBuffer = new ArrayBuffer(DATA_HEADER_SIZE); // Need to have an ArrayBuffer with a size as a multiple of 4 to have a Uint32View into it, so need to have a separate one for the header

    const headerUint32View = new Uint32Array(retron5HeaderArrayBuffer);
    const headerUint16View = new Uint16Array(retron5HeaderArrayBuffer);

    headerUint32View[0] = MAGIC;
    headerUint16View[2] = FORMAT_VERSION;
    headerUint16View[3] = FLAG_ZLIB_PACKED;
    headerUint32View[2] = originalSize;
    headerUint32View[3] = packedArrayBuffer.byteLength;
    headerUint32View[4] = DATA_HEADER_SIZE;
    headerUint32View[5] = originalChecksum;

    const retron5ArrayBuffer = Util.concatArrayBuffers([retron5HeaderArrayBuffer, packedArrayBuffer]);

    // A bit inefficient to promptly go and decompress and re-CRC32 the save data
    return new Retron5SaveData(retron5ArrayBuffer);
  }

  // This constructor creates a new object from a binary representation of a Retron5 save data file
  constructor(arrayBuffer) {
    this.arrayBuffer = arrayBuffer;
    this.dataView = new DataView(arrayBuffer);

    // First make sure that the stuff in the header all makes sense

    if (this.getMagic() !== MAGIC) {
      throw new Error('This does not appear to be a Retron5 save file');
    }

    if (this.getFormatVersion() > FORMAT_VERSION) {
      throw new Error('Sorry this tool does not support this format of Retron5 save files');
    }

    if (this.getDataOffset() !== DATA_HEADER_SIZE) {
      throw new Error('Sorry this file appears to be corrupted');
    }

    const packedDataSize = this.arrayBuffer.byteLength - DATA_HEADER_SIZE;
    if (this.getPackedSize() !== packedDataSize) {
      throw new Error('Sorry this file appears to be corrupted');
    }

    // Now decompress the saved data and check its size and CRC32

    let rawSaveData = new Uint8Array(this.arrayBuffer.slice(this.getDataOffset()));
    if ((this.getFlags() & FLAG_ZLIB_PACKED) !== 0) {
      rawSaveData = CompressionZlibUtil.decompress(rawSaveData);
    }

    if (rawSaveData.byteLength !== this.getOriginalSize()) {
      throw new Error('Sorry this file appears to be corrupted');
    }

    const checksum = crc32.buf(rawSaveData) >>> 0; // '>>> 0' interprets the result as an unsigned integer: https://stackoverflow.com/questions/1822350/what-is-the-javascript-operator-and-how-do-you-use-it

    if (checksum !== this.getCrc32()) {
      throw new Error('Sorry this file appears to be corrupted');
    }

    // Lastly check for extra padding at the beginning
    //
    // So far one user has provided a file which decompressed to 0x22000 bytes and the first 0x20000 bytes were
    // just all 0x00. Slicing out the final 0x2000 bytes resulted in a file that loads correctly in an emulator.

    if (!MathUtil.isPowerOf2(rawSaveData.byteLength)) {
      const padding = PaddingUtil.getPadFromStartValueAndCount(rawSaveData);

      // Note that this will catch padding values of 0x00 or 0xFF, but we've only seen 1 file in the wild and it
      // had a padding value of 0x00. Not sure if we should restrict this to only check for that.

      if (padding.count > 0) {
        rawSaveData = PaddingUtil.removePaddingFromStart(rawSaveData, padding.count);
      }
    }

    // Everything looks good

    this.rawSaveData = rawSaveData;
  }

  getMagic() {
    return this.dataView.getUint32(0, LITTLE_ENDIAN);
  }

  getFormatVersion() {
    return this.dataView.getUint16(4, LITTLE_ENDIAN);
  }

  getFlags() {
    return this.dataView.getUint16(6, LITTLE_ENDIAN);
  }

  getOriginalSize() {
    return this.dataView.getUint32(8, LITTLE_ENDIAN);
  }

  getPackedSize() {
    return this.dataView.getUint32(12, LITTLE_ENDIAN);
  }

  getDataOffset() {
    return this.dataView.getUint32(16, LITTLE_ENDIAN);
  }

  getCrc32() {
    return this.dataView.getUint32(20, LITTLE_ENDIAN);
  }

  getRawSaveData() {
    return this.rawSaveData;
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
