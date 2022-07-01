import SaveFilesUtil from '../../../../util/SaveFiles';
import GenesisUtil from '../../../../util/Genesis';

const MEGA_SD_FILL_BYTE = 0xFF; // Mega SD files are byte expanded with a fill byte of 0xFF
const RAW_FILL_BYTE = 0x00;

export default class GenesisMegaSdGenesisFlashCartSaveData {
  static createFromFlashCartData(flashCartArrayBuffer) {
    // Here we know we're being passed a file that's byte-expanded with 0xFF

    const rawArrayBuffer = GenesisUtil.changeFillByte(flashCartArrayBuffer, RAW_FILL_BYTE);

    return new GenesisMegaSdGenesisFlashCartSaveData(flashCartArrayBuffer, rawArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    // Collapse then re-expand the data to account for cases where we're passed a Retrode-style file (with repeated bytes),
    // or a Mega Everdrive Pro/emulator-style file (filled with 0x00 instead), and then re-fill it with 0xFF as the Mega SD expects

    const flashCartArrayBuffer = GenesisUtil.changeFillByte(rawArrayBuffer, MEGA_SD_FILL_BYTE);

    return new GenesisMegaSdGenesisFlashCartSaveData(flashCartArrayBuffer, rawArrayBuffer);
  }

  static createWithNewSize(flashCartSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(flashCartSaveData.getRawArrayBuffer(), newSize); // Note that we're resizing the raw save here, which has a fill byte of 0x00, so it's okay to pad with zeros via this function

    return GenesisMegaSdGenesisFlashCartSaveData.createFromRawData(newRawSaveData);
  }

  static getFlashCartFileExtension() {
    return 'srm';
  }

  static getRawFileExtension() {
    return null;
  }

  static requiresRomClass() {
    return null;
  }

  static adjustOutputSizesPlatform() {
    return 'genesis';
  }

  constructor(flashCartArrayBuffer, rawArrayBuffer) {
    this.flashCartArrayBuffer = flashCartArrayBuffer;
    this.rawArrayBuffer = rawArrayBuffer;
  }

  getRawArrayBuffer() {
    return this.rawArrayBuffer;
  }

  getFlashCartArrayBuffer() {
    return this.flashCartArrayBuffer;
  }
}
