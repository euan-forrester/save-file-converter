/* eslint no-bitwise: ["error", { "allow": ["^", "^=", "~"] }] */

// Converts from the PC Engine format on the Wii NAND to something that's usable by PC Engine emulators
//
// The Wii files appear to be 8kB + 32B whereas 'real' files are 2kB. The Wii files appear to have a 16B header and a 16B footer.
//
// Format reverse engineered by https://github.com/JanErikGunnar
//
// These files appear to be purposefully obfuscated for some reason. To decode them, work in blocks of 4 bytes and xor each block
// with bitwise-not the block before it. There is a seed block in the header for use with the first block of data.
//
// Note that this looks a lot like Cipher Block Chaining (CBC), with the seed block as an initialization vector: https://searchsecurity.techtarget.com/definition/cipher-block-chaining
//
// Additional resources:
//
// 1) More information about PC Engine saving: https://blackfalcongames.net/?p=190
// 2) More information about the PC Engine Backup RAM format: http://blockos.github.io/HuDK/doc/files/include/bram-s.html
// 3) Info about how BRAM is mapped into the console's memory space: https://github.com/asterick/TurboSharp/blob/master/Text/pcetech.txt#L1379
// 4) Info about how memory is mapped to the CPU memory space: https://www.lorenzomoretti.com/wp-content/files/chapter_0.txt
// 5) Homebrew tool for exploring BRAM: https://pdroms.de/files/nec-turbografx16-tg16-pcengine-pce/bram-tool-v1-0
//
// According to 2), BRAM is mapped to the CPU memory space using MPR4, which according to 4) puts it at 0x8000 - 0x8800 (0x8000 + 2kB).
// We see the value 0x8800 at offset 4-5 in output from emulators, as expected from the description for those bytes in 2).
// However, the Wii files are 8kB in size and correspondingly they write 0xA000 (0x8000 + 8 kB) to those bytes in their output.
// So when we truncate the file to 2kB we need to update those values as well.

import Util from '../../util/util';

const LITTLE_ENDIAN = true;
const BLOCK_SIZE = 4;
const BRAM_MEMORY_ADDRESS = 0x8000; // The address in the CPU memory space that the BRAM is mapped to (see above)
const BRAM_SIZE = 2048; // In bytes. On a real PCE many games would share this memory. Most emulators, though, create a new virtual BRAM for each game
const POINTER_TO_FIRST_BYTE_AFTER_BRAM_OFFSET = 4; // Offset in BRAM of the pointer to the first byte in CPU memory after BRAM
const HEADER_LENGTH = 16;
const SEED_START = 4;
const FOOTER_LENGTH = 16;
const MAGIC = 'HUBM'; // Marker at the beginning that signifies correctly-formatted BRAM
const MAGIC_ENCODING = 'US-ASCII';
const MAGIC_OFFSET = 0;

function getBlock(array, currentByte) {
  return array.slice(currentByte, currentByte + BLOCK_SIZE);
}

function xorBlocks(block1, block2) {
  const output = new Uint8Array(BLOCK_SIZE);

  for (let i = 0; i < BLOCK_SIZE; i += 1) {
    output[i] = block1[i] ^ block2[i];
  }

  return output;
}

function notBlock(block) {
  const output = new Uint8Array(BLOCK_SIZE);

  for (let i = 0; i < BLOCK_SIZE; i += 1) {
    output[i] = ~block[i];
  }

  return output;
}

export default (arrayBuffer) => {
  const header = arrayBuffer.slice(0, HEADER_LENGTH);
  const inputArrayBuffer = arrayBuffer.slice(HEADER_LENGTH, -FOOTER_LENGTH);
  const inputArray = new Uint8Array(inputArrayBuffer);

  if (inputArray.byteLength % BLOCK_SIZE !== 0) {
    throw new Error(`PC Engine input data length ${inputArray.byteLength} is not a multiple of the block size ${BLOCK_SIZE}`);
  }

  const seedArrayBuffer = header.slice(SEED_START, SEED_START + BLOCK_SIZE);
  const seedArray = new Uint8Array(seedArrayBuffer);
  const outputArrayBuffer = new ArrayBuffer(inputArrayBuffer.byteLength);
  const outputArray = new Uint8Array(outputArrayBuffer);

  // Decode the data by xor'ing each block with NOT the previous block

  let currentByte = 0;

  let previousInputBlock = notBlock(seedArray); // Because we NOT our previous input block in the code below, but we want to use our seed as-is. So we need to pre-NOT it

  while (currentByte < inputArray.byteLength) {
    const inputBlock = getBlock(inputArray, currentByte);

    const outputBlock = xorBlocks(inputBlock, notBlock(previousInputBlock));

    outputArray.set(outputBlock, currentByte);

    previousInputBlock = inputBlock;

    currentByte += BLOCK_SIZE;
  }

  // Now check that we got actual PC Engine data

  Util.checkMagic(outputArray, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);

  // Return data truncated to the correct size

  // We need to change the pointer to the first byte after BRAM when we truncate the file. The Wii version of the file provides
  // 8kB of BRAM (and so this pointer contains 0x8000 + 8192 = 0xA000). But for compatibility with other emulators we're going to
  // truncate the file to 2kB: the size of BRAM in a normal PC Engine. So we'll change this value to 0x8000 + 2048 = 0x8800.

  const outputDataView = new DataView(outputArrayBuffer);
  outputDataView.setUint16(POINTER_TO_FIRST_BYTE_AFTER_BRAM_OFFSET, BRAM_MEMORY_ADDRESS + BRAM_SIZE, LITTLE_ENDIAN);

  return {
    saveData: outputArrayBuffer.slice(0, BRAM_SIZE),
    fileExtension: 'sav',
  };
};
