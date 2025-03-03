import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import SuperGameboyFlashCartSaveData from '@/save-formats/FlashCarts/SNES/GB';

const DIR = './tests/data/save-formats/flashcarts/snes';

const GB_FILENAME = `${DIR}/Legend of Zelda, The - Link's Awakening (USA, Europe).srm`;

describe('Flash cart - SNES - GB', () => {
  it('should convert a raw GB save to SNES flash cart format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GB_FILENAME);

    const flashCartSaveData = SuperGameboyFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a SNES flash cart GB save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GB_FILENAME);

    const flashCartSaveData = SuperGameboyFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });
});
