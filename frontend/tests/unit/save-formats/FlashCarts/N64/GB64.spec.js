import { expect } from 'chai';
import Gb64EmulatorSaveData from '@/save-formats/FlashCarts/N64/GB64Emulator';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/data/save-formats/flashcarts/n64/gb64emulator';

const GB64_GB_FILENAME = `${DIR}/Legend of Zelda, The - Link's Awakening (USA, Europe)-everdrive.fla`;
const GB64_TO_RAW_GB_FILENAME = `${DIR}/Legend of Zelda, The - Link's Awakening (USA, Europe)-everdrive-to-raw.sav`;
const GB64_GB_UNCOMPRESSED_DATA_FILENAME = `${DIR}/Legend of Zelda, The - Link's Awakening (USA, Europe)-everdrive-uncompressed-data.sav`;

const RAW_GB_FILENAME = `${DIR}/Legend of Zelda, The - Link's Awakening (USA, Europe)-emulator.sav`;
const RAW_GB_TO_GB64_FILENAME = `${DIR}/Legend of Zelda, The - Link's Awakening (USA, Europe)-emulator-to-everdrive.fla`;

const GB_ZELDA_SRAM_SIZE = 8192;
const GBC_ZELDA_SRAM_SIZE = 8192;

const GB64_GBC_FILENAME = `${DIR}/Legend of Zelda, The - Oracle of Seasons (USA, Australia)-everdrive.fla`;
const GB64_GBC_TO_RAW_FILENAME = `${DIR}/Legend of Zelda, The - Oracle of Seasons (USA, Australia)-everdrive-to-raw.sav`;
const GB64_GBC_UNCOMPRESSED_DATA_FILENAME = `${DIR}/Legend of Zelda, The - Oracle of Seasons (USA, Australia)-everdrive-uncompressed-data.sav`;

const RAW_GBC_FILENAME = `${DIR}/Legend of Zelda, The - Oracle of Seasons (USA, Australia)-emulator.sav`;
const RAW_GBC_TO_GB64_FILENAME = `${DIR}/Legend of Zelda, The - Oracle of Seasons (USA, Australia)-emulator-to-everdrive.fla`;

describe('Flash cart - N64 - GB64 emulator save format', () => {
  it('should convert a GB64 emulator GB save made with an Everdrive 64 to raw format', async () => {
    const gb64ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GB64_GB_FILENAME);
    const uncompressedData = await ArrayBufferUtil.readArrayBuffer(GB64_GB_UNCOMPRESSED_DATA_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GB64_TO_RAW_GB_FILENAME);

    const gb64EmulatorSaveData = Gb64EmulatorSaveData.createFromFlashCartDataInternal(gb64ArrayBuffer, GB_ZELDA_SRAM_SIZE);

    expect(ArrayBufferUtil.arrayBuffersEqual(gb64EmulatorSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(gb64EmulatorSaveData.getGameboyStateDataArrayBuffer(), uncompressedData)).to.equal(true);
  });

  it('should convert a GB raw save to the GB64 save format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_FILENAME);
    const gb64ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_TO_GB64_FILENAME);

    const gb64EmulatorSaveData = Gb64EmulatorSaveData.createFromRawData(rawArrayBuffer, false);

    expect(ArrayBufferUtil.arrayBuffersEqual(gb64EmulatorSaveData.getFlashCartArrayBuffer(), gb64ArrayBuffer)).to.equal(true);
  });

  it('should be able to parse a GB file that it created', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_FILENAME);

    const gb64EmulatorSaveData = Gb64EmulatorSaveData.createFromRawData(rawArrayBuffer, false);
    const gb64EmulatorSaveDataParsed = Gb64EmulatorSaveData.createFromFlashCartDataInternal(gb64EmulatorSaveData.getFlashCartArrayBuffer(), GB_ZELDA_SRAM_SIZE);

    expect(ArrayBufferUtil.arrayBuffersEqual(gb64EmulatorSaveDataParsed.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a GB64 emulator GBC save made with an Everdrive 64 to raw format', async () => {
    const gb64ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GB64_GBC_FILENAME);
    const uncompressedData = await ArrayBufferUtil.readArrayBuffer(GB64_GBC_UNCOMPRESSED_DATA_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GB64_GBC_TO_RAW_FILENAME);

    const gb64EmulatorSaveData = Gb64EmulatorSaveData.createFromFlashCartDataInternal(gb64ArrayBuffer, GBC_ZELDA_SRAM_SIZE);

    expect(ArrayBufferUtil.arrayBuffersEqual(gb64EmulatorSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(gb64EmulatorSaveData.getGameboyStateDataArrayBuffer(), uncompressedData)).to.equal(true);
  });

  it('should convert a GBC raw save to the GB64 save format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_FILENAME);
    const gb64ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_TO_GB64_FILENAME);

    const gb64EmulatorSaveData = Gb64EmulatorSaveData.createFromRawData(rawArrayBuffer, true);

    expect(ArrayBufferUtil.arrayBuffersEqual(gb64EmulatorSaveData.getFlashCartArrayBuffer(), gb64ArrayBuffer)).to.equal(true);
  });

  it('should be able to parse a GBC file that it created', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_FILENAME);

    const gb64EmulatorSaveData = Gb64EmulatorSaveData.createFromRawData(rawArrayBuffer, true);
    const gb64EmulatorSaveDataParsed = Gb64EmulatorSaveData.createFromFlashCartDataInternal(gb64EmulatorSaveData.getFlashCartArrayBuffer(), GBC_ZELDA_SRAM_SIZE);

    expect(ArrayBufferUtil.arrayBuffersEqual(gb64EmulatorSaveDataParsed.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });
});
