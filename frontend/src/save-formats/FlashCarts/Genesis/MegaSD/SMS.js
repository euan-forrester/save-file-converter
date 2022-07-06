// SMS files on the Mega SD appear to just have "BUP2" prepended to the start of the file.
// This is the same as the "new style" (i.e. recent firmware) of Genesis saves on the device.
// I'm not sure if there's an "old style" for SMS saves on the Mega SD.

import SaveFilesUtil from '../../../../util/SaveFiles';
import MathUtil from '../../../../util/Math';
import Util from '../../../../util/util';

const MAGIC = 'BUP2';
const MAGIC_OFFSET = 0;
const MAGIC_ENCODING = 'US-ASCII';

export default class GenesisMegaSdSmsFlashCartSaveData {
  static createFromFlashCartData(flashCartArrayBuffer) {
    Util.checkMagic(flashCartArrayBuffer, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);

    if ((flashCartArrayBuffer.byteLength > MAGIC.length) && MathUtil.isPowerOf2(flashCartArrayBuffer.byteLength - MAGIC.length)) {
      return new GenesisMegaSdSmsFlashCartSaveData(flashCartArrayBuffer, flashCartArrayBuffer.slice(MAGIC.length));
    }

    throw new Error('This does not appear to be a Sega Master System save');
  }

  static createFromRawData(rawArrayBuffer) {
    const textEncoder = new TextEncoder(MAGIC_ENCODING);
    const magicArrayBuffer = Util.bufferToArrayBuffer(textEncoder.encode(MAGIC));

    return new GenesisMegaSdSmsFlashCartSaveData(Util.concatArrayBuffers([magicArrayBuffer, rawArrayBuffer]), rawArrayBuffer);
  }

  static createWithNewSize(flashCartSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(flashCartSaveData.getRawArrayBuffer(), newSize);

    return GenesisMegaSdSmsFlashCartSaveData.createFromRawData(newRawSaveData);
  }

  static getFlashCartFileExtension() {
    return 'SRM';
  }

  static getRawFileExtension() {
    return null; // SMS saves have many possible extensions, and we just want to keep whatever the original extension was
  }

  static requiresRomClass() {
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
