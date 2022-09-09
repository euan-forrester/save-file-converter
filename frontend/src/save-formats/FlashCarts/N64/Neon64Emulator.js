/*
Neon64 is an NES emulator that runs on the N64

Details on the save format: https://github.com/hcs64/neon64v2/issues/20

The format is:

0x10000-0x10003: 0x79783B4A
0x10004-0x10007: 0x985626E0
0x10008-0x12007: battery backed RAM
0x12008-0x1200B: 0x0BDFD303
0x1200C-0x1200F: 0x4579BC39

All of the rest of the file is ignored by the emulator. It happens to be filled with 0xAA.
There is an 8 byte magic header before the save data, and another 8 byte magic footer afterward.
Only 8kB saves are supported.
*/

import Util from '../../../util/util';
import SaveFilesUtil from '../../../util/SaveFiles';

const LITTLE_ENDIAN = false;

const HEADER = [
  0x79783B4A,
  0x985626E0,
];

const FOOTER = [
  0x0BDFD303,
  0x4579BC39,
];

const HEADER_OFFSET = 0x10000;
const HEADER_LENGTH = HEADER.length * 4;
const SAVE_OFFSET = HEADER_OFFSET + HEADER_LENGTH;
const SAVE_LENGTH = 8192; // Neon64 only works with 8kB saves
const FOOTER_OFFSET = HEADER_OFFSET + HEADER_LENGTH + SAVE_LENGTH;

const FILL_BYTE = 0xAA;
const FILE_LENGTH = 0x20000;

function checkHeaderAndFooter(flashCartArrayBuffer) {
  const dataView = new DataView(flashCartArrayBuffer);

  const headerMatches = HEADER.every((magic, index) => (dataView.getUint32(HEADER_OFFSET + (index * 4), LITTLE_ENDIAN) === magic));
  const footerMatches = FOOTER.every((magic, index) => (dataView.getUint32(FOOTER_OFFSET + (index * 4), LITTLE_ENDIAN) === magic));

  if (!headerMatches || !footerMatches) {
    throw new Error('This does not appear to be a Neon64 save file');
  }
}

function fillInHeaderAndFooter(flashCartArrayBuffer) {
  const dataView = new DataView(flashCartArrayBuffer);

  HEADER.forEach((magic, index) => { dataView.setUint32(HEADER_OFFSET + (index * 4), magic, LITTLE_ENDIAN); });
  FOOTER.forEach((magic, index) => { dataView.setUint32(FOOTER_OFFSET + (index * 4), magic, LITTLE_ENDIAN); });
}

export default class Neon64EmulatorSaveData {
  static createFromFlashCartData(flashCartArrayBuffer) {
    if (flashCartArrayBuffer.byteLength !== FILE_LENGTH) {
      throw new Error('This does not appear to be a Neon64 save file');
    }

    checkHeaderAndFooter(flashCartArrayBuffer);

    return new Neon64EmulatorSaveData(flashCartArrayBuffer, flashCartArrayBuffer.slice(SAVE_OFFSET, SAVE_OFFSET + SAVE_LENGTH));
  }

  static createFromRawData(rawArrayBuffer) {
    if (rawArrayBuffer.byteLength !== SAVE_LENGTH) {
      throw new Error('Neon64 only works with 8kB NES save files');
    }

    const emptyArrayBuffer = Util.getFilledArrayBuffer(FILE_LENGTH, FILL_BYTE);

    fillInHeaderAndFooter(emptyArrayBuffer);

    const flashCartArrayBuffer = Util.setArrayBufferPortion(emptyArrayBuffer, rawArrayBuffer, SAVE_OFFSET, 0, SAVE_LENGTH);

    return new Neon64EmulatorSaveData(flashCartArrayBuffer, rawArrayBuffer);
  }

  static createWithNewSize(neon64EmulatorSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(neon64EmulatorSaveData.getRawArrayBuffer(), newSize);

    // Don't call createFromRawData() with the resized raw data, because we'll get an error saying Neon can only do 8kB saves. Bypass it instead.
    return new Neon64EmulatorSaveData(neon64EmulatorSaveData.getFlashCartArrayBuffer(), newRawSaveData);
  }

  static getFlashCartFileExtension() {
    return 'srm';
  }

  static getRawFileExtension() {
    return null; // NES saves have many possible extensions, and we just want to keep whatever the original extension was
  }

  static requiresRomClass() {
    return null;
  }

  static adjustOutputSizesPlatform() {
    return 'nes';
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
