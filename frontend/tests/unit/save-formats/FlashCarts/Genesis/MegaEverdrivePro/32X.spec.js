import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import GenesisMegaEverdrivePro32xFlashCartSaveData from '@/save-formats/FlashCarts/Genesis/MegaEverdrivePro/32X';

const DIR = './tests/data/save-formats/flashcarts/genesis/megaeverdrivepro';

const MEGA_EVERDRIVE_PRO_SRAM_FILENAME = `${DIR}/36 Great Holes Starring Fred Couples (Japan, USA).srm`;
const MEGA_EVERDRIVE_PRO_FRAM_FILENAME = `${DIR}/Knuckles' Chaotix (Japan, USA) (En).srm`;

// FIXME: We need an example of an EEPROM game here to verify it works. For example, NBA Jam TE (vanilla ROM, without any SRAM hacks)
// const MEGA_EVERDRIVE_PRO_EEPROM_FILENAME = `${DIR}/Wonder Boy in Monster World (USA, Europe).srm`;

describe('Flash cart - Genesis - Mega Everdrive Pro - 32X', () => {
  it('should convert a raw SRAM save to Mega Everdrive Pro format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_SRAM_FILENAME);

    const flashCartSaveData = GenesisMegaEverdrivePro32xFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a Mega Everdrive Pro SRAM save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_SRAM_FILENAME);

    const flashCartSaveData = GenesisMegaEverdrivePro32xFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a raw FRAM save to Mega Everdrive Pro format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_FRAM_FILENAME);

    const flashCartSaveData = GenesisMegaEverdrivePro32xFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a Mega Everdrive Pro FRAM save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_FRAM_FILENAME);

    const flashCartSaveData = GenesisMegaEverdrivePro32xFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  /*
  it('should convert a raw EEPROM save to fMega Everdrive Pro format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_EEPROM_FILENAME);

    const flashCartSaveData = GenesisMegaEverdrivePro32xFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a Mega Everdrive Pro EEPROM save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_EEPROM_FILENAME);

    const flashCartSaveData = GenesisMegaEverdrivePro32xFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });
  */
});
