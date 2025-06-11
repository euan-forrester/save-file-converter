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
import Util from '../../util/util';
import MathUtil from '../../util/Math';
import PaddingUtil from '../../util/Padding';
import CompressionZlibUtil from '../../util/CompressionZlib';

const LITTLE_ENDIAN = true;

const MAGIC = 'RTN5';
const MAGIC_ENCODING = 'US-ASCII';
const FORMAT_VERSION = 1;
const FLAG_ZLIB_PACKED = 0x01;

const MAGIC_OFFSET = 0;
const FORMAT_VERSION_OFFSET = 4;
const FLAGS_OFFSET = 6;
const ORIGINAL_SIZE_OFFSET = 8;
const PACKED_SIZE_OFFSET = 12;
const DATA_OFFSET_OFFSET = 16;
const CRC32_OFFSET = 20;

const HEADER_SIZE = 24;

export default class Retron5SaveData {
  static createFromRetron5Data(retron5ArrayBuffer) {
    const dataView = new DataView(retron5ArrayBuffer);

    // First make sure that the stuff in the header all makes sense

    Util.checkMagic(retron5ArrayBuffer, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);

    const formatVersion = dataView.getUint16(FORMAT_VERSION_OFFSET, LITTLE_ENDIAN);
    const flags = dataView.getUint16(FLAGS_OFFSET, LITTLE_ENDIAN);
    const originalSize = dataView.getUint32(ORIGINAL_SIZE_OFFSET, LITTLE_ENDIAN);
    const packedSize = dataView.getUint32(PACKED_SIZE_OFFSET, LITTLE_ENDIAN);
    const dataOffset = dataView.getUint32(DATA_OFFSET_OFFSET, LITTLE_ENDIAN);
    const checksumRead = dataView.getUint32(CRC32_OFFSET, LITTLE_ENDIAN);

    if (formatVersion > FORMAT_VERSION) {
      throw new Error('Sorry this tool does not support this format of Retron5 save files');
    }

    if (dataOffset !== HEADER_SIZE) {
      throw new Error('Sorry this file appears to be corrupted');
    }

    const dataSize = retron5ArrayBuffer.byteLength - HEADER_SIZE;
    if (packedSize !== dataSize) {
      throw new Error('Sorry this file appears to be corrupted');
    }

    // Now decompress the saved data and check its size and CRC32

    let rawArrayBuffer = new Uint8Array(retron5ArrayBuffer.slice(dataOffset));
    if ((flags & FLAG_ZLIB_PACKED) !== 0) {
      rawArrayBuffer = CompressionZlibUtil.decompress(rawArrayBuffer);
    }

    if (rawArrayBuffer.byteLength !== originalSize) {
      throw new Error('Sorry this file appears to be corrupted');
    }

    const checksumCalculated = crc32.buf(rawArrayBuffer) >>> 0; // '>>> 0' interprets the result as an unsigned integer: https://stackoverflow.com/questions/1822350/what-is-the-javascript-operator-and-how-do-you-use-it

    if (checksumCalculated !== checksumRead) {
      throw new Error('Sorry this file appears to be corrupted');
    }

    // Lastly check for extra padding at the beginning
    //
    // So far one user has provided a file which decompressed to 0x22000 bytes and the first 0x20000 bytes were
    // just all 0x00. Slicing out the final 0x2000 bytes resulted in a file that loads correctly in an emulator.

    if (!MathUtil.isPowerOf2(rawArrayBuffer.byteLength)) {
      const padding = PaddingUtil.getPadFromStartValueAndCount(rawArrayBuffer);

      // Note that this will catch padding values of 0x00 or 0xFF, but we've only seen 1 file in the wild and it
      // had a padding value of 0x00. Not sure if we should restrict this to only check for that.

      if (padding.count > 0) {
        rawArrayBuffer = PaddingUtil.removePaddingFromStart(rawArrayBuffer, padding.count);
      }
    }

    // Everything looks good

    return new Retron5SaveData(retron5ArrayBuffer, rawArrayBuffer);
  }

  static createFromEmulatorData(rawArrayBuffer) {
    const originalChecksum = crc32.buf(new Uint8Array(rawArrayBuffer)) >>> 0; // '>>> 0' interprets the result as an unsigned integer: https://stackoverflow.com/questions/1822350/what-is-the-javascript-operator-and-how-do-you-use-it

    const packedArrayBuffer = CompressionZlibUtil.compress(rawArrayBuffer);

    let headerArrayBuffer = new ArrayBuffer(HEADER_SIZE); // Need to have an ArrayBuffer with a size as a multiple of 4 to have a Uint32View into it, so need to have a separate one for the header

    headerArrayBuffer = Util.setMagic(headerArrayBuffer, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);

    const headerDataView = new DataView(headerArrayBuffer);

    headerDataView.setUint16(FORMAT_VERSION_OFFSET, FORMAT_VERSION, LITTLE_ENDIAN);
    headerDataView.setUint16(FLAGS_OFFSET, FLAG_ZLIB_PACKED, LITTLE_ENDIAN);
    headerDataView.setUint32(ORIGINAL_SIZE_OFFSET, rawArrayBuffer.byteLength, LITTLE_ENDIAN);
    headerDataView.setUint32(PACKED_SIZE_OFFSET, packedArrayBuffer.byteLength, LITTLE_ENDIAN);
    headerDataView.setUint32(DATA_OFFSET_OFFSET, HEADER_SIZE, LITTLE_ENDIAN);
    headerDataView.setUint32(CRC32_OFFSET, originalChecksum, LITTLE_ENDIAN);

    const retron5ArrayBuffer = Util.concatArrayBuffers([headerArrayBuffer, packedArrayBuffer]);

    return new Retron5SaveData(retron5ArrayBuffer, rawArrayBuffer);
  }

  constructor(retron5ArrayBuffer, rawArrayBuffer) {
    this.retron5ArrayBuffer = retron5ArrayBuffer;
    this.rawArrayBuffer = rawArrayBuffer;
  }

  getRawArrayBuffer() {
    return this.rawArrayBuffer;
  }

  getRetron5ArrayBuffer() {
    return this.retron5ArrayBuffer;
  }
}
