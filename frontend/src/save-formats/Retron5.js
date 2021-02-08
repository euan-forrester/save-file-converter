export default class Retron5SaveData {
  constructor(blob) {
    this.byteLength = blob.byteLength;
  }

  getMagic() {
    return this.byteLength;
  }

  getFormatVersion() {
    return this.byteLength;
  }

  getFlags() {
    return this.byteLength;
  }

  getOriginalSize() {
    return this.byteLength;
  }

  getPackedSize() {
    return this.byteLength;
  }

  getDataOffset() {
    return this.byteLength;
  }

  getCrc32() {
    return this.byteLength;
  }
}
