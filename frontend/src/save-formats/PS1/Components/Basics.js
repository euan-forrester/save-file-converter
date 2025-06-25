export default class Ps1Basics {
  static NUM_RESERVED_BLOCKS = 1; // The header contains directory information

  static NUM_DATA_BLOCKS = 15; // The card has one block that contains the header, then 15 blocks for save data

  static NUM_TOTAL_BLOCKS = Ps1Basics.NUM_RESERVED_BLOCKS + Ps1Basics.NUM_DATA_BLOCKS;

  static BLOCK_SIZE = 8192; // Each block is this many bytes

  static FRAME_SIZE = 128; // The header block contains a set of "frames" which are each this many bytes

  static TOTAL_SIZE = Ps1Basics.NUM_TOTAL_BLOCKS * Ps1Basics.BLOCK_SIZE;

  static LITTLE_ENDIAN = true;

  static MAGIC_ENCODING = 'US-ASCII';
}
