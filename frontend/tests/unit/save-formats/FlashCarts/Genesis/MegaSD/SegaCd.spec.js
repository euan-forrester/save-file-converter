import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import GenesisMegaSdSegaCdFlashCartSaveData from '@/save-formats/FlashCarts/Genesis/MegaSD/SegaCd';

const DIR = './tests/unit/save-formats/data/flashcarts/genesis';

const MEGA_SD_FILENAME = `${DIR}/megasd/Popful Mail (U).SRM`;
const RAW_INTERNAL_MEMORY_FILENAME = `${DIR}/megasd/Popful Mail (U)-internal-memory.brm`;
const RAW_RAM_CART_FILENAME = `${DIR}/megasd/Popful Mail (U)-ram-cart.brm`;

const MEGA_SD_CONVERTED_BACK_FILENAME = `${DIR}/megasd/Popful Mail (U)-converted-back.SRM`; // There are a few bits different in the 'signature' at the end of the RAM cart section, but both files should work

describe('Flash cart - Genesis - Mega SD - Sega CD', () => {
  it('should convert a Mega SD Sega CD save to emulator format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_FILENAME);
    const rawInternalSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_INTERNAL_MEMORY_FILENAME);
    const rawRamCartSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_RAM_CART_FILENAME);

    const flashCartSaveData = GenesisMegaSdSegaCdFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(GenesisMegaSdSegaCdFlashCartSaveData.INTERNAL_MEMORY), rawInternalSaveArrayBuffer)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(GenesisMegaSdSegaCdFlashCartSaveData.RAM_CART), rawRamCartSaveArrayBuffer)).to.equal(true);
  });

  it('should convert emulator Sega CD files to Mega SD format', async () => {
    const rawInternalSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_INTERNAL_MEMORY_FILENAME);
    const rawRamCartSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_RAM_CART_FILENAME);
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_CONVERTED_BACK_FILENAME);

    const flashCartSaveData = GenesisMegaSdSegaCdFlashCartSaveData.createFromRawData({ rawInternalSaveArrayBuffer, rawRamCartSaveArrayBuffer });

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartArrayBuffer)).to.equal(true);
  });
});
