import { expect } from 'chai';
import MisterGenesisSaveData from '@/save-formats/Mister/Genesis';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/mister/genesis';

const RAW_PHANTASY_STAR_2_FILENAME = `${DIR}/phantasy-star-ii.18168-raw.srm`;
const MISTER_PHANTASY_STAR_2_FILENAME = `${DIR}/phantasy-star-ii.18168-mister.sav`;

describe('MiSTer - Genesis save format', () => {
  it('should convert a raw Genesis save to the MiSTer format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_PHANTASY_STAR_2_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_PHANTASY_STAR_2_FILENAME);

    const misterGenesisSaveData = MisterGenesisSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterGenesisSaveData.getMisterArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });

  it('should convert a MiSTer Genesis save to raw format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_PHANTASY_STAR_2_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_PHANTASY_STAR_2_FILENAME);

    const misterGenesisSaveData = MisterGenesisSaveData.createFromMisterData(misterArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterGenesisSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });
});
