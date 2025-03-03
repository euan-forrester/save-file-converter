import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import GenesisMegaEverdriveProSmsFlashCartSaveData from '@/save-formats/FlashCarts/Genesis/MegaEverdrivePro/SMS';

const DIR = './tests/data/save-formats/flashcarts/genesis';

const MEGA_EVERDRIVE_PRO_SMS_FILENAME = `${DIR}/megaeverdrivepro/Phantasy Star (USA, Europe) (Rev A).srm`;

const KNOCKOFF_EVERDRIVE_SMS_FILENAME = `${DIR}/megaeverdrivepro/Phantasy_Star_USA_Europe_Rev_A-byte-expanded.srm`;
const RAW_SMS_FILENAME = `${DIR}/megaeverdrivepro/Phantasy_Star_USA_Europe_Rev_A-byte-collapsed.srm`;

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

  it('should convert a byte-expanded knockoff Everdrive SMS save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(KNOCKOFF_EVERDRIVE_SMS_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_SMS_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProSmsFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });
});
