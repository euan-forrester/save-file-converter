// EEPROM saves do not need to be endian swapped, but SRAM and Flash RAM saves do

// From http://micro-64.com/database/gamesave.shtml
const EEPROM_SIZES = [512, 2 * 1024];
const SRAM_SIZES = [32 * 1024];
const FLASH_RAM_SIZES = [128 * 1024];

export default class N64Util {
  static needsEndianSwap(arrayBuffer) {
    return !N64Util.isEepromSave(arrayBuffer);
  }

  static isEepromSave(arrayBuffer) {
    return (EEPROM_SIZES.indexOf(arrayBuffer.byteLength) >= 0);
  }

  static isSramSave(arrayBuffer) {
    return (SRAM_SIZES.indexOf(arrayBuffer.byteLength) >= 0);
  }

  static isFlashRamSave(arrayBuffer) {
    return (FLASH_RAM_SIZES.indexOf(arrayBuffer.byteLength) >= 0);
  }

  static getFileExtension(arrayBuffer) {
    if (N64Util.isEepromSave(arrayBuffer)) {
      return 'eep';
    }

    if (N64Util.isSramSave(arrayBuffer)) {
      return 'sra';
    }

    if (N64Util.isFlashRamSave(arrayBuffer)) {
      return 'fla';
    }

    throw new Error(`Unrecognized N64 file size: ${arrayBuffer.byteLength} bytes`);
  }

  static endianSwap(inputArrayBuffer, inputEndianness) {
    const inputLittleEndian = inputEndianness === 'littleToBigEndian';
    const outputLittleEndian = !inputLittleEndian;

    const outputArrayBuffer = new ArrayBuffer(inputArrayBuffer.byteLength);
    const inputDataView = new DataView(inputArrayBuffer);
    const outputDataView = new DataView(outputArrayBuffer);

    if ((inputDataView.byteLength % 4) !== 0) {
      throw new Error('N64 file size must be a multiple of 4 bytes');
    }

    for (let i = 0; i < inputDataView.byteLength / 4; i += 1) {
      const n = inputDataView.getUint32(i * 4, inputLittleEndian);
      outputDataView.setUint32(i * 4, n, outputLittleEndian);
    }

    return outputArrayBuffer;
  }
}
