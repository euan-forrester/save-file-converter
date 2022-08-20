import { expect } from 'chai';
import SegaCdUtil from '@/util/SegaCd';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/util/data';

const INTERNAL_FILENAME = `${DIR}/Popful Mail (USA) (RE)-internal.sav`;
const RAM_CART_FILENAME = `${DIR}/Popful Mail (USA) (RE)-internal-to-ram-cart.brm`;
const BACK_TO_INTERNAL_FILENAME = `${DIR}/Popful Mail (USA) (RE)-back-to-internal.brm`;

const EMULATOR_RAM_CART_SIZE = 524288; // Genesis Plus uses this size for its virtual RAM cart

describe('SegaCdUtil', () => {
  it('should resize an internal RAM save to emulator RAM cart size', async () => {
    const internalArrayBuffer = await ArrayBufferUtil.readArrayBuffer(INTERNAL_FILENAME);
    const ramCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAM_CART_FILENAME);

    expect(ArrayBufferUtil.arrayBuffersEqual(SegaCdUtil.resize(internalArrayBuffer, EMULATOR_RAM_CART_SIZE), ramCartArrayBuffer)).to.equal(true);
  });

  it('should resize a RAM cart save to internal size', async () => {
    // Some of the bytes in the size portion of the BRAM_FORMAT are different after converting back to this size,
    // but both seem to load fine

    const internalArrayBuffer = await ArrayBufferUtil.readArrayBuffer(BACK_TO_INTERNAL_FILENAME);
    const ramCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAM_CART_FILENAME);

    expect(ArrayBufferUtil.arrayBuffersEqual(SegaCdUtil.resize(ramCartArrayBuffer, SegaCdUtil.INTERNAL_SAVE_SIZE), internalArrayBuffer)).to.equal(true);
  });
});
