import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import NesFlashCartSaveData from '@/save-formats/FlashCarts/NES';

const DIR = './tests/unit/save-formats/data/flashcarts/nes';

const NES_FILENAME = `${DIR}/Crystalis.sav`;

describe('Flash cart - NES', () => {
  it('should convert a raw NES save to flash cart format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NES_FILENAME);

    const flashCartSaveData = NesFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a flash cart NES save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NES_FILENAME);

    const flashCartSaveData = NesFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });
});
