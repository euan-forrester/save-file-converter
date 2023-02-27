// Genesis files on NSO are not byte-expanded like other emulators

import SaveFilesUtil from '../../util/SaveFiles';
import GenesisUtil from '../../util/Genesis';

const EMULATOR_BYTE_EXPAND_FILL_BYTE = 0x00;

export default class GenesisNsoSaveData {
  static createFromNsoData(nsoArrayBuffer) {
    if (GenesisUtil.isEepromSave(nsoArrayBuffer)) {
      // If it's an EEPROM save, an emulator will want it to not be byte expanded
      return new GenesisNsoSaveData(nsoArrayBuffer, nsoArrayBuffer);
    }

    // Now that the padding is gone, we can proceed
    const rawArrayBuffer = GenesisUtil.byteExpand(nsoArrayBuffer, EMULATOR_BYTE_EXPAND_FILL_BYTE);

    return new GenesisNsoSaveData(nsoArrayBuffer, rawArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    let nsoArrayBuffer = rawArrayBuffer;

    if (GenesisUtil.isByteExpanded(rawArrayBuffer)) {
      nsoArrayBuffer = GenesisUtil.byteCollapse(rawArrayBuffer);
    }

    return new GenesisNsoSaveData(nsoArrayBuffer, rawArrayBuffer);
  }

  static createWithNewSize(nsoSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(nsoSaveData.getRawArrayBuffer(), newSize);

    return GenesisNsoSaveData.createFromRawData(newRawSaveData);
  }

  static getNsoFileExtension() {
    return 'sram';
  }

  static getRawFileExtension() {
    return 'sav';
  }

  static adjustOutputSizesPlatform() {
    return 'genesis';
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
