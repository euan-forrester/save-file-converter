import { expect } from 'chai';
import MisterN64CartSaveData from '@/save-formats/Mister/N64Cart';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/data/save-formats/mister/n64';

const MISTER_512B_EEPROM_FILENAME = `${DIR}/Banjo-Kazooie (USA).eep`;
const MISTER_2KB_EEPROM_FILENAME = `${DIR}/Donkey Kong 64 (USA).eep`;
const MISTER_SRAM_FILENAME = `${DIR}/Legend of Zelda, The - Ocarina of Time (USA).sra`;
const MISTER_FLASH_RAM_FILENAME = `${DIR}/Legend of Zelda, The - Majora's Mask (USA).fla`;

describe('MiSTer - N64 cartridge save format', () => {
  it('should convert a raw 512B EEPROM save to the MiSTer format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_512B_EEPROM_FILENAME);

    const misterGameboyAdvanceSaveData = MisterN64CartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterGameboyAdvanceSaveData.getMisterArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a MiSTer 512B EEPROM save to raw format', async () => {
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_512B_EEPROM_FILENAME);

    const misterGameboyAdvanceSaveData = MisterN64CartSaveData.createFromMisterData(misterArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterGameboyAdvanceSaveData.getRawArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });

  it('should convert a raw 2KB EEPROM save to the MiSTer format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_2KB_EEPROM_FILENAME);

    const misterGameboyAdvanceSaveData = MisterN64CartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterGameboyAdvanceSaveData.getMisterArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a MiSTer 2KB EEPROM save to raw format', async () => {
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_2KB_EEPROM_FILENAME);

    const misterGameboyAdvanceSaveData = MisterN64CartSaveData.createFromMisterData(misterArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterGameboyAdvanceSaveData.getRawArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });

  it('should convert a raw SRAM save to the MiSTer format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_SRAM_FILENAME);

    const misterGameboyAdvanceSaveData = MisterN64CartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterGameboyAdvanceSaveData.getMisterArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a MiSTer SRAM save to raw format', async () => {
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_SRAM_FILENAME);

    const misterGameboyAdvanceSaveData = MisterN64CartSaveData.createFromMisterData(misterArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterGameboyAdvanceSaveData.getRawArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });

  it('should convert a raw Flash RAM save to the MiSTer format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_FLASH_RAM_FILENAME);

    const misterGameboyAdvanceSaveData = MisterN64CartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterGameboyAdvanceSaveData.getMisterArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a MiSTer Flash RAM save to raw format', async () => {
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_FLASH_RAM_FILENAME);

    const misterGameboyAdvanceSaveData = MisterN64CartSaveData.createFromMisterData(misterArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterGameboyAdvanceSaveData.getRawArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });
});
