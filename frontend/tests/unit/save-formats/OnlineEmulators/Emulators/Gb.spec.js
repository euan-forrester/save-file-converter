import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import GbSaveStateData from '@/save-formats/OnlineEmulators/Emulators/Gb';

const DIR = './tests/data/save-formats/online-emulators/arcadespot.com/gb';

// We have some multiples here to test that SRAM of different sizes, and on different machines (GB vs GBC vs dual compatibility games)
// all have the SRAM at the same spot in the save state

const EMULATOR_INVALID_SAVE_STATE_FILE = `${DIR}/invalid-save-state.save`;

const EMULATOR_GB_512B_FILENAME = `${DIR}/final-fantasy-legend.save`;
const RAW_GB_512B_FILENAME = `${DIR}/final-fantasy-legend.sav`;

const EMULATOR_GB_8KB_FILENAME = `${DIR}/legend-of-zelda-the-links-awakening.save`;
const RAW_GB_8KB_FILENAME = `${DIR}/legend-of-zelda-the-links-awakening.sav`;

const EMULATOR_GB_32KB_FILENAME = `${DIR}/pokemon-yellow.save`;
const RAW_GB_32KB_FILENAME = `${DIR}/pokemon-yellow.sav`;

const EMULATOR_GB_GBC_32KB_FILENAME = `${DIR}/the-legend-of-zelda-links-awakening-dx.save`;
const RAW_GB_GBC_32KB_FILENAME = `${DIR}/the-legend-of-zelda-links-awakening-dx.sav`;

const EMULATOR_GB_GBC_32KB_2_FILENAME = `${DIR}/wario-land-2.save`; // There's not a ton of dual-compatibility games, and these 2 happen to have the same save size
const RAW_GB_GBC_32KB_2_FILENAME = `${DIR}/wario-land-2.sav`;

const EMULATOR_GBC_8KB_FILENAME = `${DIR}/the-legend-of-zelda-oracle-of-seasons.save`;
const RAW_GBC_8KB_FILENAME = `${DIR}/the-legend-of-zelda-oracle-of-seasons.sav`;

const EMULATOR_GBC_32KB_FILENAME = `${DIR}/pokemon-crystal.save`;
const RAW_GBC_32KB_FILENAME = `${DIR}/pokemon-crystal.sav`;

describe('OnlineEmulators - GB', () => {
  it('should convert an emulator save state containing a 512B GB save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_GB_512B_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_512B_FILENAME);

    const emulatorSaveStateData = GbSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer, 512);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert an emulator save state containing a 8kB GB save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_GB_8KB_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_8KB_FILENAME);

    const emulatorSaveStateData = GbSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer, 8192);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert an emulator save state containing a 32kB GB save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_GB_32KB_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_32KB_FILENAME);

    const emulatorSaveStateData = GbSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer, 32768);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert an emulator save state containing a 32kB GB/GBC save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_GB_GBC_32KB_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_GBC_32KB_FILENAME);

    const emulatorSaveStateData = GbSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer, 32768);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert another emulator save state containing a 32kB GB/GBC save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_GB_GBC_32KB_2_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_GBC_32KB_2_FILENAME);

    const emulatorSaveStateData = GbSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer, 32768);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert an emulator save state containing a 8kB GBC save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_GBC_8KB_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_8KB_FILENAME);

    const emulatorSaveStateData = GbSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer, 8192);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert an emulator save state containing a 32kB GBC save to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_GBC_32KB_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_32KB_FILENAME);

    const emulatorSaveStateData = GbSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer, 32768);

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should correctly reject a file that is too short', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_INVALID_SAVE_STATE_FILE);

    expect(() => GbSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer, 512)).to.throw(
      Error,
      'This does not appear to be a Gameboy save state file',
    );
  });
});
