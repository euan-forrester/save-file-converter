import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import SnesFlashCartSaveData from '@/save-formats/FlashCarts/SNES/SNES';

const DIR = './tests/data/save-formats/flashcarts/snes';

const SNES_FILENAME = `${DIR}/Donkey Kong Country 2 - Diddy's Kong Quest.srm`;

describe('Flash cart - SNES - SNES', () => {
  it('should convert a raw SNES save to flash cart format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SNES_FILENAME);

    const flashCartSaveData = SnesFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a flash cart SNES save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SNES_FILENAME);

    const flashCartSaveData = SnesFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });
});
