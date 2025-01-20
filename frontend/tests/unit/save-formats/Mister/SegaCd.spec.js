import { expect } from 'chai';
import MisterSegaCdSaveData from '@/save-formats/Mister/SegaCd';
import SegaCdUtil from '@/util/SegaCd';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/data/save-formats/mister/segacd';

const MISTER_INTERNAL_ONLY_FILENAME = `${DIR}/Popful Mail (USA) (RE)-mister-internal-only.sav`;

const RAW_INTERNAL_FILENAME = `${DIR}/Popful Mail (USA) (RE)-raw-internal.brm`;
const RAW_RAM_CART_FILENAME = `${DIR}/Popful Mail (USA) (RE)-ram-cart-only.brm`;

const MISTER_INTERNAL_ONLY_PADDED_FILENAME = `${DIR}/Shining Force CD (USA) (3R)-mister-internal-only-padded.sav`;
const RAW_INTERNAL_ONLY_PADDED_FILENAME = `${DIR}/Shining Force CD (USA) (3R)-to-emulator-internal.brm`;

const COMBINED_MISTER_INTERNAL_AND_RAM_CART_FILENAME = `${DIR}/Popful Mail (USA) Internal plus Cart-mister.sav`;
const COMBINED_INTERNAL_OUTPUT_FILENAME = `${DIR}/Popful Mail (USA) Internal plus Cart to-emulator-internal.brm`;
const COMBINED_RAM_CART_OUTPUT_FILENAME = `${DIR}/Popful Mail (USA) Internal plus Cart to-emulator-ram-cart.brm`;

const MISTER_COMBINED_RAM_CART_PLUS_EMPTY_INTERNAL_FILENAME = `${DIR}/Popful Mail (USA) (RE)-raw-cart-only-to-mister.sav`;
const MISTER_COMBINED_INTERNAL_PLUS_RAM_CART_FILENAME = `${DIR}/Popful Mail (USA) (RE)-internal-plus-raw-cart-to-mister.sav`;

const MISTER_EMPTY_FILENAME = `${DIR}/Empty-mister-save.sav`;

const EMULATOR_RAM_CART_SIZE = 524288; // Genesis Plus uses this size for its virtual RAM cart

const EMPTY_MISTER_RAM_CART_SAVE = SegaCdUtil.makeEmptySave(MisterSegaCdSaveData.RAM_CART_SIZE);

describe('MiSTer - Sega CD save format', () => {
  it('should create an empty MiSTer file when given no raw files', async () => {
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_EMPTY_FILENAME);

    const misterSegaCdSaveData = MisterSegaCdSaveData.createFromRawData({ });

    expect(ArrayBufferUtil.arrayBuffersEqual(misterSegaCdSaveData.getMisterArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });

  it('should convert a raw internal Sega CD save to the short MiSTer format', async () => {
    const rawInternalSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_INTERNAL_FILENAME);

    const misterSegaCdSaveData = MisterSegaCdSaveData.createFromRawData({ rawInternalSaveArrayBuffer });

    expect(ArrayBufferUtil.arrayBuffersEqual(misterSegaCdSaveData.getMisterArrayBuffer(), rawInternalSaveArrayBuffer)).to.equal(true);
  });

  it('should convert a raw RAM cart Sega CD save to the long MiSTer format', async () => {
    const rawCartSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_RAM_CART_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_COMBINED_RAM_CART_PLUS_EMPTY_INTERNAL_FILENAME);

    const misterSegaCdSaveData = MisterSegaCdSaveData.createFromRawData({ rawCartSaveArrayBuffer });

    expect(ArrayBufferUtil.arrayBuffersEqual(misterSegaCdSaveData.getMisterArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });

  it('should convert a raw internal save + raw RAM cart Sega CD save to the long MiSTer format', async () => {
    const rawInternalSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_INTERNAL_FILENAME);
    const rawCartSaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_RAM_CART_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_COMBINED_INTERNAL_PLUS_RAM_CART_FILENAME);

    const misterSegaCdSaveData = MisterSegaCdSaveData.createFromRawData({ rawInternalSaveArrayBuffer, rawCartSaveArrayBuffer });

    expect(ArrayBufferUtil.arrayBuffersEqual(misterSegaCdSaveData.getMisterArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });

  it('should convert a MiSTer internal RAM save to raw format', async () => {
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_INTERNAL_ONLY_FILENAME);

    const misterSegaCdSaveData = MisterSegaCdSaveData.createFromMisterData(misterArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterSegaCdSaveData.getRawArrayBuffer(MisterSegaCdSaveData.INTERNAL_MEMORY), misterArrayBuffer)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(misterSegaCdSaveData.getRawArrayBuffer(MisterSegaCdSaveData.RAM_CART), EMPTY_MISTER_RAM_CART_SAVE)).to.equal(true);
  });

  it('should convert a MiSTer internal RAM save which has been padded out to raw format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_INTERNAL_ONLY_PADDED_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_INTERNAL_ONLY_PADDED_FILENAME);

    const misterSegaCdSaveData = MisterSegaCdSaveData.createFromMisterData(misterArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterSegaCdSaveData.getRawArrayBuffer(MisterSegaCdSaveData.INTERNAL_MEMORY), rawArrayBuffer)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(misterSegaCdSaveData.getRawArrayBuffer(MisterSegaCdSaveData.RAM_CART), EMPTY_MISTER_RAM_CART_SAVE)).to.equal(true);
  });

  it('should parse a MiSTer combined save and convert to emulator files', async () => {
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(COMBINED_MISTER_INTERNAL_AND_RAM_CART_FILENAME);
    const emulatorInternalArrayBuffer = await ArrayBufferUtil.readArrayBuffer(COMBINED_INTERNAL_OUTPUT_FILENAME);
    const emulatorRamCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(COMBINED_RAM_CART_OUTPUT_FILENAME);

    const misterSegaCdSaveData = MisterSegaCdSaveData.createFromMisterData(misterArrayBuffer);

    const resizedMisterSegaCdSaveData = MisterSegaCdSaveData.createWithNewSize(misterSegaCdSaveData, EMULATOR_RAM_CART_SIZE);

    expect(ArrayBufferUtil.arrayBuffersEqual(resizedMisterSegaCdSaveData.getRawArrayBuffer(MisterSegaCdSaveData.INTERNAL_MEMORY), emulatorInternalArrayBuffer)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(resizedMisterSegaCdSaveData.getRawArrayBuffer(MisterSegaCdSaveData.RAM_CART), emulatorRamCartArrayBuffer)).to.equal(true);
  });
});
