import { expect } from 'chai';
import MisterSegaSaturnSaveData from '@/save-formats/Mister/SegaSaturn';
import SegaSaturnSaveData from '@/save-formats/SegaSaturn/SegaSaturn';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/data/save-formats/mister/segasaturn';

const MISTER_INTERNAL_ONLY_FILENAME = `${DIR}/Daytona USA - Championship Circuit Edition (USA).sav`;
const MISTER_INTERNAL_ONLY_RECREATED_FILENAME = `${DIR}/Daytona USA - Championship Circuit Edition (USA)-recreated.sav`; // Some files we were given from the mister are byte expanded out with 0x00 and some are with 0xFF. This one was done with 0x00, but when we recreate it we use 0xFF
const RAW_INTERNAL_ONLY_FILENAME = `${DIR}/Daytona USA - Championship Circuit Edition (USA).bkr`;

const MISTER_INTERNAL_ONLY_WITH_GARBAGE_FILENAME = `${DIR}/Sega Rally Championship Plus (Japan).sav`;
const RAW_INTERNAL_ONLY_WITH_GARBAGE_FILENAME = `${DIR}/Sega Rally Championship Plus (Japan).bkr`;

const COMBINED_MISTER_INTERNAL_AND_RAM_CART_FILENAME = `${DIR}/Rayman (USA) (R2).sav`;
const COMBINED_INTERNAL_FILENAME = `${DIR}/Rayman (USA) (R2)-internal.bkr`;
const COMBINED_CART_FILENAME = `${DIR}/Rayman (USA) (R2)-cart-uncompressed.bcr`;

const COMBINED_CART_COMPRESSED_FILENAME = `${DIR}/Rayman (USA) (R2)-cart.bcr`; // The user will probably provide an emulator file that's compressed, because that's how mednafen outputs it

const MISTER_COMBINED_CART_PLUS_EMPTY_INTERNAL_FILENAME = `${DIR}/Pretend-mister-save-only-cart.sav`;

const MISTER_EMPTY_FILENAME = `${DIR}/Empty-mister-save.sav`;

const EMPTY_CART_SAVE = SegaSaturnSaveData.createEmptySave(SegaSaturnSaveData.CARTRIDGE_BLOCK_SIZE);

describe('MiSTer - Sega Saturn save format', () => {
  it('should create an empty MiSTer file when given no raw files', async () => {
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_EMPTY_FILENAME);

    const misterSegaSaturnSaveData = MisterSegaSaturnSaveData.createFromRawData({ });

    expect(ArrayBufferUtil.arrayBuffersEqual(misterSegaSaturnSaveData.getMisterArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });

  it('should convert a raw internal Sega Saturn save to the short MiSTer format', async () => {
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_INTERNAL_ONLY_RECREATED_FILENAME);
    const rawInternalSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_INTERNAL_ONLY_FILENAME);

    const misterSegaSaturnSaveData = MisterSegaSaturnSaveData.createFromRawData({ rawInternalSaveArrayBuffer });

    expect(ArrayBufferUtil.arrayBuffersEqual(misterSegaSaturnSaveData.getMisterArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });

  it('should convert a raw cart Sega Saturn save to the long MiSTer format', async () => {
    const rawCartSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(COMBINED_CART_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_COMBINED_CART_PLUS_EMPTY_INTERNAL_FILENAME);

    const misterSegaSaturnSaveData = MisterSegaSaturnSaveData.createFromRawData({ rawCartSaveArrayBuffer });

    expect(ArrayBufferUtil.arrayBuffersEqual(misterSegaSaturnSaveData.getMisterArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });

  it('should convert a compressed raw cart Sega Saturn save to the long MiSTer format', async () => {
    const rawCartSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(COMBINED_CART_COMPRESSED_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_COMBINED_CART_PLUS_EMPTY_INTERNAL_FILENAME);

    const misterSegaSaturnSaveData = MisterSegaSaturnSaveData.createFromRawData({ rawCartSaveArrayBuffer });

    expect(ArrayBufferUtil.arrayBuffersEqual(misterSegaSaturnSaveData.getMisterArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });

  it('should convert a raw internal save + raw cart Sega Saturn save to the long MiSTer format', async () => {
    const rawInternalSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(COMBINED_INTERNAL_FILENAME);
    const rawCartSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(COMBINED_CART_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(COMBINED_MISTER_INTERNAL_AND_RAM_CART_FILENAME);

    const misterSegaSaturnSaveData = MisterSegaSaturnSaveData.createFromRawData({ rawInternalSaveArrayBuffer, rawCartSaveArrayBuffer });

    expect(ArrayBufferUtil.arrayBuffersEqual(misterSegaSaturnSaveData.getMisterArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });

  it('should convert a raw internal save + raw compressed cart Sega Saturn save to the long MiSTer format', async () => {
    const rawInternalSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(COMBINED_INTERNAL_FILENAME);
    const rawCartSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(COMBINED_CART_COMPRESSED_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(COMBINED_MISTER_INTERNAL_AND_RAM_CART_FILENAME);

    const misterSegaSaturnSaveData = MisterSegaSaturnSaveData.createFromRawData({ rawInternalSaveArrayBuffer, rawCartSaveArrayBuffer });

    expect(ArrayBufferUtil.arrayBuffersEqual(misterSegaSaturnSaveData.getMisterArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });

  it('should convert a MiSTer internal RAM save to raw format', async () => {
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_INTERNAL_ONLY_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_INTERNAL_ONLY_FILENAME);

    const misterSegaSaturnSaveData = MisterSegaSaturnSaveData.createFromMisterData(misterArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterSegaSaturnSaveData.getRawArrayBuffer(MisterSegaSaturnSaveData.INTERNAL_MEMORY), rawArrayBuffer)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(misterSegaSaturnSaveData.getRawArrayBuffer(MisterSegaSaturnSaveData.RAM_CART), EMPTY_CART_SAVE)).to.equal(true);
  });

  it('should convert a MiSTer internal RAM save containing garbage at the beginning to raw format', async () => {
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_INTERNAL_ONLY_WITH_GARBAGE_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_INTERNAL_ONLY_WITH_GARBAGE_FILENAME);

    const misterSegaSaturnSaveData = MisterSegaSaturnSaveData.createFromMisterData(misterArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterSegaSaturnSaveData.getRawArrayBuffer(MisterSegaSaturnSaveData.INTERNAL_MEMORY), rawArrayBuffer)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(misterSegaSaturnSaveData.getRawArrayBuffer(MisterSegaSaturnSaveData.RAM_CART), EMPTY_CART_SAVE)).to.equal(true);
  });

  it('should parse a MiSTer combined save and convert to emulator files', async () => {
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(COMBINED_MISTER_INTERNAL_AND_RAM_CART_FILENAME);
    const rawInternalArrayBuffer = await ArrayBufferUtil.readArrayBuffer(COMBINED_INTERNAL_FILENAME);
    const rawCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(COMBINED_CART_FILENAME);

    const misterSegaSaturnSaveData = MisterSegaSaturnSaveData.createFromMisterData(misterArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterSegaSaturnSaveData.getRawArrayBuffer(MisterSegaSaturnSaveData.INTERNAL_MEMORY), rawInternalArrayBuffer)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(misterSegaSaturnSaveData.getRawArrayBuffer(MisterSegaSaturnSaveData.RAM_CART), rawCartArrayBuffer)).to.equal(true);
  });
});
