import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import GenesisMegaSdGenesisFlashCartSaveData from '@/save-formats/FlashCarts/Genesis/MegaSD/Genesis';

const DIR = './tests/unit/save-formats/data/flashcarts/genesis';

// const EMULATOR_FRAM_FILENAME = `${DIR}/emulator/Sonic The Hedgehog 3 (USA).sav`; // For some reason, the GenesisPlus emulator writes out a 64kB file here even though the Mega Everdrive Pro writes out 8kB of data

const MEGA_SD_SRAM_FILENAME = `${DIR}/megasd/Phantasy Star II (USA, Europe) (Rev A).srm`;
const MEGA_SD_RAW_SRAM_FILENAME = `${DIR}/megasd/Phantasy Star II (USA, Europe) (Rev A)-raw.srm`;

describe('Flash cart - Genesis - Mega SD - Genesis', () => {
  /*
  it('should convert a Mega SD SMS save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_SMS_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProSmsFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });
  */

  /*
  it('should convert a raw SRAM save to Mega SD format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_SRAM_FILENAME)
    // const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_RAW_SRAM_FILENAME);

    const flashCartSaveData = GenesisMegaSdGenesisFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });
  */

  it('should convert a Mega SD SRAM save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_SRAM_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_RAW_SRAM_FILENAME);

    const flashCartSaveData = GenesisMegaSdGenesisFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });
});
