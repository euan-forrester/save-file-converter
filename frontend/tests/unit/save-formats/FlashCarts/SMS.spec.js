import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import SmsFlashCartSaveData from '@/save-formats/FlashCarts/SMS';

const DIR = './tests/data/save-formats/flashcarts/sms';

const SMS_FILENAME = `${DIR}/Phantasy Star (USA, Europe) (Rev A).srm`;

describe('Flash cart - SMS', () => {
  it('should convert a raw SMS save to flash cart format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SMS_FILENAME);

    const flashCartSaveData = SmsFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a flash cart SMS save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SMS_FILENAME);

    const flashCartSaveData = SmsFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });
});
