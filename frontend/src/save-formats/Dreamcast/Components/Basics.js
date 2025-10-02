export default class DreamcastBasics {
  static LITTLE_ENDIAN = true;

  static WORD_SIZE_IN_BYTES = 4;

  static BLOCK_SIZE = 512;

  static NUM_BLOCKS = 256;

  static TOTAL_SIZE = this.BLOCK_SIZE * this.NUM_BLOCKS;

  static SYSTEM_INFO_BLOCK_NUMBER = 0xFF; // https://github.com/flyinghead/flycast/blob/33833cfd1ed2d94d907223442fdb8cdafd8d5d80/core/hw/maple/maple_devs.cpp#L516

  static SYSTEM_INFO_SIZE_IN_BLOCKS = 1;

  static FILE_ALLOCATION_TABLE_BLOCK_NUMBER = 0xFE; // https://github.com/flyinghead/flycast/blob/33833cfd1ed2d94d907223442fdb8cdafd8d5d80/core/hw/maple/maple_devs.cpp#L518

  static FILE_ALLOCATION_TABLE_SIZE_IN_BLOCKS = 1;

  static DIRECTORY_BLOCK_NUMBER = 0xFD; // https://github.com/flyinghead/flycast/blob/33833cfd1ed2d94d907223442fdb8cdafd8d5d80/core/hw/maple/maple_devs.cpp#L522

  static DIRECTORY_SIZE_IN_BLOCKS = 13;

  static SAVE_AREA_SIZE_IN_BLOCKS = 200;

  static SAVE_AREA_BLOCK_NUMBER = this.SAVE_AREA_SIZE_IN_BLOCKS - 1; // All of the block numbers specify the final block number, so this one needs to too

  static FILE_TYPE_DATA = 'Data';

  static FILE_TYPE_GAME = 'Game';
}
