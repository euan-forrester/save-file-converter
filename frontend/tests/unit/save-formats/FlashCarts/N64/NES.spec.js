import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import N64NesFlashCartSaveData from '@/save-formats/FlashCarts/N64/NES';

const DIR = './tests/unit/save-formats/data/flashcarts/n64/nes';

const N64_EVERDRIVE_NES_CORE_FILENAME = `${DIR}/Zelda II - The Adventure of Link (USA)-from-everdrive.srm`;

const CART_NES_FILENAME = `${DIR}/Zelda II - The Adventure of Link (USA)-from-cart.sav`;
const CART_TO_EVERDRIVE_NES_FILENAME = `${DIR}/Zelda II - The Adventure of Link (USA)-from-cart-to-everdrive.sav`;

describe('Flash cart - N64 - NES', () => {
  it('should convert a raw NES save to Everdrive 64 X7 format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CART_NES_FILENAME);
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CART_TO_EVERDRIVE_NES_FILENAME);

    const flashCartSaveData = N64NesFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartArrayBuffer)).to.equal(true);
  });

  it('should convert a Everdrive 64 X7 NES save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(N64_EVERDRIVE_NES_CORE_FILENAME);

    const flashCartSaveData = N64NesFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });
});
