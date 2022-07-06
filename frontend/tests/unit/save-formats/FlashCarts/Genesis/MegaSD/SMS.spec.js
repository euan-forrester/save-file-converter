import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import GenesisMegaaSdSmsFlashCartSaveData from '@/save-formats/FlashCarts/Genesis/MegaSD/SMS';

const DIR = './tests/unit/save-formats/data/flashcarts/genesis';

const MEGA_SD_FILENAME = `${DIR}/megasd/Phantasy Star (USA, Europe) (Rev 1).SRM`;
const RAW_FILENAME = `${DIR}/megasd/Phantasy Star (USA, Europe) (Rev 1)-raw.srm`;

describe('Flash cart - Genesis - Mega SD - SMS', () => {
  it('should convert a raw SMS save to Mega SD format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    const flashCartSaveData = GenesisMegaaSdSmsFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartArrayBuffer)).to.equal(true);
  });

  it('should convert a Mega SD SMS save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    const flashCartSaveData = GenesisMegaaSdSmsFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });
});
