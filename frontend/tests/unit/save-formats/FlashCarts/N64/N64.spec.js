import { expect } from 'chai';
import N64FlashCartSaveData from '@/save-formats/FlashCarts/N64/N64';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/flashcarts/n64';

const RAW_2_KILOBIT_EEPROM_FILENAME = `${DIR}/Star Fox 64.eep`;
const RAW_16_KILOBIT_EEPROM_FILENAME = `${DIR}/yoshis-story.17238.eep`;

const RAW_SRAM_FILENAME = `${DIR}/f-zero-x.15165.sra`;
const FLASHCART_SRAM_FILENAME = `${DIR}/f-zero-x.15165-flashcart.sra`;

const RAW_FLASHRAM_FILENAME = `${DIR}/Pokemon Snap.fla`;
const FLASHCART_FLASHRAM_FILENAME = `${DIR}/Pokemon Snap-flashcart.fla`;

describe('Flash cart - N64', () => {
  it('should convert a raw 2kb EEPROM N64 save to flash cart format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_2_KILOBIT_EEPROM_FILENAME);

    const n64FlashCartSaveData = N64FlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(n64FlashCartSaveData.getFlashCartArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a flash cart 2kb EEPROM N64 save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_2_KILOBIT_EEPROM_FILENAME);

    const n64FlashCartSaveData = N64FlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(n64FlashCartSaveData.getRawArrayBuffer(), flashCartArrayBuffer)).to.equal(true);
  });

  it('should convert a raw 16kb EEPROM N64 save to flash cart format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_16_KILOBIT_EEPROM_FILENAME);

    const n64FlashCartSaveData = N64FlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(n64FlashCartSaveData.getFlashCartArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a flash cart 16kb EEPROM N64 save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_16_KILOBIT_EEPROM_FILENAME);

    const n64FlashCartSaveData = N64FlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(n64FlashCartSaveData.getRawArrayBuffer(), flashCartArrayBuffer)).to.equal(true);
  });

  it('should convert a raw SRAM N64 save to flash cart format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_SRAM_FILENAME);
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(FLASHCART_SRAM_FILENAME);

    const n64FlashCartSaveData = N64FlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(n64FlashCartSaveData.getFlashCartArrayBuffer(), flashCartArrayBuffer)).to.equal(true);
  });

  it('should convert a flash cart SRAM N64 save to raw format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_SRAM_FILENAME);
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(FLASHCART_SRAM_FILENAME);

    const n64FlashCartSaveData = N64FlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(n64FlashCartSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw FlashRAM N64 save to flash cart format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FLASHRAM_FILENAME);
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(FLASHCART_FLASHRAM_FILENAME);

    const n64FlashCartSaveData = N64FlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(n64FlashCartSaveData.getFlashCartArrayBuffer(), flashCartArrayBuffer)).to.equal(true);
  });

  it('should convert a flash cart FlashRAM N64 save to raw format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FLASHRAM_FILENAME);
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(FLASHCART_FLASHRAM_FILENAME);

    const n64FlashCartSaveData = N64FlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(n64FlashCartSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });
});
