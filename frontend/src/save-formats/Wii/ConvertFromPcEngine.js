/* eslint no-bitwise: ["error", { "allow": ["^", "^=", "~"] }] */
/* eslint-disable no-unused-vars */ // FIXME: Remove this later

// Converts from the PC Engine format on the Wii NAND to something that's usable by PC Engine emulators
//
// The Wii files appear to be 8kB + 32B whereas 'real' files are 2kB. The Wii files appear to have a 16B header and a 16B footer.
//
// Format reverse engineered by https://github.com/JanErikGunnar
//
// More information about PC Engine saving: https://blackfalcongames.net/?p=190
// More information about the PC Engine Backup RAM format: http://blockos.github.io/HuDK/doc/files/include/bram-s.html

const BLOCK_SIZE = 4;
const NUM_BLOCKS_PER_SET = 4;
const BRAM_SIZE = 2048; // On a real PCE many games would share this memory. Most emulators, though, create a new virtual BRAM for each game
const HEADER_LENGTH = 16;
const SEED1_START = 4;
const FOOTER_LENGTH = 16;
const MAGIC = 'HUBM'; // Marker at the beginning that signifies correctly-formatted BRAM
const MAGIC_ENCODING = 'US-ASCII';

function getOffsetForBlock(currentByte, blockNum) {
  // Block 1 = first 4 bytes of this set, block 2 is the second 4 bytes of this set, etc.
  return currentByte + (BLOCK_SIZE * (blockNum - 1));
}

function getBlock(array, currentByte, blockNum) {
  const offset = getOffsetForBlock(currentByte, blockNum);
  return array.slice(offset, offset + BLOCK_SIZE);
}

function xorBlocks(block1, block2, block3 = null, block4 = null, block5 = null, block6 = null, block7 = null, block8 = null, block9 = null, block10 = null) {
  const output = new Uint8Array(BLOCK_SIZE);

  // Inefficient, but good for testing various permutations
  for (let i = 0; i < BLOCK_SIZE; i += 1) {
    output[i] = block1[i] ^ block2[i];

    if (block3 !== null) {
      output[i] ^= block3[i];
    }

    if (block4 !== null) {
      output[i] ^= block4[i];
    }

    if (block5 !== null) {
      output[i] ^= block5[i];
    }

    if (block6 !== null) {
      output[i] ^= block6[i];
    }

    if (block7 !== null) {
      output[i] ^= block7[i];
    }

    if (block8 !== null) {
      output[i] ^= block8[i];
    }

    if (block9 !== null) {
      output[i] ^= block9[i];
    }

    if (block10 !== null) {
      output[i] ^= block10[i];
    }
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

function zeroBlock() {
  const output = new Uint8Array(BLOCK_SIZE);
  output.fill(0);

  return output;
}

export default (arrayBuffer) => {
  const header = arrayBuffer.slice(0, HEADER_LENGTH);
  const inputArrayBuffer = arrayBuffer.slice(HEADER_LENGTH, -FOOTER_LENGTH);
  const inputArray = new Uint8Array(inputArrayBuffer);

  if (inputArray.byteLength % (BLOCK_SIZE * NUM_BLOCKS_PER_SET) !== 0) {
    throw new Error(`PC Engine input data length ${inputArray.byteLength} is not a multiple of the block size ${BLOCK_SIZE} and blocks per set ${NUM_BLOCKS_PER_SET}`);
  }

  const seed1ArrayBuffer = header.slice(SEED1_START, SEED1_START + BLOCK_SIZE);
  const seed1Array = new Uint8Array(seed1ArrayBuffer);
  const outputArrayBuffer = new ArrayBuffer(inputArrayBuffer.byteLength);
  const outputArray = new Uint8Array(outputArrayBuffer);

  // Decode the data in sets of 4 blocks

  let currentByte = 0;

  let previousOutputBlock1 = zeroBlock();
  let previousOutputBlock2 = zeroBlock();
  let previousOutputBlock3 = zeroBlock();
  let previousOutputBlock4 = zeroBlock();

  while (currentByte < inputArray.byteLength) {
    const inputBlock1 = getBlock(inputArray, currentByte, 1);
    const inputBlock2 = getBlock(inputArray, currentByte, 2);
    const inputBlock3 = getBlock(inputArray, currentByte, 3);
    const inputBlock4 = getBlock(inputArray, currentByte, 4);

    const outputBlock1 = xorBlocks(inputBlock1, seed1Array, previousOutputBlock1, previousOutputBlock2, previousOutputBlock3, previousOutputBlock4);
    const outputBlock3 = xorBlocks(inputBlock2, notBlock(inputBlock3));
    const outputBlock2 = xorBlocks(inputBlock3, seed1Array, previousOutputBlock1, previousOutputBlock2, previousOutputBlock3, previousOutputBlock4, outputBlock1, outputBlock3);
    const outputBlock4 = xorBlocks(inputBlock4, notBlock(inputBlock3));

    outputArray.set(outputBlock1, getOffsetForBlock(currentByte, 1));
    outputArray.set(outputBlock2, getOffsetForBlock(currentByte, 2));
    outputArray.set(outputBlock3, getOffsetForBlock(currentByte, 3));
    outputArray.set(outputBlock4, getOffsetForBlock(currentByte, 4));

    previousOutputBlock1 = outputBlock1;
    previousOutputBlock2 = outputBlock2;
    previousOutputBlock3 = outputBlock3;
    previousOutputBlock4 = outputBlock4;

    currentByte += (BLOCK_SIZE * NUM_BLOCKS_PER_SET);
  }

  // Now check that we got actual PC Engine data

  const textDecoder = new TextDecoder(MAGIC_ENCODING);
  const magicFound = textDecoder.decode(outputArray.slice(0, MAGIC.length));

  if (magicFound !== MAGIC) {
    throw new Error(`Save appears corrupted: found '${magicFound}' instead of '${MAGIC}' at the start of the file`);
  }

  // Return data truncated to the correct size

  return {
    saveData: outputArrayBuffer.slice(0, BRAM_SIZE),
    fileExtension: 'srm',
  };
};
