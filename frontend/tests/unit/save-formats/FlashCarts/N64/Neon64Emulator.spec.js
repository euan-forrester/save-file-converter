import { expect } from 'chai';
import Neon64EmulatorSaveData from '@/save-formats/FlashCarts/N64/Neon64Emulator';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/flashcarts/n64/neon64emulator';

const RAW_ZELDA_FILENAME = `${DIR}/Zelda II - The Adventure of Link (USA)-to-raw.sav`;
const NEON64_ZELDA_FILENAME = `${DIR}/Zelda II - The Adventure of Link (USA)-neon.srm`;

// const RAW_CART_ZELDA_FILENAME = `${DIR}/Legend of Zelda, The - Link's Awakening (USA, Europe)-from-cart.sav`;
// const GOOMBA_CART_ZELDA_FILENAME = `${DIR}/Legend of Zelda, The - Link's Awakening (USA, Europe)-from-cart.esv`;

describe('Flash cart - N64 - Neon64 emulator save format', () => {
  it('should convert a Neon64 emulator save made with an Everdrive 64 to raw format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_ZELDA_FILENAME);
    const neon64ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NEON64_ZELDA_FILENAME);

    const neon64EmulatorSaveData = Neon64EmulatorSaveData.createFromFlashCartData(neon64ArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(neon64EmulatorSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  /*
  it('should convert a save from a cartridge to the Neon64 save format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_CART_ZELDA_FILENAME);
    const goombaArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GOOMBA_CART_ZELDA_FILENAME);

    const goombaEmulatorSaveData = GoombaEmulatorSaveData.createFromRawDataInternal(rawArrayBuffer, ZELDA_INTERNAL_NAME, ZELDA_ROM_CHECKSUM); // Use the 'internal' function for tests so that we can run the test without the retail ROM

    expect(ArrayBufferUtil.arrayBuffersEqual(goombaEmulatorSaveData.getFlashCartArrayBuffer(), goombaArrayBuffer)).to.equal(true);
  });
  */
});
