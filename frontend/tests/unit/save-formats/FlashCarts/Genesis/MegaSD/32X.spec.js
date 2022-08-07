import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import GenesisMegaSd32xFlashCartSaveData from '@/save-formats/FlashCarts/Genesis/MegaSD/32X';

const DIR = './tests/unit/save-formats/data/flashcarts/genesis/megasd';

const MEGA_SD_NEW_SRAM_FILENAME = `${DIR}/36 Great Holes Starring Fred Couples (Japan, USA).SRM`;
const MEGA_SD_RAW_NEW_SRAM_FILENAME = `${DIR}/36 Great Holes Starring Fred Couples (Japan, USA)-raw.sav`;

const MEGA_SD_NEW_FRAM_FILENAME = `${DIR}/Knuckles' Chaotix (Japan, USA) (En).SRM`;
const MEGA_SD_RAW_NEW_FRAM_FILENAME = `${DIR}/Knuckles' Chaotix (Japan, USA) (En)-raw.sav`;

// FIXME: We need an example of an EEPROM game here to verify it works. For example, NBA Jam TE (vanilla ROM, without any SRAM hacks)
/*
const MEGA_SD_NEW_EEPROM_FILENAME = `${DIR}/Wonder Boy in Monster World (USA, Europe)-new-style.SRM`;
const MEGA_SD_RAW_NEW_EEPROM_FILENAME = `${DIR}/Wonder Boy in Monster World (USA, Europe)-new-style-raw.sav`;
*/

describe('Flash cart - Genesis - Mega SD - 32X', () => {
  it('should convert a Mega SD SRAM save in the new style to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_NEW_SRAM_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_RAW_NEW_SRAM_FILENAME);

    const flashCartSaveData = GenesisMegaSd32xFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw SRAM save back to the Mega SD new style', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_NEW_SRAM_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_RAW_NEW_SRAM_FILENAME);

    const flashCartSaveData = GenesisMegaSd32xFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartArrayBuffer)).to.equal(true);
  });

  it('should convert a Mega SD FRAM save in the new style to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_NEW_FRAM_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_RAW_NEW_FRAM_FILENAME);

    const flashCartSaveData = GenesisMegaSd32xFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);

    ArrayBufferUtil.writeArrayBuffer(MEGA_SD_RAW_NEW_FRAM_FILENAME, flashCartSaveData.getRawArrayBuffer());
  });

  it('should convert a raw FRAM save back to the Mega SD new style', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_NEW_FRAM_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_RAW_NEW_FRAM_FILENAME);

    const flashCartSaveData = GenesisMegaSd32xFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartArrayBuffer)).to.equal(true);
  });

  /*
  it('should convert a Mega SD EEPROM save in the new style to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_NEW_EEPROM_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_RAW_NEW_EEPROM_FILENAME);

    const flashCartSaveData = GenesisMegaSd32xFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw EEPROM save to the new style', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_NEW_EEPROM_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_SD_RAW_NEW_EEPROM_FILENAME);

    const flashCartSaveData = GenesisMegaSd32xFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartArrayBuffer)).to.equal(true);
  });
  */
});
