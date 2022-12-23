import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import GameGearFlashCartSaveData from '@/save-formats/FlashCarts/GameGear';

const DIR = './tests/data/save-formats/flashcarts/gamegear';

const GG_FILENAME = `${DIR}/Crystalis.sav`;

describe('Flash cart - Game Gear', () => {
  it('should convert a raw Game Gear save to flash cart format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GG_FILENAME);

    const flashCartSaveData = GameGearFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a flash cart Game Gear save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GG_FILENAME);

    const flashCartSaveData = GameGearFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });
});
