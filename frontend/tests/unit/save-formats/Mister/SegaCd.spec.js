import { expect } from 'chai';
import MisterSegaCdSaveData from '@/save-formats/Mister/SegaCd';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/mister/segacd';

const MISTER_INTERNAL_FILENAME = `${DIR}/Popful Mail (USA) (RE).sav`;

const MISTER_INTERNAL_PADDED_FILENAME = `${DIR}/Shining Force CD (USA) (3R)-mister.sav`;
const RAW_INTERNAL_PADDED_FILENAME = `${DIR}/Shining Force CD (USA) (3R)-raw.srm`;

const RESIZED_RAW_RAM_CART_FILENAME = `${DIR}/Popful Mail (USA) (RE)-ram-cart.srm`;

describe('MiSTer - Sega CD save format', () => {
  /*
  it('should convert a raw Genesis save to the MiSTer format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_PHANTASY_STAR_2_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_PHANTASY_STAR_2_FILENAME);

    const misterGenesisSaveData = MisterGenesisSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterGenesisSaveData.getMisterArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });
  */

  it('should convert a MiSTer internal RAM save to raw format', async () => {
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_INTERNAL_FILENAME);

    const misterSegaCdSaveData = MisterSegaCdSaveData.createFromMisterData(misterArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterSegaCdSaveData.getRawArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });

  it('should convert a MiSTer internal RAM save which has been padded out to raw format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_INTERNAL_PADDED_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_INTERNAL_PADDED_FILENAME);

    const misterSegaCdSaveData = MisterSegaCdSaveData.createFromMisterData(misterArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterSegaCdSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should resize a MiSTer internal RAM save to emulator RAM cart size', async () => {
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_INTERNAL_FILENAME);
    const resizedRawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RESIZED_RAW_RAM_CART_FILENAME);

    const misterSegaCdSaveData = MisterSegaCdSaveData.createFromMisterData(misterArrayBuffer);

    const largerMisterSegaCdSaveData = MisterSegaCdSaveData.createWithNewSize(misterSegaCdSaveData, 524288);

    expect(ArrayBufferUtil.arrayBuffersEqual(largerMisterSegaCdSaveData.getRawArrayBuffer(), resizedRawArrayBuffer)).to.equal(true);
  });
});
