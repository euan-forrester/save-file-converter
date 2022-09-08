import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';
import SegaCdUtil from '@/util/SegaCd';

import GenesisMegaEverdriveProSegaCdFlashCartSaveData from '@/save-formats/FlashCarts/Genesis/MegaEverdrivePro/SegaCd';

const DIR = './tests/unit/save-formats/data/flashcarts/genesis/megaeverdrivepro';

const MEGA_EVERDRIVE_PRO_RAM_CART_FILENAME = `${DIR}/Popful Mail (USA) (RE) cd-cart.srm`;
const CONVERTED_TO_RAW_RAM_CART_FILENAME = `${DIR}/Popful Mail (USA) (RE) cd-cart-raw.srm`;

const EMULATOR_RAM_CART_FILENAME = `${DIR}/Popful Mail (USA) (RE)-from-emulator cart.brm`;
const CONVERTED_TO_MEGA_EVERDRIVE_PRO_RAM_CART_FILENAME = `${DIR}/Popful Mail (USA) (RE)-from-emulator-to-med cd-cart.srm`;

const EMPTY_INTERNAL_MEMORY_SAVE = SegaCdUtil.makeEmptySave(SegaCdUtil.INTERNAL_SAVE_SIZE);
// const EMPTY_FLASH_CART_RAM_CART_SAVE = SegaCdUtil.makeEmptySave(MisterSegaCdSaveData.RAM_CART_SIZE);

describe('Flash cart - Genesis - Mega Everdrive Pro - Sega CD', () => {
  /*
  it('should convert a raw SRAM save to Mega Everdrive Pro format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_SRAM_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProGenesisFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });
  */

  it('should convert a Mega Everdrive Pro RAM cart save to emulator format', async () => {
    const flashCartRamCartSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_RAM_CART_FILENAME);
    const rawRamCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CONVERTED_TO_RAW_RAM_CART_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProSegaCdFlashCartSaveData.createFromFlashCartData({ flashCartRamCartSaveArrayBuffer });

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.INTERNAL_MEMORY), EMPTY_INTERNAL_MEMORY_SAVE)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.RAM_CART), rawRamCartArrayBuffer)).to.equal(true);
  });

  it('should convert an emulator RAM cart save to Mega Everdrive Pro format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CONVERTED_TO_MEGA_EVERDRIVE_PRO_RAM_CART_FILENAME);
    const rawRamCartSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_RAM_CART_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProSegaCdFlashCartSaveData.createFromRawData({ rawRamCartSaveArrayBuffer });

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.INTERNAL_MEMORY), EMPTY_INTERNAL_MEMORY_SAVE)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.RAM_CART), flashCartArrayBuffer)).to.equal(true);
  });
});
