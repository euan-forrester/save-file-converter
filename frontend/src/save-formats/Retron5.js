/* eslint no-bitwise: ["error", { "allow": ["&"] }] */

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

const pako = import('pako');

const LITTLE_ENDIAN = true;
const FLAG_ZLIB_PACKED = 0x01;

export default class Retron5SaveData {
  constructor(blob) {
    this.blob = blob;
    this.dataView = new DataView(blob);
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
    const rawSaveData = this.blob.slice(this.getDataOffset());
    if ((this.getFlags() & FLAG_ZLIB_PACKED) === 0) {
      return rawSaveData;
    }

    const uncompressedSaveData = pako.inflate(rawSaveData);

    return uncompressedSaveData;
  }
}
