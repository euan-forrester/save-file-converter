import { expect } from 'chai';
import MisterGameboyAdvanceSaveData from '@/save-formats/Mister/GameboyAdvance';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/data/save-formats/mister/gba';

const RAW_REGULAR_GAME_FILENAME = `${DIR}/the-legend-of-zelda-the-minish-cap.srm`;
const MISTER_REGULAR_GAME_FILENAME = `${DIR}/the-legend-of-zelda-the-minish-cap.sav`;

const RAW_512B_EEPROM_FILENAME = `${DIR}/Final_Fight_One_Japan-raw.srm`;
const RAW_512B_EEPROM_CONVERTED_BACK_FILENAME = `${DIR}/Final_Fight_One_Japan-raw-converted-back.srm`; // We can't automatically truncate the file since we don't know whether it was a 512B save or 8192B
const MISTER_512B_EEPROM_FILENAME = `${DIR}/Final_Fight_One_Japan-mister.sav`;

const RAW_GAME_WITH_RTC_DATA = `${DIR}/pokemon-sapphire-raw.srm`;
const MISTER_GAME_WITH_RTC_DATA_FAKE = `${DIR}/pokemon-sapphire-mister-fake-rtc.sav`; // I don't have an example file from a real MiSTer with RTC data, so I created one by hand
const MISTER_GAME_WITH_RTC_DATA_MISSING = `${DIR}/pokemon-sapphire-mister-no-rtc.sav`; // The MiSTer can load a save without RTC data in it: the RTC just won't be initialized correctly. We are unable to construct valid RTC data, and we don't know whether a particular game requires RTC anyway. We could add a UI element, but that's more burden for the user

describe('MiSTer - Gameboy Advance save format', () => {
  it('should convert a raw save to the MiSTer format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_REGULAR_GAME_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_REGULAR_GAME_FILENAME);

    const misterGameboyAdvanceSaveData = MisterGameboyAdvanceSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterGameboyAdvanceSaveData.getMisterArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });

  it('should convert a MiSTer save to raw format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_REGULAR_GAME_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_REGULAR_GAME_FILENAME);

    const misterGameboyAdvanceSaveData = MisterGameboyAdvanceSaveData.createFromMisterData(misterArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterGameboyAdvanceSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw 512B EEPROM save to the MiSTer format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_512B_EEPROM_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_512B_EEPROM_FILENAME);

    const misterGameboyAdvanceSaveData = MisterGameboyAdvanceSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterGameboyAdvanceSaveData.getMisterArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });

  it('should convert a MiSTer 512B EEPROM save to raw format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_512B_EEPROM_CONVERTED_BACK_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_512B_EEPROM_FILENAME);

    const misterGameboyAdvanceSaveData = MisterGameboyAdvanceSaveData.createFromMisterData(misterArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterGameboyAdvanceSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw save for a game that uses RTC data to the MiSTer format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GAME_WITH_RTC_DATA);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_GAME_WITH_RTC_DATA_MISSING);

    const misterGameboyAdvanceSaveData = MisterGameboyAdvanceSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterGameboyAdvanceSaveData.getMisterArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });

  it('should convert a MiSTer save with RTC data to raw format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GAME_WITH_RTC_DATA);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_GAME_WITH_RTC_DATA_FAKE);

    const misterGameboyAdvanceSaveData = MisterGameboyAdvanceSaveData.createFromMisterData(misterArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterGameboyAdvanceSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });
});
