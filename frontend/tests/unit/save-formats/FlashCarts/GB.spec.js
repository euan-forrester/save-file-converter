import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import GbFlashCartSaveData from '@/save-formats/FlashCarts/GB';

const DIR = './tests/data/save-formats/flashcarts/gb';

const GB_FILENAME = `${DIR}/Final Fantasy Legend II.srm`;

describe('Flash cart - GB/C', () => {
  it('should convert a raw GB/C save to flash cart format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GB_FILENAME);

    const flashCartSaveData = GbFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a flash cart GB/C save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GB_FILENAME);

    const flashCartSaveData = GbFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });
});
