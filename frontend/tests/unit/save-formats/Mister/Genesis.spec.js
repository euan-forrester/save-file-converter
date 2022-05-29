import { expect } from 'chai';
import MisterGenesisSaveData from '@/save-formats/Mister/Genesis';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/mister/genesis';

const RAW_PHANTASY_STAR_2_FILENAME = `${DIR}/phantasy-star-ii.18168-raw.srm`;
const MISTER_PHANTASY_STAR_2_FILENAME = `${DIR}/phantasy-star-ii.18168-mister.sav`;

const RAW_RETRODE_FILENAME = `${DIR}/Phantasy_Star_IV_USA-from-retrode.srm`;
const MISTER_RETRODE_FILENAME = `${DIR}/Phantasy_Star_IV_USA-from-retrode-to-mister.sav`;

const RAW_ZERO_PADDED_FILENAME = `${DIR}/Phantasy_Star_IV_USA-from-mister-zero-padded-to-raw.srm`;
const MISTER_ZERO_PADDED_FILENAME = `${DIR}/Phantasy_Star_IV_USA-from-mister-zero-padded.sav`;

const RAW_EEPROM_FILENAME = `${DIR}/Wonder Boy in Monster World raw.srm`;
const MISTER_EEPROM_FILENAME = `${DIR}/Wonder Boy in Monster World mister.sav`;

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

  it('should convert a raw Genesis save from a Retrode to the MiSTer format', async () => {
    // The Retrode byte expands by copying every byte rather than inserting a 0x00 byte

    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_RETRODE_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_RETRODE_FILENAME);

    const misterGenesisSaveData = MisterGenesisSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterGenesisSaveData.getMisterArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });

  it('should convert a MiSTer Genesis padded with zeros save to raw format', async () => {
    // Although the MiSTer is "supposed" to always output 0xFF-padded files, it can also output
    // a 0x00-padded file (if it was given one in the first place?)

    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_ZERO_PADDED_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_ZERO_PADDED_FILENAME);

    const misterGenesisSaveData = MisterGenesisSaveData.createFromMisterData(misterArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterGenesisSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw EEPROM Genesis save to the MiSTer format', async () => {
    // The EEPROM saves are not byte expanded

    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_EEPROM_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_EEPROM_FILENAME);

    const misterGenesisSaveData = MisterGenesisSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterGenesisSaveData.getMisterArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });

  it('should convert a mister EEPROM Genesis save back to raw without byte expanding', async () => {
    // The EEPROM saves are not byte expanded

    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_EEPROM_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_EEPROM_FILENAME);

    const misterGenesisSaveData = MisterGenesisSaveData.createFromMisterData(misterArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterGenesisSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });
});
