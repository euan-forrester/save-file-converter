import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import GbaFlashCartSaveData from '@/save-formats/FlashCarts/GBA/GBA';

const DIR = './tests/data/save-formats/flashcarts/gba';

const GBA_FILENAME = `${DIR}/Metroid - Zero Mission (USA).sav`;

describe('Flash cart - GBA', () => {
  it('should convert a raw GBA save to flash cart format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GBA_FILENAME);

    const flashCartSaveData = GbaFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a flash cart GBA save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GBA_FILENAME);

    const flashCartSaveData = GbaFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });
});
