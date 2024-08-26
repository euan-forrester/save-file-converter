import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import MGbaSaveStateData from '@/save-formats/OnlineEmulators/Emulators/mGba';

const DIR = './tests/data/save-formats/online-emulators/retrogames.onl/gba';

/*
const EMULATOR_INVALID_SAVE_STATE_FILE = `${DIR}/invalid-save-state.save`;
*/

// We have some multiples here because it can be tricky to find the in-game save within a save state file:
// that file also contains the system's memory which might also contain a copy of the in-game save.
// So we have a couple of examples of most of the save types to help make sure we're consistently finding the right
// offsets in each save state file.

/*
const EMULATOR_EEPROM_512B_FILENAME = `${DIR}/donkey-kong-country-3.save`;
const RAW_EEPROM_512B_FILENAME = `${DIR}/donkey-kong-country-3.sav`;
*/

const EMULATOR_EEPROM_8KB_FILENAME = `${DIR}/zelda-minish-cap.state`;
const RAW_EEPROM_8KB_FILENAME = `${DIR}/zelda-minish-cap.sav`;

/*
const EMULATOR_SRAM_32KB_FILENAME_1 = `${DIR}/metroid-zero-mission.save`;
const RAW_SRAM_32KB_FILENAME_1 = `${DIR}/metroid-zero-mission.sav`;

const EMULATOR_SRAM_32KB_FILENAME_2 = `${DIR}/metroid-fusion.save`;
const RAW_SRAM_32KB_FILENAME_2 = `${DIR}/metroid-fusion.sav`;

const EMULATOR_FLASH_RAM_64KB_FILENAME_1 = `${DIR}/golden-sun.save`;
const RAW_FLASH_RAM_64KB_FILENAME_1 = `${DIR}/golden-sun.sav`;

const EMULATOR_FLASH_RAM_64KB_FILENAME_2 = `${DIR}/advance-wars.save`;
const RAW_FLASH_RAM_64KB_FILENAME_2 = `${DIR}/advance-wars.sav`;

const EMULATOR_FLASH_RAM_128KB_FILENAME_1 = `${DIR}/pokemon-sapphire.save`;
const RAW_FLASH_RAM_128KB_FILENAME_1 = `${DIR}/pokemon-sapphire.sav`;

const EMULATOR_FLASH_RAM_128KB_FILENAME_2 = `${DIR}/super-mario-advance-4.save`;
const RAW_FLASH_RAM_128KB_FILENAME_2 = `${DIR}/super-mario-advance-4.sav`;
*/

describe('OnlineEmulators - GBA - mGBA', () => {
  /*
  it('should convert an emulator save state containing a 512B EEPROM save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_EEPROM_512B_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_EEPROM_512B_FILENAME);

    const emulatorSaveStateData = MGbaSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer, 512);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });
  */

  it('should convert an emulator save state containing a 8kB EEPROM save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_EEPROM_8KB_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_EEPROM_8KB_FILENAME);

    const emulatorSaveStateData = MGbaSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer, 8192);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  /*
  it('should convert an emulator save state containing a 32kB SRAM save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_SRAM_32KB_FILENAME_1);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_SRAM_32KB_FILENAME_1);

    const emulatorSaveStateData = MGbaSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer, 32768);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a second emulator save state containing a 32kB SRAM save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_SRAM_32KB_FILENAME_2);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_SRAM_32KB_FILENAME_2);

    const emulatorSaveStateData = MGbaSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer, 32768);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert an emulator save state containing a 64kB Flash RAM save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_FLASH_RAM_64KB_FILENAME_1);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FLASH_RAM_64KB_FILENAME_1);

    const emulatorSaveStateData = MGbaSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer, 65536);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a second emulator save state containing a 64kB Flash RAM save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_FLASH_RAM_64KB_FILENAME_2);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FLASH_RAM_64KB_FILENAME_2);

    const emulatorSaveStateData = MGbaSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer, 65536);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert an emulator save state containing a 128kB Flash RAM save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_FLASH_RAM_128KB_FILENAME_1);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FLASH_RAM_128KB_FILENAME_1);

    const emulatorSaveStateData = MGbaSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer, 131072);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a second emulator save state containing a 128kB Flash RAM save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_FLASH_RAM_128KB_FILENAME_2);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FLASH_RAM_128KB_FILENAME_2);

    const emulatorSaveStateData = MGbaSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer, 131072);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should correctly reject an invalid save size', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_EEPROM_512B_FILENAME);

    expect(() => MGbaSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer, 1234)).to.throw(
      Error,
      '1234 is not a valid save size for a GBA game',
    );
  });

  it('should correctly reject a file that is too short', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_INVALID_SAVE_STATE_FILE);

    expect(() => MGbaSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer, 512)).to.throw(
      Error,
      'This does not appear to be a VBA-Next save state file',
    );
  });
  */
});
