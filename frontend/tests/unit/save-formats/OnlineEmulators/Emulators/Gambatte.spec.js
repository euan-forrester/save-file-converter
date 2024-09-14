import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import GambatteSaveStateData from '@/save-formats/OnlineEmulators/Emulators/Gambatte';

const DIR = './tests/data/save-formats/online-emulators/retrogames.onl/gb';

// We have some multiples here to test that SRAM of different sizes, and on different machines (GB vs GBC vs dual compatibility games)
// all have the SRAM at the same spot in the save state

const EMULATOR_WRONG_SIZE_SAVE_STATE_FILE = `${DIR}/wrong-size.state`;
const EMULATOR_INVALID_FILE_SAVE_STATE_FILE = `${DIR}/invalid-file.state`;

const EMULATOR_GB_512B_FILENAME = `${DIR}/final-fantasy-legend-gboy.state`;
const RAW_GB_512B_FILENAME = `${DIR}/final-fantasy-legend-gboy.sav`;

const EMULATOR_GB_32KB_FILENAME = `${DIR}/pokemon-yellow.state`;
const RAW_GB_32KB_FILENAME = `${DIR}/pokemon-yellow.sav`;

const EMULATOR_GB_GBC_32KB_FILENAME = `${DIR}/legend-zelda-link-awakening-dx.state`;
const RAW_GB_GBC_32KB_FILENAME = `${DIR}/legend-zelda-link-awakening-dx.sav`;

const EMULATOR_GB_GBC_32KB_2_FILENAME = `${DIR}/wario-land-2-gbcolor.state`; // There's not a ton of dual-compatibility games, and these 2 happen to have the same save size
const RAW_GB_GBC_32KB_2_FILENAME = `${DIR}/wario-land-2-gbcolor.sav`;

const EMULATOR_GBC_8KB_FILENAME = `${DIR}/zelda-oracle-sesion.state`;
const RAW_GBC_8KB_FILENAME = `${DIR}/zelda-oracle-sesion.sav`;

const EMULATOR_GBC_32KB_FILENAME = `${DIR}/pokemon-crystal.state`;
const RAW_GBC_32KB_FILENAME = `${DIR}/pokemon-crystal.sav`;

describe('OnlineEmulators - Gambatte', () => {
  it('should convert an emulator save state containing a 512B GB save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_GB_512B_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_512B_FILENAME);

    const emulatorSaveStateData = GambatteSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert an emulator save state containing a 32kB GB save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_GB_32KB_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_32KB_FILENAME);

    const emulatorSaveStateData = GambatteSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert an emulator save state containing a 32kB GB/GBC save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_GB_GBC_32KB_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_GBC_32KB_FILENAME);

    const emulatorSaveStateData = GambatteSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert another emulator save state containing a 32kB GB/GBC save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_GB_GBC_32KB_2_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_GBC_32KB_2_FILENAME);

    const emulatorSaveStateData = GambatteSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert an emulator save state containing a 8kB GBC save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_GBC_8KB_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_8KB_FILENAME);

    const emulatorSaveStateData = GambatteSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert an emulator save state containing a 32kB GBC save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_GBC_32KB_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_32KB_FILENAME);

    const emulatorSaveStateData = GambatteSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should correctly reject a file that is too short', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_WRONG_SIZE_SAVE_STATE_FILE);

    expect(() => GambatteSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer)).to.throw(
      Error,
      'This does not appear to be an Gambatte save state file: file is too short',
    );
  });

  it('should correctly reject a file missing the required magic', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_INVALID_FILE_SAVE_STATE_FILE);

    expect(() => GambatteSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer)).to.throw(
      Error,
      'Save appears corrupted: found \'\x00\x00\x00\x00\' instead of \'sram\'',
    );
  });
});
