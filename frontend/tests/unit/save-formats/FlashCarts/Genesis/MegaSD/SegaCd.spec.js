import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';
import SegaCdUtil from '@/util/SegaCd';

import GenesisMegaSdSegaCdFlashCartSaveData from '@/save-formats/FlashCarts/Genesis/MegaSD/SegaCd';

const DIR = './tests/data/save-formats/flashcarts/genesis';

const MEGA_SD_FILENAME = `${DIR}/megasd/Popful Mail (U).SRM`;
const RAW_INTERNAL_MEMORY_FILENAME = `${DIR}/megasd/Popful Mail (U)-internal-memory.brm`;
const RAW_RAM_CART_FILENAME = `${DIR}/megasd/Popful Mail (U)-ram-cart.brm`;

const MEGA_SD_INTERNAL_MEMORY_ONLY_FILENAME = `${DIR}/megasd/Popful Mail (U)-internal-memory-only.SRM`;

const MEGA_SD_CONVERTED_BACK_INTERNAL_MEMORY_FILENAME = `${DIR}/megasd/Popful Mail (U)-converted-back-internal-memory.SRM`;
const MEGA_SD_CONVERTED_BACK_RAM_CART_FILENAME = `${DIR}/megasd/Popful Mail (U)-converted-back-ram-cart.SRM`;
const MEGA_SD_CONVERTED_BACK_BOTH_FILENAME = `${DIR}/megasd/Popful Mail (U)-converted-back.SRM`; // There are a few bits different in the 'signature' at the end of the RAM cart section, but both files should work

describe('Flash cart - Genesis - Mega SD - Sega CD', () => {
  it('should convert a Mega SD Sega CD save to emulator format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_FILENAME);
    const rawInternalSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_INTERNAL_MEMORY_FILENAME);
    const rawRamCartSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_RAM_CART_FILENAME);

    const flashCartSaveData = GenesisMegaSdSegaCdFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(GenesisMegaSdSegaCdFlashCartSaveData.INTERNAL_MEMORY), rawInternalSaveArrayBuffer)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(GenesisMegaSdSegaCdFlashCartSaveData.RAM_CART), rawRamCartSaveArrayBuffer)).to.equal(true);
  });

  it('should convert a Mega SD Sega CD save containing only internal memory to emulator format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_INTERNAL_MEMORY_ONLY_FILENAME);
    const rawInternalSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_INTERNAL_MEMORY_FILENAME);
    const rawRamCartSaveArrayBuffer = SegaCdUtil.makeEmptySave(GenesisMegaSdSegaCdFlashCartSaveData.EMULATOR_RAM_CART_SIZE);

    const flashCartSaveData = GenesisMegaSdSegaCdFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(GenesisMegaSdSegaCdFlashCartSaveData.INTERNAL_MEMORY), rawInternalSaveArrayBuffer)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(GenesisMegaSdSegaCdFlashCartSaveData.RAM_CART), rawRamCartSaveArrayBuffer)).to.equal(true);
  });

  it('should convert an emulator internal memory Sega CD file to Mega SD format', async () => {
    const rawInternalSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_INTERNAL_MEMORY_FILENAME);
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_CONVERTED_BACK_INTERNAL_MEMORY_FILENAME);

    const flashCartSaveData = GenesisMegaSdSegaCdFlashCartSaveData.createFromRawData({ rawInternalSaveArrayBuffer });

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartArrayBuffer)).to.equal(true);
  });

  it('should convert an emulator RAM cart Sega CD file to Mega SD format', async () => {
    const rawRamCartSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_RAM_CART_FILENAME);
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_CONVERTED_BACK_RAM_CART_FILENAME);

    const flashCartSaveData = GenesisMegaSdSegaCdFlashCartSaveData.createFromRawData({ rawRamCartSaveArrayBuffer });

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartArrayBuffer)).to.equal(true);
  });

  it('should convert emulator internal memory + RAM cart Sega CD files to Mega SD format', async () => {
    const rawInternalSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_INTERNAL_MEMORY_FILENAME);
    const rawRamCartSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_RAM_CART_FILENAME);
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_CONVERTED_BACK_BOTH_FILENAME);

    const flashCartSaveData = GenesisMegaSdSegaCdFlashCartSaveData.createFromRawData({ rawInternalSaveArrayBuffer, rawRamCartSaveArrayBuffer });

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartArrayBuffer)).to.equal(true);
  });
});
