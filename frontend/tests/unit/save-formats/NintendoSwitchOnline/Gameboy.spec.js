import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';
import Util from '@/util/util';

import NsoGameboySaveData from '@/save-formats/NintendoSwitchOnline/Gameboy';

const textEncoder = new TextEncoder();

const DIR = './tests/data/save-formats/nintendoswitchonline/gb';

const NSO_GB_FILENAME = `${DIR}/Metroid_II_Return_of_Samus.sram`;
const RAW_GB_FILENAME = `${DIR}/Metroid_II_Return_of_Samus.sav`;
const GB_ROM_HASH = Util.bufferToArrayBuffer(textEncoder.encode('74a2fad86b9a4c013149b1e214bc4600efb1066d'));

const NSO_GB_GBC_FILENAME = `${DIR}/Links_Awakening_DX.sram`;
const RAW_GB_GBC_FILENAME = `${DIR}/Links_Awakening_DX.sav`;
const GB_GBC_ROM_HASH = Util.bufferToArrayBuffer(textEncoder.encode('1c091225688d966928cc74336dbef2e07d12a47c'));

const NSO_GBC_FILENAME = `${DIR}/Wario_Land_3.sram`;
const RAW_GBC_FILENAME = `${DIR}/Wario_Land_3.sav`;
const GBC_ROM_HASH = Util.bufferToArrayBuffer(textEncoder.encode('bb7877309834441fd03adb7fa65738e5d5b2d7ba'));

describe('Nintendo Switch Online - Gameboy', () => {
  it('should convert a raw GB save to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GB_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromRawData(rawArrayBuffer, GB_ROM_HASH);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO GB save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GB_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedRomHash(), GB_ROM_HASH)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw dual compatibility GB/GBC save to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GB_GBC_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_GBC_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromRawData(rawArrayBuffer, GB_GBC_ROM_HASH);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO dual compatibility GB/GBC save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GB_GBC_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_GBC_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedRomHash(), GB_GBC_ROM_HASH)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw GBC save to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromRawData(rawArrayBuffer, GBC_ROM_HASH);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO GBC save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedRomHash(), GBC_ROM_HASH)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });
});
