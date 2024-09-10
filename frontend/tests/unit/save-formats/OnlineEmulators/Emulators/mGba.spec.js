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

const EMULATOR_EEPROM_512B_FILENAME = `${DIR}/baldurs-gate.state`;
const RAW_EEPROM_512B_FILENAME = `${DIR}/baldurs-gate.sav`;

const EMULATOR_EEPROM_8KB_FILENAME = `${DIR}/zelda-minish-cap.state`;
const RAW_EEPROM_8KB_FILENAME = `${DIR}/zelda-minish-cap.sav`;

const EMULATOR_SRAM_32KB_FILENAME_1 = `${DIR}/metroid-zero-mission.state`;
const RAW_SRAM_32KB_FILENAME_1 = `${DIR}/metroid-zero-mission.sav`;

const EMULATOR_SRAM_32KB_FILENAME_2 = `${DIR}/metroid-fusion.state`;
const RAW_SRAM_32KB_FILENAME_2 = `${DIR}/metroid-fusion.sav`;

const EMULATOR_FLASH_RAM_64KB_FILENAME_1 = `${DIR}/golden-sun-gmba.state`;
const RAW_FLASH_RAM_64KB_FILENAME_1 = `${DIR}/golden-sun-gmba.sav`;

const EMULATOR_FLASH_RAM_64KB_FILENAME_2 = `${DIR}/advance-wars-gmba.state`;
const RAW_FLASH_RAM_64KB_FILENAME_2 = `${DIR}/advance-wars-gmba.sav`;

const EMULATOR_FLASH_RAM_128KB_FILENAME_1 = `${DIR}/pokemon-sapphire.state`;
const RAW_FLASH_RAM_128KB_FILENAME_1 = `${DIR}/pokemon-sapphire.sav`;

const EMULATOR_FLASH_RAM_128KB_FILENAME_2 = `${DIR}/super-mario-advance-4.state`;
const RAW_FLASH_RAM_128KB_FILENAME_2 = `${DIR}/super-mario-advance-4.sav`;

const EMULATOR_WRONG_SIZE_FILENAME = `${DIR}/wrong-size.state`;
const EMULATOR_INVALID_SAVE_STATE_FILE = `${DIR}/invalid-file.state`;

describe('OnlineEmulators - GBA - mGBA', () => {
  it('should convert an emulator save state containing a 512B EEPROM save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_EEPROM_512B_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_EEPROM_512B_FILENAME);

    const emulatorSaveStateData = MGbaSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert an emulator save state containing a 8kB EEPROM save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_EEPROM_8KB_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_EEPROM_8KB_FILENAME);

    const emulatorSaveStateData = MGbaSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert an emulator save state containing a 32kB SRAM save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_SRAM_32KB_FILENAME_1);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_SRAM_32KB_FILENAME_1);

    const emulatorSaveStateData = MGbaSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a second emulator save state containing a 32kB SRAM save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_SRAM_32KB_FILENAME_2);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_SRAM_32KB_FILENAME_2);

    const emulatorSaveStateData = MGbaSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert an emulator save state containing a 64kB Flash RAM save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_FLASH_RAM_64KB_FILENAME_1);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FLASH_RAM_64KB_FILENAME_1);

    const emulatorSaveStateData = MGbaSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a second emulator save state containing a 64kB Flash RAM save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_FLASH_RAM_64KB_FILENAME_2);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FLASH_RAM_64KB_FILENAME_2);

    const emulatorSaveStateData = MGbaSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert an emulator save state containing a 128kB Flash RAM save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_FLASH_RAM_128KB_FILENAME_1);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FLASH_RAM_128KB_FILENAME_1);

    const emulatorSaveStateData = MGbaSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a second emulator save state containing a 128kB Flash RAM save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_FLASH_RAM_128KB_FILENAME_2);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FLASH_RAM_128KB_FILENAME_2);

    const emulatorSaveStateData = MGbaSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should correctly reject an invalid save size', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_WRONG_SIZE_FILENAME);

    expect(() => MGbaSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer)).to.throw(
      Error,
      'This does not appear to be an mGBA save state file: 305419896 is not a valid GBA save file size',
    );
  });

  it('should correctly reject a file that is too short', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_INVALID_SAVE_STATE_FILE);

    expect(() => MGbaSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer)).to.throw(
      Error,
      'This does not appear to be an mGBA save state file: file is too short',
    );
  });
});
