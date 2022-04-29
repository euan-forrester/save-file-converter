import { expect } from 'chai';
import N64FlashCartSaveData from '@/save-formats/FlashCarts/N64';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/flashcarts/n64';

const RAW_MARIO_64_FILENAME = `${DIR}/super-mario-64.14546-raw.eep`;
const FLASHCART_MARIO_64_FILENAME = `${DIR}/super-mario-64.14546-flashcart.eep`;

describe('Flash cart - N64', () => {
  it('should convert a raw N64 save to flash cart format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_MARIO_64_FILENAME);
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(FLASHCART_MARIO_64_FILENAME);

    const n64FlashCartSaveData = N64FlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(n64FlashCartSaveData.getFlashCartArrayBuffer(), flashCartArrayBuffer)).to.equal(true);
  });

  it('should convert a flash cart N64 save to raw format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_MARIO_64_FILENAME);
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(FLASHCART_MARIO_64_FILENAME);

    const n64FlashCartSaveData = N64FlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(n64FlashCartSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });
});
