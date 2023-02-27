import { expect } from 'chai';
import NsoN64SaveData from '@/save-formats/NintendoSwitchOnline/N64';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/data/save-formats/nintendoswitchonline/n64';

const RAW_2_KILOBIT_EEPROM_FILENAME = `${DIR}/Mario 64 N64.sram`;
const RAW_16_KILOBIT_EEPROM_FILENAME = `${DIR}/Mario Tennis N64.sram`;

const RAW_SRAM_FILENAME = `${DIR}/F-Zero N64.sra`;
const NSO_SRAM_FILENAME = `${DIR}/F-Zero N64.sram`;

const RAW_FLASHRAM_FILENAME = `${DIR}/Majoras Mask N64.fla`;
const NSO_FLASHRAM_FILENAME = `${DIR}/Majoras Mask N64.sram`;

// Note that we also have a save for Operation Winback in the above directory. That game uses the Controller Pak
// to save, which isn't emulated by Nintendo Switch Online. Keeping the resultant save here (which just contains
// the magic "BLANKSRAM") for documentation purposes.

describe('Nintendo Switch Online - N64', () => {
  it('should convert a raw 2kb EEPROM N64 save to flash cart format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_2_KILOBIT_EEPROM_FILENAME);

    const nsoN64SaveData = NsoN64SaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoN64SaveData.getNsoArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a flash cart 2kb EEPROM N64 save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_2_KILOBIT_EEPROM_FILENAME);

    const nsoN64SaveData = NsoN64SaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoN64SaveData.getRawArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a raw 16kb EEPROM N64 save to flash cart format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_16_KILOBIT_EEPROM_FILENAME);

    const nsoN64SaveData = NsoN64SaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoN64SaveData.getNsoArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a flash cart 16kb EEPROM N64 save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_16_KILOBIT_EEPROM_FILENAME);

    const nsoN64SaveData = NsoN64SaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoN64SaveData.getRawArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a raw SRAM N64 save to flash cart format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_SRAM_FILENAME);
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_SRAM_FILENAME);

    const nsoN64SaveData = NsoN64SaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoN64SaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a flash cart SRAM N64 save to raw format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_SRAM_FILENAME);
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_SRAM_FILENAME);

    const nsoN64SaveData = NsoN64SaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoN64SaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw FlashRAM N64 save to flash cart format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FLASHRAM_FILENAME);
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_FLASHRAM_FILENAME);

    const nsoN64SaveData = NsoN64SaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoN64SaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a flash cart FlashRAM N64 save to raw format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FLASHRAM_FILENAME);
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_FLASHRAM_FILENAME);

    const nsoN64SaveData = NsoN64SaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoN64SaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });
});
