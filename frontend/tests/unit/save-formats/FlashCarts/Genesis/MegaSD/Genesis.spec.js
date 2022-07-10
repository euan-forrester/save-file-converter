import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import GenesisMegaSdGenesisFlashCartSaveData from '@/save-formats/FlashCarts/Genesis/MegaSD/Genesis';

const DIR = './tests/unit/save-formats/data/flashcarts/genesis';

// const EMULATOR_FRAM_FILENAME = `${DIR}/emulator/Sonic The Hedgehog 3 (USA).sav`; // For some reason, the GenesisPlus emulator writes out a 64kB file here even though the Mega Everdrive Pro writes out 8kB of data

// Not sure why, but most files in the list of sample SRAM saves I was given are padded out with 0x00 and one was padded out with 0xFF
const MEGA_SD_NEW_SRAM_PADDED_00_FILENAME = `${DIR}/megasd/Phantasy Star II (USA, Europe) (Rev A)-new-style.SRM`;
const MEGA_SD_RAW_NEW_SRAM_PADDED_00_FILENAME = `${DIR}/megasd/Phantasy Star II (USA, Europe) (Rev A)-new-style-raw.sav`;

const MEGA_SD_NEW_SRAM_PADDED_00_2_FILENAME = `${DIR}/megasd/Sword of Vermilion (USA, Europe)-new-style.SRM`;
const MEGA_SD_RAW_NEW_SRAM_PADDED_00_2_FILENAME = `${DIR}/megasd/Sword of Vermilion (USA, Europe)-new-style-raw.sav`;

const MEGA_SD_NEW_SRAM_PADDED_FF_3_FILENAME = `${DIR}/megasd/Phantasy Star IV (USA)-new-style.SRM`;
const MEGA_SD_RAW_NEW_SRAM_PADDED_FF_3_FILENAME = `${DIR}/megasd/Phantasy Star IV (USA)-new-style-raw.sav`;
const MEGA_SD_NEW_SRAM_PADDED_00_3_FILENAME = `${DIR}/megasd/Phantasy Star IV (USA)-new-style-converted-back.SRM`;

const MEGA_SD_NEW_EEPROM_FILENAME = `${DIR}/megasd/Wonder Boy in Monster World (USA, Europe)-new-style.SRM`;
const MEGA_SD_RAW_NEW_EEPROM_FILENAME = `${DIR}/megasd/Wonder Boy in Monster World (USA, Europe)-new-style-raw.sav`;

const MEGA_SD_NEW_FRAM_FILENAME = `${DIR}/megasd/Sonic the Hedgehog 3 (USA)-new-style.SRM`;
const MEGA_SD_RAW_NEW_FRAM_FILENAME = `${DIR}/megasd/Sonic the Hedgehog 3 (USA)-new-style-raw.sav`;

const MEGA_SD_OLD_SRAM_FILENAME = `${DIR}/megasd/Phantasy Star II (USA, Europe) (Rev A)-old-style.srm`;
const MEGA_SD_RAW_OLD_SRAM_FILENAME = `${DIR}/megasd/Phantasy Star II (USA, Europe) (Rev A)-old-style-raw.sav`;

describe('Flash cart - Genesis - Mega SD - Genesis', () => {
  it('should convert a Mega SD SRAM save in the new style padded with 0x00 to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_NEW_SRAM_PADDED_00_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_RAW_NEW_SRAM_PADDED_00_FILENAME);

    const flashCartSaveData = GenesisMegaSdGenesisFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw SRAM save back to the Mega SD new style', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_NEW_SRAM_PADDED_00_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_RAW_NEW_SRAM_PADDED_00_FILENAME);

    const flashCartSaveData = GenesisMegaSdGenesisFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartArrayBuffer)).to.equal(true);
  });

  it('should convert a second Mega SD SRAM save in the new style but padded with 0x00 to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_NEW_SRAM_PADDED_00_2_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_RAW_NEW_SRAM_PADDED_00_2_FILENAME);

    const flashCartSaveData = GenesisMegaSdGenesisFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a second raw SRAM save back to the Mega SD new style', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_NEW_SRAM_PADDED_00_2_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_RAW_NEW_SRAM_PADDED_00_2_FILENAME);

    const flashCartSaveData = GenesisMegaSdGenesisFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartArrayBuffer)).to.equal(true);
  });

  it('should convert a third Mega SD SRAM save in the new style but padded with 0xFF to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_NEW_SRAM_PADDED_FF_3_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_RAW_NEW_SRAM_PADDED_FF_3_FILENAME);

    const flashCartSaveData = GenesisMegaSdGenesisFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a third raw SRAM save back to the Mega SD new style but now padded with 0x00', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_NEW_SRAM_PADDED_00_3_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_RAW_NEW_SRAM_PADDED_FF_3_FILENAME);

    const flashCartSaveData = GenesisMegaSdGenesisFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartArrayBuffer)).to.equal(true);
  });

  it('should convert a Mega SD EEPROM save in the new style to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_NEW_EEPROM_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_RAW_NEW_EEPROM_FILENAME);

    const flashCartSaveData = GenesisMegaSdGenesisFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw EEPROM save to the new style', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_NEW_EEPROM_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_RAW_NEW_EEPROM_FILENAME);

    const flashCartSaveData = GenesisMegaSdGenesisFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartArrayBuffer)).to.equal(true);
  });

  it('should convert a Mega SD FRAM save in the new style to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_NEW_FRAM_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_RAW_NEW_FRAM_FILENAME);

    const flashCartSaveData = GenesisMegaSdGenesisFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);

    ArrayBufferUtil.writeArrayBuffer(MEGA_SD_RAW_NEW_FRAM_FILENAME, flashCartSaveData.getRawArrayBuffer());
  });

  it('should convert a raw FRAM save to the new style', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_NEW_FRAM_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_RAW_NEW_FRAM_FILENAME);

    const flashCartSaveData = GenesisMegaSdGenesisFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartArrayBuffer)).to.equal(true);
  });

  it('should convert a Mega SD SRAM save in the old style to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_OLD_SRAM_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_RAW_OLD_SRAM_FILENAME);

    const flashCartSaveData = GenesisMegaSdGenesisFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });
});
