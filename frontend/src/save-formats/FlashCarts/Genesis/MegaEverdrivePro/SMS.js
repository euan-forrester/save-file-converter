import SaveFilesUtil from '../../../../util/SaveFiles';
import GenesisUtil from '../../../../util/Genesis';

// Some knockoff everdrives produce byte-expanded files for SMS games even though the regular everdrives don't.
// So let's just silently unexpand them when converting to raw
//
// This doesn't seem to be a major issue (only 1 report in a year) so let's not clutter the interface by offering the option
// to expand the files when converting to flash cart format. It seems much more likely that someone would be converting their
// saves *from* a knockoff cart than *to* a knockoff cart
//
// If someone does need to convert their saves to a cart that expects them byte-expanded, they can use https://savefileconverter.com/#/utilities/advanced?tab=byte-expansion

export default class GenesisMegaEverdriveProSmsFlashCartSaveData {
  static createFromFlashCartData(flashCartArrayBuffer) {
    let rawArrayBuffer = flashCartArrayBuffer;

    if (GenesisUtil.isByteExpanded(flashCartArrayBuffer) && !GenesisUtil.isEmpty(flashCartArrayBuffer)) {
      rawArrayBuffer = GenesisUtil.byteCollapse(flashCartArrayBuffer);
    }

    return new GenesisMegaEverdriveProSmsFlashCartSaveData(flashCartArrayBuffer, rawArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    return new GenesisMegaEverdriveProSmsFlashCartSaveData(rawArrayBuffer, rawArrayBuffer);
  }

  static createWithNewSize(flashCartSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(flashCartSaveData.getRawArrayBuffer(), newSize);

    return GenesisMegaEverdriveProSmsFlashCartSaveData.createFromRawData(newRawSaveData);
  }

  static getFlashCartFileExtension() {
    return 'srm';
  }

  static getRawFileExtension() {
    return null; // SMS saves have many possible extensions, and we just want to keep whatever the original extension was
  }

  static requiresRom() {
    return null;
  }

  static adjustOutputSizesPlatform() {
    return 'sms';
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
