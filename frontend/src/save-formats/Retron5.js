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

import pako from 'pako';
import crc32 from 'crc-32';

const LITTLE_ENDIAN = true;
const MAGIC = 0x354E5452; // "RTN5", except backwards
const FORMAT_VERSION = 1;
const FLAG_ZLIB_PACKED = 0x01;
const DATA_HEADER_SIZE = 24;

export default class Retron5SaveData {
  constructor(blob) {
    this.blob = blob;
    this.dataView = new DataView(blob);

    // First make sure that the stuff in the header all makes sense

    if (this.getMagic() !== MAGIC) {
      throw new Error(`Invalid data format: magic doesn't match. Expected 0x${MAGIC.toString(16)} but found 0x${this.getMagic().toString(16)}`);
    }

    if (this.getFormatVersion() > FORMAT_VERSION) {
      throw new Error(`Unrecognized format version found in data. Expected version ${FORMAT_VERSION} or less, but found version ${this.getFormatVersion()}`);
    }

    if (this.getDataOffset() !== DATA_HEADER_SIZE) {
      throw new Error(`Invalid data format: expected header size of ${DATA_HEADER_SIZE} bytes but found header size of ${this.getDataOffset()} bytes`);
    }

    const packedDataSize = this.blob.byteLength - DATA_HEADER_SIZE;
    if (this.getPackedSize() !== packedDataSize) {
      throw new Error(`Invalid data format: expected packed data size of ${this.getPackedSize()} bytes but found packed data size of ${packedDataSize} bytes`);
    }

    // Now decompress the saved data and check its size and CRC32

    let rawSaveData = this.blob.slice(this.getDataOffset());
    if ((this.getFlags() & FLAG_ZLIB_PACKED) !== 0) {
      rawSaveData = pako.inflate(rawSaveData);
    }

    if (rawSaveData.byteLength !== this.getOriginalSize()) {
      throw new Error(`Decompressed save buffer to ${rawSaveData.byteLength} bytes but expected ${this.getOriginalSize()} bytes`);
    }

    const checksum = crc32.buf(rawSaveData) >>> 0; // '>>> 0' interprets the result as an unsigned integer: https://stackoverflow.com/questions/1822350/what-is-the-javascript-operator-and-how-do-you-use-it

    if (checksum !== this.getCrc32()) {
      throw new Error(`Expected CRC32 of 0x${this.getCrc32().toString(16)} for save data, but found 0x${checksum.toString(16)}`);
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
}
