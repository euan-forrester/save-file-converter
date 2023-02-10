/* eslint-disable no-bitwise */

// The Sega CD format uses a version of Reed Solomon that I can't seem to find a JS implementation of.
// All of the existing implementations seem to be based on the same original Java implementation,
// which was able to parse the data from a real Sega CD when told there was 1 parity byte but not 2.
// I gave up trying and went with the reference implementation from https://github.com/superctr/buram

// reedSolomonType can either be 6 or 8

import Util from '../../util/util';

const GENERATOR_POLYNOMIAL_REED_SOLOMON_8 = [87, 166, 113, 75, 198, 25, 167, 114, 76, 199, 26, 1]; // https://github.com/superctr/buram/blob/master/buram.c#L586
const GENERATOR_POLYNOMIAL_REED_SOLOMON_6 = [20, 58, 56, 18, 26, 6, 59, 57, 19, 27, 7, 1]; // https://github.com/superctr/buram/blob/master/buram.c#L587

const GALOIS_FIELD_TABLE_SIZE = 256;

const DATA_SIZE = 6;
const PARITY_OFFSETS = [DATA_SIZE, DATA_SIZE + 1];
const PARITY_SIZE = PARITY_OFFSETS.length;
const TOTAL_SIZE = DATA_SIZE + PARITY_SIZE;

// https://github.com/superctr/buram/blob/master/buram.c#L85
function initReedSolomon(poly, bitsPerSymbol, generatorPolynomial) {
  const symbolsPerBlock = (1 << bitsPerSymbol) - 1;

  const galoisFieldIndexOf = new Array(GALOIS_FIELD_TABLE_SIZE).fill(0);
  const galoisFieldAlphaTo = new Array(GALOIS_FIELD_TABLE_SIZE).fill(0);

  let sr = 1;

  for (let i = 1; i <= symbolsPerBlock; i += 1) {
    galoisFieldIndexOf[sr] = (i & 0xFF);
    galoisFieldAlphaTo[i] = (sr & 0xFF);

    sr = (sr << 1) & 0xFFFFFFFF;

    if ((sr & (1 << bitsPerSymbol)) !== 0) {
      sr ^= poly;
    }

    sr &= symbolsPerBlock;
  }

  return {
    bitsPerSymbol,
    symbolsPerBlock,
    generatorPolynomial,
    galoisFieldIndexOf,
    galoisFieldAlphaTo,
  };
}

// https://github.com/superctr/buram/blob/master/buram.c#L584
const REED_SOLOMON = {
  8: initReedSolomon(0x1D, 8, GENERATOR_POLYNOMIAL_REED_SOLOMON_8),
  6: initReedSolomon(3, 6, GENERATOR_POLYNOMIAL_REED_SOLOMON_6),
};

function checkInputDataSize(inputArrayBuffer) {
  if (inputArrayBuffer.byteLength !== TOTAL_SIZE) {
    throw new Error(`This Reed-Solomon implementation can only support an input size of ${TOTAL_SIZE} but was given a size of ${inputArrayBuffer.byteLength}`);
  }
}

// Add with modulo
// Based on https://github.com/superctr/buram/blob/master/buram.c#L111
function addMod(reedSolomon, i, d) {
  const newD = (d + reedSolomon.generatorPolynomial[i]) % reedSolomon.symbolsPerBlock;

  return reedSolomon.galoisFieldAlphaTo[newD + 1];
}

export default class ReedSolomon {
  // Based on https://github.com/superctr/buram/blob/master/buram.c#L122
  static encode(inputArrayBuffer, reedSolomonType) {
    checkInputDataSize(inputArrayBuffer);
    const reedSolomon = REED_SOLOMON[reedSolomonType];

    const outputArrayBuffer = Util.copyArrayBuffer(inputArrayBuffer);
    const outputUint8Array = new Uint8Array(outputArrayBuffer);

    outputUint8Array[PARITY_OFFSETS[0]] = 0;
    outputUint8Array[PARITY_OFFSETS[1]] = 0;

    for (let i = 0; i < DATA_SIZE; i += 1) {
      let d = outputUint8Array[i];

      if (d !== 0) {
        d = reedSolomon.galoisFieldIndexOf[d] - 1;

        outputUint8Array[PARITY_OFFSETS[0]] ^= addMod(reedSolomon, i, d);
        outputUint8Array[PARITY_OFFSETS[1]] ^= addMod(reedSolomon, i + DATA_SIZE, d);
      }
    }

    return outputArrayBuffer;
  }

  // Based on https://github.com/superctr/buram/blob/master/buram.c#L144
  static decode(inputArrayBuffer, reedSolomonType) {
    checkInputDataSize(inputArrayBuffer);
    const reedSolomon = REED_SOLOMON[reedSolomonType];

    const outputArrayBuffer = Util.copyArrayBuffer(inputArrayBuffer);
    const outputUint8Array = new Uint8Array(outputArrayBuffer);

    let errorMask = 0;
    let errorLocation = 0;

    // Calculate error location (syndrome)
    for (let i = 0; i < TOTAL_SIZE; i += 1) {
      let d = outputUint8Array[i];
      errorMask = (errorMask ^ d) & 0xFF;

      if (d !== 0) {
        d = (reedSolomon.galoisFieldIndexOf[d] + DATA_SIZE - i) % reedSolomon.symbolsPerBlock;
        errorLocation = (errorLocation ^ reedSolomon.galoisFieldAlphaTo[d + 1]) & 0xFF;
      }
    }

    // Correct a single error
    if (errorMask !== 0) {
      const d = (reedSolomon.symbolsPerBlock + reedSolomon.galoisFieldIndexOf[errorLocation] - reedSolomon.galoisFieldIndexOf[errorMask]) % reedSolomon.symbolsPerBlock;

      if (d < TOTAL_SIZE) {
        outputUint8Array[TOTAL_SIZE - 1 - d] ^= errorMask;
      } else {
        throw new Error(`Unable to correct error found in data. d: ${d}, errorLocation: ${errorLocation}, errorMask: 0x${errorMask.toString(16)}, symbolsPerBlock: ${reedSolomon.symbolsPerBlock}`);
      }
    }

    return outputArrayBuffer;
  }
}
