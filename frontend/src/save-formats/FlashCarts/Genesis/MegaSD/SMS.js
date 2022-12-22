// SMS files on the Mega SD appear to just have "BUP2" prepended to the start of the file.
// This is the same as the "new style" (i.e. recent firmware) of Genesis saves on the device.
// I'm not sure if there's an "old style" for SMS saves on the Mega SD.
//
// We're going to make this also be able to load raw saves in case that was the "old style" (if there was even an "old style"!)

import SaveFilesUtil from '../../../../util/SaveFiles';
import MathUtil from '../../../../util/Math';
import Util from '../../../../util/util';

const MAGIC = 'BUP2';
const MAGIC_OFFSET = 0;
const MAGIC_ENCODING = 'US-ASCII';

function isNewStyleSave(flashCartArrayBuffer) {
  try {
    Util.checkMagic(flashCartArrayBuffer, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);
  } catch (e) {
    return false;
  }

  return ((flashCartArrayBuffer.byteLength > MAGIC.length) && MathUtil.isPowerOf2(flashCartArrayBuffer.byteLength - MAGIC.length));
}

function isOldStyleSave(flashCartArrayBuffer) {
  return MathUtil.isPowerOf2(flashCartArrayBuffer.byteLength);
}

function convertFromNewStyleToRaw(flashCartArrayBuffer) {
  return flashCartArrayBuffer.slice(MAGIC.length);
}

function convertFromRawToNewStyle(rawArrayBuffer) {
  const textEncoder = new TextEncoder(MAGIC_ENCODING);
  const magicArrayBuffer = Util.bufferToArrayBuffer(textEncoder.encode(MAGIC));

  return Util.concatArrayBuffers([magicArrayBuffer, rawArrayBuffer]);
}

export default class GenesisMegaSdSmsFlashCartSaveData {
  static createFromFlashCartData(flashCartArrayBuffer) {
    if (isNewStyleSave(flashCartArrayBuffer)) {
      return new GenesisMegaSdSmsFlashCartSaveData(flashCartArrayBuffer, convertFromNewStyleToRaw(flashCartArrayBuffer));
    }

    if (isOldStyleSave(flashCartArrayBuffer)) {
      const rawArrayBuffer = flashCartArrayBuffer; // In the "old sty;e", the flash cart data is just raw data
      return new GenesisMegaSdSmsFlashCartSaveData(convertFromRawToNewStyle(rawArrayBuffer), rawArrayBuffer);
    }

    throw new Error('This does not appear to be a Mega SD Sega Master System save file');
  }

  static createFromRawData(rawArrayBuffer) {
    return new GenesisMegaSdSmsFlashCartSaveData(convertFromRawToNewStyle(rawArrayBuffer), rawArrayBuffer);
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
