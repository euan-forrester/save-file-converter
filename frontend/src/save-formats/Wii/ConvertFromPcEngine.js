/* eslint no-bitwise: ["error", { "allow": ["^"] }] */

// Converts from the PC Engine format on the Wii NAND to something that's usable by PC Engine emulators
//
// The Wii files appear to be 8kB + 32B whereas 'real' files are 2kB. The Wii files appear to have a 16B header and a 16B footer.
//
// Format reverse engineered by https://github.com/JanErikGunnar
//
// His description:
//
// input = the wii file, output = "normal" file
//
// accumulator = the 8 bytes from the middle of the header
// do while not end of input file {
//     inputblock = read 8 bytes
//     outputblock = inputblock XOR accumulator
//     save outputblock
//     accumulator = accumulator XOR outputblock
// }
//
// More information about PC Engine saving: https://blackfalcongames.net/?p=190

const BLOCK_SIZE = 8;
const BRAM_SIZE = 2048; // On a real PCE many games would share this memory. Most emulators, though, create a new virtual BRAM for each game
const HEADER_LENGTH = 16;
const ACCUMULATOR_START = 4;
const FOOTER_LENGTH = 16;
const MAGIC = 'HUBM'; // Marker at the beginning that signifies correctly-formatted BRAM
const MAGIC_ENCODING = 'US-ASCII';

function xorArrayParts(array1, array1Offset, array2, array2Offset, length) {
  const output = new Uint8Array(length);

  for (let i = 0; i < length; i += 1) {
    output[i] = array1[array1Offset + i] ^ array2[array2Offset + i];
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

  const accumulatorArrayBuffer = header.slice(ACCUMULATOR_START, ACCUMULATOR_START + BLOCK_SIZE);
  const accumulatorArray = new Uint8Array(accumulatorArrayBuffer);
  const outputArrayBuffer = new ArrayBuffer(inputArrayBuffer.byteLength);
  const outputArray = new Uint8Array(outputArrayBuffer);

  // Decode the data by doing the xor algorithm described above

  let currentByte = 0;

  while (currentByte < inputArray.byteLength) {
    const outputBlock = xorArrayParts(inputArray, currentByte, accumulatorArray, 0, BLOCK_SIZE);
    outputArray.set(outputBlock, currentByte);

    const newAccumulator = xorArrayParts(accumulatorArray, 0, outputArray, currentByte, BLOCK_SIZE);
    accumulatorArray.set(newAccumulator);

    currentByte += BLOCK_SIZE;
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
