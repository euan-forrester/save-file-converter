import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';
import SegaCdUtil from '@/util/SegaCd';

import GenesisMegaEverdriveProSegaCdFlashCartSaveData from '@/save-formats/FlashCarts/Genesis/MegaEverdrivePro/SegaCd';

const DIR = './tests/unit/save-formats/data/flashcarts/genesis/megaeverdrivepro';

const MEGA_EVERDRIVE_PRO_RAM_CART_FILENAME = `${DIR}/Popful Mail (USA) (RE) cd-cart.srm`;
const CONVERTED_TO_RAW_RAM_CART_FILENAME = `${DIR}/Popful Mail (USA) (RE) cd-cart-raw.srm`;

const EMULATOR_RAM_CART_FILENAME = `${DIR}/Popful Mail (USA) (RE)-from-emulator cart.brm`;
const CONVERTED_TO_MEGA_EVERDRIVE_PRO_RAM_CART_FILENAME = `${DIR}/Popful Mail (USA) (RE)-from-emulator-to-med cd-cart.srm`;

const MEGA_EVERDRIVE_PRO_INTERNAL_MEMORY_FILENAME = `${DIR}/Dark Wizard (USA) cd-bram.brm`; // The internal memory data is identical for flash cart or emulator

const EMPTY_INTERNAL_MEMORY_SAVE = SegaCdUtil.makeEmptySave(SegaCdUtil.INTERNAL_SAVE_SIZE);
const EMPTY_FLASH_CART_RAM_CART_SAVE = SegaCdUtil.makeEmptySave(GenesisMegaEverdriveProSegaCdFlashCartSaveData.FLASH_CART_RAM_CART_SIZE);
const EMPTY_EMULATOR_RAM_CART_SAVE = SegaCdUtil.makeEmptySave(GenesisMegaEverdriveProSegaCdFlashCartSaveData.EMULATOR_RAM_CART_SIZE);

describe('Flash cart - Genesis - Mega Everdrive Pro - Sega CD', () => {
  it('should create all empty saves when not passed any data', async () => {
    const createdFromFlashCartSaveData = GenesisMegaEverdriveProSegaCdFlashCartSaveData.createFromFlashCartData({ });
    const createdFromRawSaveData = GenesisMegaEverdriveProSegaCdFlashCartSaveData.createFromRawData({ });

    expect(ArrayBufferUtil.arrayBuffersEqual(
      createdFromFlashCartSaveData.getRawArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.INTERNAL_MEMORY),
      EMPTY_INTERNAL_MEMORY_SAVE,
    )).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(
      createdFromFlashCartSaveData.getRawArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.RAM_CART),
      EMPTY_EMULATOR_RAM_CART_SAVE,
    )).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(
      createdFromFlashCartSaveData.getFlashCartArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.INTERNAL_MEMORY),
      EMPTY_INTERNAL_MEMORY_SAVE,
    )).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(
      createdFromFlashCartSaveData.getFlashCartArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.RAM_CART),
      EMPTY_FLASH_CART_RAM_CART_SAVE,
    )).to.equal(true);

    expect(ArrayBufferUtil.arrayBuffersEqual(
      createdFromRawSaveData.getRawArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.INTERNAL_MEMORY),
      EMPTY_INTERNAL_MEMORY_SAVE,
    )).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(
      createdFromRawSaveData.getRawArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.RAM_CART),
      EMPTY_EMULATOR_RAM_CART_SAVE,
    )).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(
      createdFromRawSaveData.getFlashCartArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.INTERNAL_MEMORY),
      EMPTY_INTERNAL_MEMORY_SAVE,
    )).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(
      createdFromRawSaveData.getFlashCartArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.RAM_CART),
      EMPTY_FLASH_CART_RAM_CART_SAVE,
    )).to.equal(true);
  });

  it('should convert a Mega Everdrive Pro RAM cart save to emulator format', async () => {
    const flashCartRamCartSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_RAM_CART_FILENAME);
    const rawRamCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CONVERTED_TO_RAW_RAM_CART_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProSegaCdFlashCartSaveData.createFromFlashCartData({ flashCartRamCartSaveArrayBuffer });

    expect(ArrayBufferUtil.arrayBuffersEqual(
      flashCartSaveData.getRawArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.INTERNAL_MEMORY),
      EMPTY_INTERNAL_MEMORY_SAVE,
    )).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(
      flashCartSaveData.getRawArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.RAM_CART),
      rawRamCartArrayBuffer,
    )).to.equal(true);
  });

  it('should convert an emulator RAM cart save to Mega Everdrive Pro format', async () => {
    const flashCartRamCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CONVERTED_TO_MEGA_EVERDRIVE_PRO_RAM_CART_FILENAME);
    const rawRamCartSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_RAM_CART_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProSegaCdFlashCartSaveData.createFromRawData({ rawRamCartSaveArrayBuffer });

    expect(ArrayBufferUtil.arrayBuffersEqual(
      flashCartSaveData.getFlashCartArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.INTERNAL_MEMORY),
      EMPTY_INTERNAL_MEMORY_SAVE,
    )).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(
      flashCartSaveData.getFlashCartArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.RAM_CART),
      flashCartRamCartArrayBuffer,
    )).to.equal(true);
  });

  it('should convert a Mega Everdrive Pro internal memory save to emulator format', async () => {
    const flashCartInternalSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_INTERNAL_MEMORY_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProSegaCdFlashCartSaveData.createFromFlashCartData({ flashCartInternalSaveArrayBuffer });

    expect(ArrayBufferUtil.arrayBuffersEqual(
      flashCartSaveData.getRawArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.INTERNAL_MEMORY),
      flashCartSaveData.getFlashCartArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.INTERNAL_MEMORY),
    )).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(
      flashCartSaveData.getRawArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.RAM_CART),
      EMPTY_EMULATOR_RAM_CART_SAVE,
    )).to.equal(true);
  });

  it('should convert an emulator internal memory save to Mega Everdrive Pro format', async () => {
    const rawInternalSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_INTERNAL_MEMORY_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProSegaCdFlashCartSaveData.createFromRawData({ rawInternalSaveArrayBuffer });

    expect(ArrayBufferUtil.arrayBuffersEqual(
      flashCartSaveData.getFlashCartArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.INTERNAL_MEMORY),
      flashCartSaveData.getRawArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.INTERNAL_MEMORY),
    )).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(
      flashCartSaveData.getFlashCartArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.RAM_CART),
      EMPTY_FLASH_CART_RAM_CART_SAVE,
    )).to.equal(true);
  });

  it('should convert both Mega Everdrive Pro internal memory and RAM cart saves to emulator format', async () => {
    const flashCartInternalSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_INTERNAL_MEMORY_FILENAME);
    const flashCartRamCartSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_RAM_CART_FILENAME);
    const rawRamCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CONVERTED_TO_RAW_RAM_CART_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProSegaCdFlashCartSaveData.createFromFlashCartData({ flashCartInternalSaveArrayBuffer, flashCartRamCartSaveArrayBuffer });

    expect(ArrayBufferUtil.arrayBuffersEqual(
      flashCartSaveData.getRawArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.INTERNAL_MEMORY),
      flashCartSaveData.getFlashCartArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.INTERNAL_MEMORY),
    )).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(
      flashCartSaveData.getRawArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.RAM_CART),
      rawRamCartArrayBuffer,
    )).to.equal(true);
  });

  it('should convert both emulator internal memory and RAM cart saves to Mega Everdrive Pro format', async () => {
    const rawInternalSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_INTERNAL_MEMORY_FILENAME);
    const rawRamCartSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_RAM_CART_FILENAME);
    const flashCartRamCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CONVERTED_TO_MEGA_EVERDRIVE_PRO_RAM_CART_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProSegaCdFlashCartSaveData.createFromRawData({ rawInternalSaveArrayBuffer, rawRamCartSaveArrayBuffer });

    expect(ArrayBufferUtil.arrayBuffersEqual(
      flashCartSaveData.getFlashCartArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.INTERNAL_MEMORY),
      flashCartSaveData.getRawArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.INTERNAL_MEMORY),
    )).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(
      flashCartSaveData.getFlashCartArrayBuffer(GenesisMegaEverdriveProSegaCdFlashCartSaveData.RAM_CART),
      flashCartRamCartArrayBuffer,
    )).to.equal(true);
  });
});
