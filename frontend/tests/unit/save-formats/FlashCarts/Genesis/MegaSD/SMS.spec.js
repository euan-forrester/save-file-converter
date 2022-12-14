import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import GenesisMegaaSdSmsFlashCartSaveData from '@/save-formats/FlashCarts/Genesis/MegaSD/SMS';

const DIR = './tests/data/save-formats/flashcarts/genesis';

const MEGA_SD_FILENAME = `${DIR}/megasd/Phantasy Star (USA, Europe) (Rev 1).SRM`;
const RAW_FILENAME = `${DIR}/megasd/Phantasy Star (USA, Europe) (Rev 1)-raw.sav`;

describe('Flash cart - Genesis - Mega SD - SMS', () => {
  it('should convert a raw SMS save to Mega SD format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    const flashCartSaveData = GenesisMegaaSdSmsFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartArrayBuffer)).to.equal(true);
  });

  it('should convert a new style Mega SD SMS save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    const flashCartSaveData = GenesisMegaaSdSmsFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert an old style Mega SD SMS save to raw format', async () => {
    const oldStyleFlashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME); // Repurpose our raw save as an "old style" save
    const newStyleFlashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_FILENAME);

    const rawArrayBuffer = oldStyleFlashCartArrayBuffer;

    const flashCartSaveData = GenesisMegaaSdSmsFlashCartSaveData.createFromFlashCartData(oldStyleFlashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), newStyleFlashCartArrayBuffer)).to.equal(true);
  });
});
