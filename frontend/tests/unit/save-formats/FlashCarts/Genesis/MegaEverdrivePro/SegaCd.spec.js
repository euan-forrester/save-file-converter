import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import GenesisMegaEverdriveProSegaCdFlashCartSaveData from '@/save-formats/FlashCarts/Genesis/MegaEverdrivePro/SegaCd';

const DIR = './tests/unit/save-formats/data/flashcarts/genesis/megaeverdrivepro';

const MEGA_EVERDRIVE_PRO_RAM_CART_FILENAME = `${DIR}/Popful Mail (USA) (RE) cd-cart.srm`;
const CONVERTED_TO_RAW_RAM_CART_FILENAME = `${DIR}/Popful Mail (USA) (RE) cd-cart-raw.srm`;

const EMULATOR_RAM_CART_FILENAME = `${DIR}/Popful Mail (USA) (RE)-from-emulator cart.brm`;
const CONVERTED_TO_MEGA_EVERDRIVE_PRO_RAM_CART_FILENAME = `${DIR}/Popful Mail (USA) (RE)-from-emulator-to-med cd-cart.srm`;

describe('Flash cart - Genesis - Mega Everdrive Pro - Sega CD', () => {
  /*
  it('should convert a raw SRAM save to Mega Everdrive Pro format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_SRAM_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProGenesisFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });
  */

  it('should resize a Mega Everdrive Pro RAM cart save to emulator format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_RAM_CART_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CONVERTED_TO_RAW_RAM_CART_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProSegaCdFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    const largerFlashCartSegaCdSaveData = GenesisMegaEverdriveProSegaCdFlashCartSaveData.createWithNewSize(flashCartSaveData, 524288);

    expect(ArrayBufferUtil.arrayBuffersEqual(largerFlashCartSegaCdSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should resize an emulator RAM cart save to Mega Everdrive Pro format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CONVERTED_TO_MEGA_EVERDRIVE_PRO_RAM_CART_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_RAM_CART_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProSegaCdFlashCartSaveData.createFromRawData(rawArrayBuffer);

    const smallerFlashCartSegaCdSaveData = GenesisMegaEverdriveProSegaCdFlashCartSaveData.createWithNewSize(flashCartSaveData, 262144);

    expect(ArrayBufferUtil.arrayBuffersEqual(smallerFlashCartSegaCdSaveData.getFlashCartArrayBuffer(), flashCartArrayBuffer)).to.equal(true);
  });
});
