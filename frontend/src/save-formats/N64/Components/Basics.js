import Util from '../../../util/util';

export default class N64Basics {
  static LITTLE_ENDIAN = false;

  static NUM_NOTES = 16; // A "note" is a save slot. It consists of >= 1 pages

  static NUM_PAGES = 128;

  static PAGE_SIZE = 256;

  static FIRST_SAVE_DATA_PAGE = 5;

  static createEmptyBlock(size) {
    return Util.getFilledArrayBuffer(size, 0x00);
  }
}
