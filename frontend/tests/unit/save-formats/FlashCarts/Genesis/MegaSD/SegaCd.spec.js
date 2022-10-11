import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import GenesisMegaSdSegaCdFlashCartSaveData from '@/save-formats/FlashCarts/Genesis/MegaSD/SegaCd';

const DIR = './tests/unit/save-formats/data/flashcarts/genesis';

const MEGA_SD_FILENAME = `${DIR}/megasd/Popful Mail (U).SRM`;
const RAW_INTERNAL_MEMORY_FILENAME = `${DIR}/megasd/Popful Mail (U)-internal-memory.brm`;
const RAW_RAM_CART_FILENAME = `${DIR}/megasd/Popful Mail (U)-ram-cart.brm`;

describe('Flash cart - Genesis - Mega SD - Sega CD', () => {
  /*
  it('should convert a raw SMS save to Mega SD format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    const flashCartSaveData = GenesisMegaSdSegaCdFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartArrayBuffer)).to.equal(true);
  });
  */

  it('should convert a new style Mega SD SMS save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_FILENAME);
    const rawInternalMemoryArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_INTERNAL_MEMORY_FILENAME);
    const rawRamCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_RAM_CART_FILENAME);

    const flashCartSaveData = GenesisMegaSdSegaCdFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(GenesisMegaSdSegaCdFlashCartSaveData.INTERNAL_MEMORY), rawInternalMemoryArrayBuffer)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(GenesisMegaSdSegaCdFlashCartSaveData.RAM_CART), rawRamCartArrayBuffer)).to.equal(true);
  });
});
