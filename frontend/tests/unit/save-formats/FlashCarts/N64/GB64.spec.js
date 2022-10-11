import { expect } from 'chai';
import Gb64EmulatorSaveData from '@/save-formats/FlashCarts/N64/GB64Emulator';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/flashcarts/n64/gb64emulator';

const GB64_ZELDA_FILENAME = `${DIR}/Legend of Zelda, The - Link's Awakening (USA, Europe)-everdrive.fla`;
const GB64_TO_RAW_ZELDA_FILENAME = `${DIR}/Legend of Zelda, The - Link's Awakening (USA, Europe)-everdrive-to-raw.sav`;
const GB64_ZELDA_UNCOMPRESSED_DATA_FILENAME = `${DIR}/Legend of Zelda, The - Link's Awakening (USA, Europe)-everdrive-uncompressed-data.sav`;

const RAW_ZELDA_FILENAME = `${DIR}/Legend of Zelda, The - Link's Awakening (USA, Europe)-emulator.sav`;
const RAW_TO_GB64_ZELDA_FILENAME = `${DIR}/Legend of Zelda, The - Link's Awakening (USA, Europe)-emulator-to-everdrive.fla`;

const ZELDA_SRAM_SIZE = 8192;

describe('Flash cart - N64 - GB64 emulator save format', () => {
  it('should convert a GB64 emulator save made with an Everdrive 64 to raw format', async () => {
    const gb64ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GB64_ZELDA_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GB64_TO_RAW_ZELDA_FILENAME);

    const gb64EmulatorSaveData = Gb64EmulatorSaveData.createFromFlashCartDataInternal(gb64ArrayBuffer, ZELDA_SRAM_SIZE);

    expect(ArrayBufferUtil.arrayBuffersEqual(gb64EmulatorSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);

    // ArrayBufferUtil.writeArrayBuffer(GB64_ZELDA_UNCOMPRESSED_DATA_FILENAME, gb64EmulatorSaveData.getUncompressedDataArayBuffer());
  });

  it('should convert a raw save to the GB64 save format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_ZELDA_FILENAME);
    const uncompressedDataArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GB64_ZELDA_UNCOMPRESSED_DATA_FILENAME);
    // const gb64ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_TO_GB64_ZELDA_FILENAME);

    const gb64EmulatorSaveData = Gb64EmulatorSaveData.createFromRawData(rawArrayBuffer, uncompressedDataArrayBuffer);

    // expect(ArrayBufferUtil.arrayBuffersEqual(gb64EmulatorSaveData.getFlashCartArrayBuffer(), gb64ArrayBuffer)).to.equal(true);

    ArrayBufferUtil.writeArrayBuffer(RAW_TO_GB64_ZELDA_FILENAME, gb64EmulatorSaveData.getFlashCartArrayBuffer());
  });
});
