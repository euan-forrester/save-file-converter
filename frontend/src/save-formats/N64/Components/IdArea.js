/* eslint-disable no-bitwise */

import Util from '../../../util/util';

import N64Basics from './Basics';

const {
  LITTLE_ENDIAN,
  PAGE_SIZE,
} = N64Basics;

const ID_AREA_BLOCK_SIZE = 32;
const ID_AREA_CHECKSUM_OFFSETS = [0x20, 0x60, 0x80, 0xC0]; // 4 different checksum in the ID Area, and if any of them match then the data is deemed valid
const ID_AREA_CHECKSUM_LENGTH = 28;
const ID_AREA_DEVICE_OFFSET = 25;
const ID_AREA_BANK_SIZE_OFFSET = 26;
const ID_AREA_CHECKSUM_DESIRED_SUM_A_OFFSET = 28;
const ID_AREA_CHECKSUM_DESIRED_SUM_B_OFFSET = 30;
const DEVICE_CONTROLLER_PAK = 0x1;
const BANK_SIZE = 0x1;

function randomByte(randomNumberGenerator = null) {
  const rng = (randomNumberGenerator !== null) ? randomNumberGenerator : Math.random;

  return 0 | rng() * 256;
}

// From https://github.com/bryc/mempak/blob/master/js/parser.js#L130
function calculateChecksumsOfBlock(arrayBuffer) {
  const dataView = new DataView(arrayBuffer);

  let sumA = 0x0;
  let sumB = 0xFFF2;

  for (let i = 0; i < ID_AREA_CHECKSUM_LENGTH; i += 2) {
    sumA += dataView.getUint16(i, LITTLE_ENDIAN);
    sumA &= 0xFFFF;
  }

  sumB -= sumA;

  return {
    sumA,
    sumB,
  };
}

export default class N64IdArea {
  // Based on https://github.com/bryc/mempak/blob/master/js/state.js#L13
  static createIdAreaPage(randomNumberGenerator = null) {
    // This page is 4 copies of the same block at different offsets

    const checksumBlock = new ArrayBuffer(ID_AREA_BLOCK_SIZE);
    const checksumBlockDataView = new DataView(checksumBlock);

    checksumBlockDataView.setUint8(1, randomByte(randomNumberGenerator) & 0x3F);
    checksumBlockDataView.setUint8(5, randomByte(randomNumberGenerator) & 0x7);
    checksumBlockDataView.setUint8(6, randomByte(randomNumberGenerator));
    checksumBlockDataView.setUint8(7, randomByte(randomNumberGenerator));
    checksumBlockDataView.setUint8(8, randomByte(randomNumberGenerator) & 0xF);
    checksumBlockDataView.setUint8(9, randomByte(randomNumberGenerator));
    checksumBlockDataView.setUint8(10, randomByte(randomNumberGenerator));
    checksumBlockDataView.setUint8(11, randomByte(randomNumberGenerator));
    checksumBlockDataView.setUint8(ID_AREA_DEVICE_OFFSET, DEVICE_CONTROLLER_PAK);
    checksumBlockDataView.setUint8(ID_AREA_BANK_SIZE_OFFSET, BANK_SIZE);

    const { sumA, sumB } = calculateChecksumsOfBlock(checksumBlock);

    checksumBlockDataView.setUint16(ID_AREA_CHECKSUM_DESIRED_SUM_A_OFFSET, sumA, LITTLE_ENDIAN);
    checksumBlockDataView.setUint16(ID_AREA_CHECKSUM_DESIRED_SUM_B_OFFSET, sumB, LITTLE_ENDIAN);

    // Now we can make our empty page

    let pageArrayBuffer = new ArrayBuffer(PAGE_SIZE);

    pageArrayBuffer = Util.fillArrayBuffer(pageArrayBuffer, 0);

    // Now copy our block to the various offsets it needs to be at

    ID_AREA_CHECKSUM_OFFSETS.forEach((offset) => {
      pageArrayBuffer = Util.setArrayBufferPortion(pageArrayBuffer, checksumBlock, offset, 0, ID_AREA_BLOCK_SIZE);
    });

    return pageArrayBuffer;
  }

  // Taken from https://github.com/bryc/mempak/blob/master/js/parser.js#L147
  // Calculate checksums of 4 byte arrays and compare them against the checksum
  // listed in the file. They're redundant, so if any are correct then the file
  // is deems not corrupted.
  static checkIdArea(arrayBuffer) {
    let foundValidBlock = false;

    const dataView = new DataView(arrayBuffer);

    ID_AREA_CHECKSUM_OFFSETS.forEach((offset) => {
      const block = arrayBuffer.slice(offset, offset + ID_AREA_BLOCK_SIZE);
      const { sumA, sumB } = calculateChecksumsOfBlock(block);

      const desiredSumA = dataView.getUint16(offset + ID_AREA_CHECKSUM_DESIRED_SUM_A_OFFSET, LITTLE_ENDIAN);
      let desiredSumB = dataView.getUint16(offset + ID_AREA_CHECKSUM_DESIRED_SUM_B_OFFSET, LITTLE_ENDIAN);

      // Find incorrect checksums found in many DexDrive files
      // https://github.com/bryc/mempak/blob/master/js/parser.js#L127
      if ((desiredSumB !== sumB) && ((desiredSumB ^ 0x0C) === sumB) && (desiredSumA === sumA)) {
        desiredSumB ^= 0xC;
      }

      foundValidBlock = foundValidBlock || ((desiredSumA === sumA) && (desiredSumB === sumB));
    });

    if (!foundValidBlock) {
      throw new Error('File appears to be corrupt - checksums in ID Area do not match');
    }
  }
}
