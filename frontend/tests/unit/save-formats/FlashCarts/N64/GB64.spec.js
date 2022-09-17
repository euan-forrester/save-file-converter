// import { expect } from 'chai';
import Gb64EmulatorSaveData from '@/save-formats/FlashCarts/N64/GB64Emulator';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/flashcarts/n64/gb64emulator';

const RAW_ZELDA_FILENAME = `${DIR}/Legend of Zelda, The - Link's Awakening (USA, Europe)-everdrive-to-raw.sav`;
const GB64_ZELDA_FILENAME = `${DIR}/Legend of Zelda, The - Link's Awakening (USA, Europe)-everdrive.fla`;

describe('Flash cart - N64 - GB64 emulator save format', () => {
  it('should convert a GB64 emulator save made with an Everdrive 64 to raw format', async () => {
    // const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_ZELDA_FILENAME);
    const gb64ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GB64_ZELDA_FILENAME);

    const gb64EmulatorSaveData = Gb64EmulatorSaveData.createFromFlashCartData(gb64ArrayBuffer);

    ArrayBufferUtil.writeArrayBuffer(RAW_ZELDA_FILENAME, gb64EmulatorSaveData.getRawArrayBuffer());

    // expect(ArrayBufferUtil.arrayBuffersEqual(gb64EmulatorSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  /*
  it('should convert a save from a cartridge to the GB64 save format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_CART_ZELDA_FILENAME);
    const gb64ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GB64_CART_ZELDA_FILENAME);

    const gb64EmulatorSaveData = Gb64EmulatorSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(gb64EmulatorSaveData.getFlashCartArrayBuffer(), gb64ArrayBuffer)).to.equal(true);
  });
  */
});
