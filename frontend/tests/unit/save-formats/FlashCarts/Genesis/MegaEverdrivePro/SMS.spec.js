import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import GenesisMegaEverdriveProSmsFlashCartSaveData from '@/save-formats/FlashCarts/Genesis/MegaEverdrivePro/SMS';

const DIR = './tests/unit/save-formats/data/flashcarts/genesis';

const MEGA_EVERDRIVE_PRO_SMS_FILENAME = `${DIR}/megaeverdrivepro/Phantasy Star (USA, Europe) (Rev A).srm`;

describe('Flash cart - Genesis - Mega Everdrive Pro - SMS', () => {
  it('should convert a raw SMS save to Mega Everdrive Pro format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_SMS_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProSmsFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a Mega Everdrive Pro SMS save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_SMS_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProSmsFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });
});
