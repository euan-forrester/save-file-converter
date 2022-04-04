// import { expect } from 'chai';
import GoombaEmulatorSaveData from '@/save-formats/FlashCart/GoombaEmulator';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/flashcart/goombaemulator';

const RAW_ZELDA_FILENAME = `${DIR}/Legend of Zelda, The - Link's Awakening (USA, Europe).sav`;
const GOOMBA_ZELDA_FILENAME = `${DIR}/Legend of Zelda, The - Link's Awakening (USA, Europe).esv`;

describe('Flash cart - Goomba emulator save format', () => {
  it('should convert a Goomba emulator save to raw format', async () => {
    // const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_ZELDA_FILENAME);
    const goombaArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GOOMBA_ZELDA_FILENAME);

    const goombaEmulatorSaveData = GoombaEmulatorSaveData.createFromGoombaData(goombaArrayBuffer);

    ArrayBufferUtil.writeArrayBuffer(RAW_ZELDA_FILENAME, goombaEmulatorSaveData.getRawArrayBuffer());

    // expect(ArrayBufferUtil.arrayBuffersEqual(goombaEmulatorSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });
});
