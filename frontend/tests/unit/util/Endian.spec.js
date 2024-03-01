import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import EndianUtil from '@/util/Endian';

const DIR = './tests/data/util/endian';

const TWO_BYTE_INPUT_FILENAME = `${DIR}/2ByteWord-input.sav`;
const TWO_BYTE_OUTPUT_FILENAME = `${DIR}/2ByteWord-output.sav`;

const FOUR_BYTE_INPUT_FILENAME = `${DIR}/4ByteWord-input.sav`;
const FOUR_BYTE_OUTPUT_FILENAME = `${DIR}/4ByteWord-output.sav`;

const EIGHT_BYTE_INPUT_FILENAME = `${DIR}/8ByteWord-input.sav`;
const EIGHT_BYTE_OUTPUT_FILENAME = `${DIR}/8ByteWord-output.sav`;

describe('EndianUtil', () => {
  it('should throw an error if the input ArrayBuffer size is not a multiple of the word size', () => {
    const dummyArrayBuffer = new ArrayBuffer(10);

    expect(() => EndianUtil.swap(dummyArrayBuffer, 4)).to.throw(
      // Passing in a specific instance of an Error triggers a comparison of the references: https://github.com/chaijs/chai/issues/430
      Error,
      'File length must be a multiple of 4 bytes',
    );
  });

  it('should throw an error for an unknown word size', () => {
    const dummyArrayBuffer = new ArrayBuffer(60);

    expect(() => EndianUtil.swap(dummyArrayBuffer, 6)).to.throw(
      // Passing in a specific instance of an Error triggers a comparison of the references: https://github.com/chaijs/chai/issues/430
      Error,
      'Word size must be one of 2, 4, 8',
    );
  });

  it('should endian swap a 2 byte word size', async () => {
    const inputArrayBuffer = await ArrayBufferUtil.readArrayBuffer(TWO_BYTE_INPUT_FILENAME);
    const outputArrayBuffer = await ArrayBufferUtil.readArrayBuffer(TWO_BYTE_OUTPUT_FILENAME);

    const endianSwappedArrayBuffer = EndianUtil.swap(inputArrayBuffer, 2);

    expect(ArrayBufferUtil.arrayBuffersEqual(endianSwappedArrayBuffer, outputArrayBuffer)).to.equal(true);
  });

  it('should endian swap a 4 byte word size', async () => {
    const inputArrayBuffer = await ArrayBufferUtil.readArrayBuffer(FOUR_BYTE_INPUT_FILENAME);
    const outputArrayBuffer = await ArrayBufferUtil.readArrayBuffer(FOUR_BYTE_OUTPUT_FILENAME);

    const endianSwappedArrayBuffer = EndianUtil.swap(inputArrayBuffer, 4);

    expect(ArrayBufferUtil.arrayBuffersEqual(endianSwappedArrayBuffer, outputArrayBuffer)).to.equal(true);
  });

  it('should endian swap an 8 byte word size', async () => {
    const inputArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EIGHT_BYTE_INPUT_FILENAME);
    const outputArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EIGHT_BYTE_OUTPUT_FILENAME);

    const endianSwappedArrayBuffer = EndianUtil.swap(inputArrayBuffer, 8);

    expect(ArrayBufferUtil.arrayBuffersEqual(endianSwappedArrayBuffer, outputArrayBuffer)).to.equal(true);
  });
});
