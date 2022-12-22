import SaveFilesUtil from '../../../../util/SaveFiles';
import GenesisUtil from '../../../../util/Genesis';

const FILL_BYTE = 0x00; // Mega Everdrive Pro files are byte expanded with a fill byte of 0, just like emulators

export default class GenesisMegaEverdriveProGenesisFlashCartSaveData {
  static createFromFlashCartData(flashCartArrayBuffer) {
    // Here we know that the input data comes from an everdrive, and so it's byte expanded with 0's

    return new GenesisMegaEverdriveProGenesisFlashCartSaveData(flashCartArrayBuffer, flashCartArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    // Collapse then re-expand the data to account for cases where we're passed a Retrode-style file (with repeated bytes),
    // or a Mega SD-style file (filled with 0xFF instead), and then re-fill it with 0x00 as the Mega Everdrive Pro expects

    const flashCartArrayBuffer = GenesisUtil.changeFillByte(rawArrayBuffer, FILL_BYTE);

    return new GenesisMegaEverdriveProGenesisFlashCartSaveData(flashCartArrayBuffer, rawArrayBuffer);
  }

  static createWithNewSize(flashCartSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(flashCartSaveData.getRawArrayBuffer(), newSize);

    return GenesisMegaEverdriveProGenesisFlashCartSaveData.createFromRawData(newRawSaveData);
  }

  static getFlashCartFileExtension() {
    return 'srm';
  }

  static getRawFileExtension() {
    return null; // Genesis saves have many possible extensions, and we just want to keep whatever the original extension was
  }

  static requiresRom() {
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
