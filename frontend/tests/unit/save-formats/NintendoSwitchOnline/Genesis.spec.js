import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import NsoGenesisSaveData from '@/save-formats/NintendoSwitchOnline/Genesis';

const DIR = './tests/data/save-formats/nintendoswitchonline/genesis';

const GENESIS_SRAM_FILENAME = `${DIR}/Phantasy Star 4 SEGA GENESIS.sram`;
const RAW_SRAM_FILENAME = `${DIR}/Phantasy Star 4 SEGA GENESIS.sav`;

const GENESIS_EEPROM_FILENAME = `${DIR}/MegaMan Wily Wars SEGA GENESIS.sram`;
const RAW_EEPROM_FILENAME = `${DIR}/MegaMan Wily Wars SEGA GENESIS.sav`;

describe('Nintendo Switch Online - Genesis', () => {
  it('should convert a raw Genesis SRAM save to NSO format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_SRAM_FILENAME);
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GENESIS_SRAM_FILENAME);

    const nsoGenesisSaveData = NsoGenesisSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoGenesisSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO Genesis SRAM save to raw format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_SRAM_FILENAME);
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GENESIS_SRAM_FILENAME);

    const nsoGenesisSaveData = NsoGenesisSaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoGenesisSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw Genesis EEPROM save to NSO format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_EEPROM_FILENAME);
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GENESIS_EEPROM_FILENAME);

    const nsoGenesisSaveData = NsoGenesisSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoGenesisSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO Genesis EEPROM save to raw format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_EEPROM_FILENAME);
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GENESIS_EEPROM_FILENAME);

    const nsoGenesisSaveData = NsoGenesisSaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoGenesisSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });
});
