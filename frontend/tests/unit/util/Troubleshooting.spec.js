/* eslint-disable no-param-reassign */

import { expect } from 'chai';
import Troubleshooting from '@/util/Troubleshooting';

const ARRAY_BUFFER_SIZE = 32;
const DATA_VALUE = 0x01; // Represents actual data in our ArrayBuffer
const PADDING_VALUE_A = 0x00; // Two common values for padding used by various emulators
const PADDING_VALUE_B = 0xFF;
const EXTRA_PADDING_COUNT = 16;

describe('Troubleshooting', () => {
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

    const padding = Troubleshooting.getPadValueAndCount(arrayBuffer);

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

    const padding = Troubleshooting.getPadValueAndCount(arrayBuffer);

    expect(padding.value).to.equal(PADDING_VALUE_B);
    expect(padding.count).to.equal(EXTRA_PADDING_COUNT);
  });

  it('should maintain data size being a power of 2 when finding padding', () => {
    expect(Troubleshooting.getNextLargestPowerOf2(ARRAY_BUFFER_SIZE)).to.equal(ARRAY_BUFFER_SIZE);

    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE + EXTRA_PADDING_COUNT);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => {
      if (i < (EXTRA_PADDING_COUNT + 1)) { // One extra byte of padding
        a[i] = PADDING_VALUE_B;
      } else {
        a[i] = DATA_VALUE;
      }
    });

    const padding = Troubleshooting.getPadValueAndCount(arrayBuffer);

    expect(padding.value).to.equal(PADDING_VALUE_B);
    expect(padding.count).to.equal(EXTRA_PADDING_COUNT); // The extra byte of padding isn't counted
  });

  it('should get the pad count when there\'s no padding', () => {
    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => {
      a[i] = DATA_VALUE;
    });

    const padding = Troubleshooting.getPadValueAndCount(arrayBuffer);

    expect(padding.count).to.equal(0);
  });

  it('should get the pad count when it\'s al padding', () => {
    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => {
      a[i] = PADDING_VALUE_B;
    });

    const padding = Troubleshooting.getPadValueAndCount(arrayBuffer);

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

    const unpaddedArrayBuffer = Troubleshooting.removePaddingFromStart(arrayBuffer, EXTRA_PADDING_COUNT);

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

    const unpaddedArrayBuffer = Troubleshooting.removePaddingFromStart(arrayBuffer, 0);

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

    const unpaddedArrayBuffer = Troubleshooting.removePaddingFromEnd(arrayBuffer, EXTRA_PADDING_COUNT);

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

    const unpaddedArrayBuffer = Troubleshooting.removePaddingFromEnd(arrayBuffer, 0);

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

    const paddedArrayBuffer = Troubleshooting.addPaddingToStart(arrayBuffer, padding);
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

    const paddedArrayBuffer = Troubleshooting.addPaddingToStart(arrayBuffer, padding);
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

    const paddedArrayBuffer = Troubleshooting.addPaddingToEnd(arrayBuffer, padding);
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

    const paddedArrayBuffer = Troubleshooting.addPaddingToEnd(arrayBuffer, padding);
    expect(paddedArrayBuffer.byteLength).to.equal(ARRAY_BUFFER_SIZE);

    const paddedUint8Array = new Uint8Array(paddedArrayBuffer);

    paddedUint8Array.forEach((e, i, a) => { expect(a[i]).to.equal(DATA_VALUE, `index ${i}`); });
  });

  it('should count padding when there\'s none', () => {
    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => { a[i] = DATA_VALUE; });

    expect(Troubleshooting.countPadding(arrayBuffer, PADDING_VALUE_A)).to.equal(0);
  });

  it('should count padding when it\'s all padding', () => {
    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => { a[i] = PADDING_VALUE_A; });

    expect(Troubleshooting.countPadding(arrayBuffer, PADDING_VALUE_A)).to.equal(0);
  });

  it('should count padding', () => {
    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE + EXTRA_PADDING_COUNT);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => { a[i] = ((i < EXTRA_PADDING_COUNT) ? PADDING_VALUE_A : DATA_VALUE); });

    expect(Troubleshooting.countPadding(arrayBuffer, PADDING_VALUE_A)).to.equal(EXTRA_PADDING_COUNT);
  });

  it('should count different values of padding', () => {
    const arrayBuffer = new ArrayBuffer(ARRAY_BUFFER_SIZE + EXTRA_PADDING_COUNT);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.forEach((e, i, a) => { a[i] = ((i < EXTRA_PADDING_COUNT) ? PADDING_VALUE_B : DATA_VALUE); });

    expect(Troubleshooting.countPadding(arrayBuffer, PADDING_VALUE_B)).to.equal(EXTRA_PADDING_COUNT);
  });

  it('should find the next largest power of 2', () => {
    expect(Troubleshooting.getNextLargestPowerOf2(-1)).to.equal(0);
    expect(Troubleshooting.getNextLargestPowerOf2(0)).to.equal(0);

    expect(Troubleshooting.getNextLargestPowerOf2(1)).to.equal(1);

    expect(Troubleshooting.getNextLargestPowerOf2(2)).to.equal(2);

    expect(Troubleshooting.getNextLargestPowerOf2(3)).to.equal(4);
    expect(Troubleshooting.getNextLargestPowerOf2(4)).to.equal(4);

    expect(Troubleshooting.getNextLargestPowerOf2(5)).to.equal(8);
    expect(Troubleshooting.getNextLargestPowerOf2(6)).to.equal(8);
    expect(Troubleshooting.getNextLargestPowerOf2(7)).to.equal(8);
    expect(Troubleshooting.getNextLargestPowerOf2(8)).to.equal(8);

    expect(Troubleshooting.getNextLargestPowerOf2(9)).to.equal(16);
    expect(Troubleshooting.getNextLargestPowerOf2(15)).to.equal(16);
    expect(Troubleshooting.getNextLargestPowerOf2(16)).to.equal(16);

    expect(Troubleshooting.getNextLargestPowerOf2(17)).to.equal(32);
    expect(Troubleshooting.getNextLargestPowerOf2(31)).to.equal(32);
    expect(Troubleshooting.getNextLargestPowerOf2(32)).to.equal(32);

    expect(Troubleshooting.getNextLargestPowerOf2(33)).to.equal(64);
    expect(Troubleshooting.getNextLargestPowerOf2(63)).to.equal(64);
    expect(Troubleshooting.getNextLargestPowerOf2(64)).to.equal(64);

    expect(Troubleshooting.getNextLargestPowerOf2(65)).to.equal(128);
    expect(Troubleshooting.getNextLargestPowerOf2(127)).to.equal(128);
    expect(Troubleshooting.getNextLargestPowerOf2(128)).to.equal(128);

    expect(Troubleshooting.getNextLargestPowerOf2(129)).to.equal(256);
    expect(Troubleshooting.getNextLargestPowerOf2(255)).to.equal(256);
    expect(Troubleshooting.getNextLargestPowerOf2(256)).to.equal(256);

    expect(Troubleshooting.getNextLargestPowerOf2(257)).to.equal(512);
    expect(Troubleshooting.getNextLargestPowerOf2(511)).to.equal(512);
    expect(Troubleshooting.getNextLargestPowerOf2(512)).to.equal(512);

    expect(Troubleshooting.getNextLargestPowerOf2(513)).to.equal(1024);
    expect(Troubleshooting.getNextLargestPowerOf2(1023)).to.equal(1024);
    expect(Troubleshooting.getNextLargestPowerOf2(1024)).to.equal(1024);

    expect(Troubleshooting.getNextLargestPowerOf2(1025)).to.equal(2048);
    expect(Troubleshooting.getNextLargestPowerOf2(2047)).to.equal(2048);
    expect(Troubleshooting.getNextLargestPowerOf2(2048)).to.equal(2048);

    expect(Troubleshooting.getNextLargestPowerOf2(2049)).to.equal(4096);
    expect(Troubleshooting.getNextLargestPowerOf2(4095)).to.equal(4096);
    expect(Troubleshooting.getNextLargestPowerOf2(4096)).to.equal(4096);

    expect(Troubleshooting.getNextLargestPowerOf2(4097)).to.equal(8192);
    expect(Troubleshooting.getNextLargestPowerOf2(8191)).to.equal(8192);
    expect(Troubleshooting.getNextLargestPowerOf2(8192)).to.equal(8192);

    expect(Troubleshooting.getNextLargestPowerOf2(8193)).to.equal(16384);
    expect(Troubleshooting.getNextLargestPowerOf2(16383)).to.equal(16384);
    expect(Troubleshooting.getNextLargestPowerOf2(16384)).to.equal(16384);

    expect(Troubleshooting.getNextLargestPowerOf2(16385)).to.equal(32768);
    expect(Troubleshooting.getNextLargestPowerOf2(32767)).to.equal(32768);
    expect(Troubleshooting.getNextLargestPowerOf2(32768)).to.equal(32768);

    expect(Troubleshooting.getNextLargestPowerOf2(32769)).to.equal(65536);
    expect(Troubleshooting.getNextLargestPowerOf2(65535)).to.equal(65536);
    expect(Troubleshooting.getNextLargestPowerOf2(65536)).to.equal(65536);

    expect(Troubleshooting.getNextLargestPowerOf2(65537)).to.equal(131072);
    expect(Troubleshooting.getNextLargestPowerOf2(131071)).to.equal(131072);
    expect(Troubleshooting.getNextLargestPowerOf2(131072)).to.equal(131072);

    expect(Troubleshooting.getNextLargestPowerOf2(131073)).to.equal(262144);
    expect(Troubleshooting.getNextLargestPowerOf2(262143)).to.equal(262144);
    expect(Troubleshooting.getNextLargestPowerOf2(262144)).to.equal(262144);
  });
});
