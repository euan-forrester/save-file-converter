import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import PcEngineFlashCartSaveData from '@/save-formats/FlashCarts/PcEngine';

const DIR = './tests/data/save-formats/flashcarts/pcengine';

const PCENGINE_FILENAME = `${DIR}/Castlevania - Rondo of Blood (my save) - raw.sav`;

describe('Flash cart - PC Engine', () => {
  it('should convert a raw PC Engine save to flash cart format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(PCENGINE_FILENAME);

    const flashCartSaveData = PcEngineFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a flash cart PC Engine save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(PCENGINE_FILENAME);

    const flashCartSaveData = PcEngineFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });
});
