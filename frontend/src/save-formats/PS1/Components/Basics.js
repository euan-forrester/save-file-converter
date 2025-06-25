export default class Ps1Basics {
  static NUM_BLOCKS = 15; // The card has one block that contains the header, then 15 blocks for save data

  static BLOCK_SIZE = 8192; // Each block is this many bytes

  static FRAME_SIZE = 128; // Each block contains a set of "frames" which are each this many bytes

  static TOTAL_SIZE = (Ps1Basics.NUM_BLOCKS + 1) * Ps1Basics.BLOCK_SIZE;

  static LITTLE_ENDIAN = true;

  static MAGIC_ENCODING = 'US-ASCII';
}
