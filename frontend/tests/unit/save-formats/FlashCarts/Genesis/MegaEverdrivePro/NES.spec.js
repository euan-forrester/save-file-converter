import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import GenesisMegaEverdriveProNesFlashCartSaveData from '@/save-formats/FlashCarts/Genesis/MegaEverdrivePro/NES';

const DIR = './tests/unit/save-formats/data/flashcarts/genesis';

const MEGA_EVERDRIVE_PRO_NES_FILENAME = `${DIR}/megaeverdrivepro/Zelda II - The Adventure of Link (USA).srm`;

describe('Flash cart - Genesis - Mega Everdrive Pro - NES', () => {
  it('should convert a raw NES save to Mega Everdrive Pro format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_NES_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProNesFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a Mega Everdrive Pro NES save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_NES_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProNesFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });
});
