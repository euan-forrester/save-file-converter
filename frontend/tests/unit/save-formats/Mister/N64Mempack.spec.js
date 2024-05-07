import { expect } from 'chai';
import MisterN64MempackSaveData from '@/save-formats/Mister/N64Mempack';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/data/save-formats/mister/n64';

const MISTER_MEMPACK_FILENAME = `${DIR}/007 - The World Is Not Enough (USA)_1.cpk`;

describe('MiSTer - N64 mempack save format', () => {
  it('should convert a raw mempack save to the MiSTer format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_MEMPACK_FILENAME);

    const misterGameboyAdvanceSaveData = MisterN64MempackSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterGameboyAdvanceSaveData.getMisterArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a MiSTer mempack save to raw format', async () => {
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_MEMPACK_FILENAME);

    const misterGameboyAdvanceSaveData = MisterN64MempackSaveData.createFromMisterData(misterArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterGameboyAdvanceSaveData.getRawArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });
});
