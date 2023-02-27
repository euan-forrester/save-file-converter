// N64 saves on NSO have opposite endianness to emulator saves for SRAM and FlashRAM files. EEPROM files do not need to be endian swapped

import N64Util from '../../util/N64';
import SaveFilesUtil from '../../util/SaveFiles';

export default class NsoN64SaveData {
  static createFromNsoData(nsoArrayBuffer) {
    const rawArrayBuffer = N64Util.needsEndianSwap(nsoArrayBuffer) ? N64Util.endianSwap(nsoArrayBuffer, 'bigToLittleEndian') : nsoArrayBuffer;

    return new NsoN64SaveData(nsoArrayBuffer, rawArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    const nsoArrayBuffer = N64Util.needsEndianSwap(rawArrayBuffer) ? N64Util.endianSwap(rawArrayBuffer, 'littleToBigEndian') : rawArrayBuffer;

    return new NsoN64SaveData(nsoArrayBuffer, rawArrayBuffer);
  }

  static createWithNewSize(n64FlashCartSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(n64FlashCartSaveData.getRawArrayBuffer(), newSize);

    return NsoN64SaveData.createFromRawData(newRawSaveData);
  }

  static getNsoFileExtension() {
    return 'sram';
  }

  static getRawFileExtension(rawArrayBuffer) {
    return N64Util.getFileExtension(rawArrayBuffer);
  }

  static adjustOutputSizesPlatform() {
    return 'n64';
  }

  constructor(nsoArrayBuffer, rawArrayBuffer) {
    this.nsoArrayBuffer = nsoArrayBuffer;
    this.rawArrayBuffer = rawArrayBuffer;
  }

  getRawArrayBuffer() {
    return this.rawArrayBuffer;
  }

  getNsoArrayBuffer() {
    return this.nsoArrayBuffer;
  }
}
