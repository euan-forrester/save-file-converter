/* eslint-disable no-param-reassign */

import { expect } from 'chai';
import PaddingUtil from '@/util/Padding';
import MathUtil from '@/util/Math';

const ARRAY_BUFFER_SIZE = 32;
const DATA_VALUE = 0x01; // Represents actual data in our ArrayBuffer
const PADDING_VALUE_A = 0x00; // Two common values for padding used by various emulators
const PADDING_VALUE_B = 0xFF;
const EXTRA_PADDING_COUNT = 16;

describe('PaddingUtil', () => {
  it('should get the pad value and count', () => {
    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE + EXTRA_PADDING_COUNT);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => {
      if (i < EXTRA_PADDING_COUNT) {
        a[i] = PADDING_VALUE_A;
      } else {
        a[i] = DATA_VALUE;
      }
    });

    const padding = PaddingUtil.getPadValueAndCount(arrayBuffer);

    expect(padding.value).to.equal(PADDING_VALUE_A);
    expect(padding.count).to.equal(EXTRA_PADDING_COUNT);
  });

  it('should get the other pad value and count', () => {
    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE + EXTRA_PADDING_COUNT);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => {
      if (i < EXTRA_PADDING_COUNT) {
        a[i] = PADDING_VALUE_B;
      } else {
        a[i] = DATA_VALUE;
      }
    });

    const padding = PaddingUtil.getPadValueAndCount(arrayBuffer);

    expect(padding.value).to.equal(PADDING_VALUE_B);
    expect(padding.count).to.equal(EXTRA_PADDING_COUNT);
  });

  it('should maintain data size being a power of 2 when finding padding', () => {
    expect(MathUtil.getNextLargestPowerOf2(ARRAY_BUFFER_SIZE)).to.equal(ARRAY_BUFFER_SIZE);

    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE + EXTRA_PADDING_COUNT);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => {
      if (i < (EXTRA_PADDING_COUNT + 1)) { // One extra byte of padding
        a[i] = PADDING_VALUE_B;
      } else {
        a[i] = DATA_VALUE;
      }
    });

    const padding = PaddingUtil.getPadValueAndCount(arrayBuffer);

    expect(padding.value).to.equal(PADDING_VALUE_B);
    expect(padding.count).to.equal(EXTRA_PADDING_COUNT); // The extra byte of padding isn't counted
  });

  it('should get the pad count when there\'s no padding', () => {
    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => {
      a[i] = DATA_VALUE;
    });

    const padding = PaddingUtil.getPadValueAndCount(arrayBuffer);

    expect(padding.count).to.equal(0);
  });

  it('should get the pad count when it\'s al padding', () => {
    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => {
      a[i] = PADDING_VALUE_B;
    });

    const padding = PaddingUtil.getPadValueAndCount(arrayBuffer);

    expect(padding.count).to.equal(0);
  });

  it('should remove padding from the start', () => {
    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE + EXTRA_PADDING_COUNT);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => {
      if (i < EXTRA_PADDING_COUNT) {
        a[i] = PADDING_VALUE_B;
      } else {
        a[i] = DATA_VALUE;
      }
    });

    const unpaddedArrayBuffer = PaddingUtil.removePaddingFromStart(arrayBuffer, EXTRA_PADDING_COUNT);

    const unpaddedUint8Array = new Uint8Array(unpaddedArrayBuffer);

    unpaddedUint8Array.forEach((e, i, a) => {
      expect(a[i]).to.equal(DATA_VALUE, `index ${i}`);
    });
  });

  it('should remove zero bytes of padding from the start', () => {
    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => {
      a[i] = DATA_VALUE;
    });

    const unpaddedArrayBuffer = PaddingUtil.removePaddingFromStart(arrayBuffer, 0);

    const unpaddedUint8Array = new Uint8Array(unpaddedArrayBuffer);

    unpaddedUint8Array.forEach((e, i, a) => {
      expect(a[i]).to.equal(DATA_VALUE, `index ${i}`);
    });
  });

  it('should remove padding from the end', () => {
    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE + EXTRA_PADDING_COUNT);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => {
      if (i < ARRAY_BUFFER_SIZE) {
        a[i] = DATA_VALUE;
      } else {
        a[i] = PADDING_VALUE_B;
      }
    });

    const unpaddedArrayBuffer = PaddingUtil.removePaddingFromEnd(arrayBuffer, EXTRA_PADDING_COUNT);

    const unpaddedUint8Array = new Uint8Array(unpaddedArrayBuffer);

    unpaddedUint8Array.forEach((e, i, a) => {
      expect(a[i]).to.equal(DATA_VALUE, `index ${i}`);
    });
  });

  it('should remove zero bytes of padding from the end', () => {
    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => {
      a[i] = DATA_VALUE;
    });

    const unpaddedArrayBuffer = PaddingUtil.removePaddingFromEnd(arrayBuffer, 0);

    const unpaddedUint8Array = new Uint8Array(unpaddedArrayBuffer);

    unpaddedUint8Array.forEach((e, i, a) => {
      expect(a[i]).to.equal(DATA_VALUE, `index ${i}`);
    });
  });

  it('should add padding to start', () => {
    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => { a[i] = DATA_VALUE; });

    const padding = {
      value: PADDING_VALUE_B,
      count: EXTRA_PADDING_COUNT,
    };

    const paddedArrayBuffer = PaddingUtil.addPaddingToStart(arrayBuffer, padding);
    expect(paddedArrayBuffer.byteLength).to.equal(ARRAY_BUFFER_SIZE + EXTRA_PADDING_COUNT);

    const paddedUint8Array = new Uint8Array(paddedArrayBuffer);

    paddedUint8Array.forEach((e, i, a) => {
      if (i < EXTRA_PADDING_COUNT) {
        expect(a[i]).to.equal(PADDING_VALUE_B, `index ${i}`);
      } else {
        expect(a[i]).to.equal(DATA_VALUE, `index ${i}`);
      }
    });
  });

  it('should add zero bytes of padding to start', () => {
    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => { a[i] = DATA_VALUE; });

    const padding = {
      value: PADDING_VALUE_B,
      count: 0,
    };

    const paddedArrayBuffer = PaddingUtil.addPaddingToStart(arrayBuffer, padding);
    expect(paddedArrayBuffer.byteLength).to.equal(ARRAY_BUFFER_SIZE);

    const paddedUint8Array = new Uint8Array(paddedArrayBuffer);

    paddedUint8Array.forEach((e, i, a) => { expect(a[i]).to.equal(DATA_VALUE, `index ${i}`); });
  });

  it('should add padding to end', () => {
    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => { a[i] = DATA_VALUE; });

    const padding = {
      value: PADDING_VALUE_B,
      count: EXTRA_PADDING_COUNT,
    };

    const paddedArrayBuffer = PaddingUtil.addPaddingToEnd(arrayBuffer, padding);
    expect(paddedArrayBuffer.byteLength).to.equal(ARRAY_BUFFER_SIZE + EXTRA_PADDING_COUNT);

    const paddedUint8Array = new Uint8Array(paddedArrayBuffer);

    paddedUint8Array.forEach((e, i, a) => {
      if (i < ARRAY_BUFFER_SIZE) {
        expect(a[i]).to.equal(DATA_VALUE, `index ${i}`);
      } else {
        expect(a[i]).to.equal(PADDING_VALUE_B, `index ${i}`);
      }
    });
  });

  it('should add zero bytes of padding to end', () => {
    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => { a[i] = DATA_VALUE; });

    const padding = {
      value: PADDING_VALUE_B,
      count: 0,
    };

    const paddedArrayBuffer = PaddingUtil.addPaddingToEnd(arrayBuffer, padding);
    expect(paddedArrayBuffer.byteLength).to.equal(ARRAY_BUFFER_SIZE);

    const paddedUint8Array = new Uint8Array(paddedArrayBuffer);

    paddedUint8Array.forEach((e, i, a) => { expect(a[i]).to.equal(DATA_VALUE, `index ${i}`); });
  });

  it('should count padding when there\'s none', () => {
    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => { a[i] = DATA_VALUE; });

    expect(PaddingUtil.countPadding(arrayBuffer, PADDING_VALUE_A)).to.equal(0);
  });

  it('should count padding when it\'s all padding', () => {
    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => { a[i] = PADDING_VALUE_A; });

    expect(PaddingUtil.countPadding(arrayBuffer, PADDING_VALUE_A)).to.equal(0);
  });

  it('should count padding', () => {
    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE + EXTRA_PADDING_COUNT);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => { a[i] = ((i < EXTRA_PADDING_COUNT) ? PADDING_VALUE_A : DATA_VALUE); });

    expect(PaddingUtil.countPadding(arrayBuffer, PADDING_VALUE_A)).to.equal(EXTRA_PADDING_COUNT);
  });

  it('should count different values of padding', () => {
    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE + EXTRA_PADDING_COUNT);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => { a[i] = ((i < EXTRA_PADDING_COUNT) ? PADDING_VALUE_B : DATA_VALUE); });

    expect(PaddingUtil.countPadding(arrayBuffer, PADDING_VALUE_B)).to.equal(EXTRA_PADDING_COUNT);
  });
});
