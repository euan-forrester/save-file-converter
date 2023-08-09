import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';
import Util from '@/util/util';

import NsoGameboySaveData from '@/save-formats/NintendoSwitchOnline/Gameboy';

const textEncoder = new TextEncoder();

const DIR = './tests/data/save-formats/nintendoswitchonline/gb';

const NSO_GB_FILENAME = `${DIR}/Metroid_II_Return_of_Samus.sram`;
const RAW_GB_FILENAME = `${DIR}/Metroid_II_Return_of_Samus.sav`;
const GB_ROM_HASH = Util.bufferToArrayBuffer(textEncoder.encode('74a2fad86b9a4c013149b1e214bc4600efb1066d'));
const GB_VERSION_NUMBER = Util.bufferToArrayBuffer(textEncoder.encode('178.0'));

const NSO_GB_GBC_FILENAME = `${DIR}/Links_Awakening_DX.sram`;
const RAW_GB_GBC_FILENAME = `${DIR}/Links_Awakening_DX.sav`;
const GB_GBC_ROM_HASH = Util.bufferToArrayBuffer(textEncoder.encode('1c091225688d966928cc74336dbef2e07d12a47c'));
const GB_GBC_VERSION_NUMBER = Util.bufferToArrayBuffer(textEncoder.encode('178.0'));

const NSO_GBC_FILENAME = `${DIR}/Wario_Land_3.sram`;
const RAW_GBC_FILENAME = `${DIR}/Wario_Land_3.sav`;
const GBC_ROM_HASH = Util.bufferToArrayBuffer(textEncoder.encode('bb7877309834441fd03adb7fa65738e5d5b2d7ba'));
const GBC_VERSION_NUMBER = Util.bufferToArrayBuffer(textEncoder.encode('178.0'));

const NSO_GB_NEWER_VERSION_FILENAME = `${DIR}/Kirbys_Dreamland_2.sram`;
const RAW_GB_NEWER_VERSION_FILENAME = `${DIR}/Kirbys_Dreamland_2.sav`;
const GB_NEWER_VERSION_ROM_HASH = Util.bufferToArrayBuffer(textEncoder.encode('8a2898ffa17e25f43793f40c88421d840d372d3c'));
const GB_NEWER_VERSION_NUMBER = Util.bufferToArrayBuffer(textEncoder.encode('184.0'));

const NSO_GBC_MASTER_VERSION_FILENAME = `${DIR}/Pokemon_TCG.sram`;
const RAW_GBC_MASTER_VERSION_FILENAME = `${DIR}/Pokemon_TCG.sav`;
const GBC_MASTER_VERSION_ROM_HASH = Util.bufferToArrayBuffer(textEncoder.encode('0f8670a583255cff3e5b7ca71b5d7454d928fc48'));
const GBC_MASTER_VERSION_NUMBER = Util.bufferToArrayBuffer(textEncoder.encode('196.0'));

describe('Nintendo Switch Online - Gameboy', () => {
  it('should convert a raw GB save to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GB_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromRawData(rawArrayBuffer, GB_ROM_HASH, GB_VERSION_NUMBER);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO GB save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GB_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedRomHash(), GB_ROM_HASH)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedVersion(), GB_VERSION_NUMBER)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw newer version GB save to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GB_NEWER_VERSION_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_NEWER_VERSION_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromRawData(rawArrayBuffer, GB_NEWER_VERSION_ROM_HASH, GB_NEWER_VERSION_NUMBER);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO newer version GB save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GB_NEWER_VERSION_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_NEWER_VERSION_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedRomHash(), GB_NEWER_VERSION_ROM_HASH)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedVersion(), GB_NEWER_VERSION_NUMBER)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  /*
  it('should convert a raw master version GBC save to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_MASTER_VERSION_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_MASTER_VERSION_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromRawData(rawArrayBuffer, GBC_MASTER_VERSION_ROM_HASH, GBC_MASTER_VERSION_NUMBER);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });
  */

  it('should convert a NSO master version GBC save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_MASTER_VERSION_FILENAME);
    // const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_MASTER_VERSION_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedRomHash(), GBC_MASTER_VERSION_ROM_HASH)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedVersion(), GBC_MASTER_VERSION_NUMBER)).to.equal(true);
    // expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);

    ArrayBufferUtil.writeArrayBuffer(RAW_GBC_MASTER_VERSION_FILENAME, nsoSaveData.getRawArrayBuffer());
  });

  it('should convert a raw dual compatibility GB/GBC save to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GB_GBC_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_GBC_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromRawData(rawArrayBuffer, GB_GBC_ROM_HASH, GB_GBC_VERSION_NUMBER);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO dual compatibility GB/GBC save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GB_GBC_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_GBC_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedRomHash(), GB_GBC_ROM_HASH)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedVersion(), GB_GBC_VERSION_NUMBER)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw GBC save to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromRawData(rawArrayBuffer, GBC_ROM_HASH, GBC_VERSION_NUMBER);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO GBC save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedRomHash(), GBC_ROM_HASH)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedVersion(), GBC_VERSION_NUMBER)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });
});
