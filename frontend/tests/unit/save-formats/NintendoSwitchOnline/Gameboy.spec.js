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
const GB_UNKNOWN_DATA = null;
const GB_FILE_FORMAT = 'A';

const NSO_GB_GBC_FILENAME = `${DIR}/Links_Awakening_DX.sram`;
const RAW_GB_GBC_FILENAME = `${DIR}/Links_Awakening_DX.sav`;
const GB_GBC_ROM_HASH = Util.bufferToArrayBuffer(textEncoder.encode('1c091225688d966928cc74336dbef2e07d12a47c'));
const GB_GBC_VERSION_NUMBER = Util.bufferToArrayBuffer(textEncoder.encode('178.0'));
const GB_GBC_UNKNOWN_DATA = null;
const GB_GBC_FILE_FORMAT = 'A';

const NSO_GBC_FILENAME = `${DIR}/Wario_Land_3.sram`;
const RAW_GBC_FILENAME = `${DIR}/Wario_Land_3.sav`;
const GBC_ROM_HASH = Util.bufferToArrayBuffer(textEncoder.encode('bb7877309834441fd03adb7fa65738e5d5b2d7ba'));
const GBC_VERSION_NUMBER = Util.bufferToArrayBuffer(textEncoder.encode('178.0'));
const GBC_UNKNOWN_DATA = null;
const GBC_FILE_FORMAT = 'A';

const NSO_GB_NEWER_VERSION_FILENAME = `${DIR}/Kirbys_Dreamland_2.sram`;
const RAW_GB_NEWER_VERSION_FILENAME = `${DIR}/Kirbys_Dreamland_2.sav`;
const GB_NEWER_VERSION_ROM_HASH = Util.bufferToArrayBuffer(textEncoder.encode('8a2898ffa17e25f43793f40c88421d840d372d3c'));
const GB_NEWER_VERSION_NUMBER = Util.bufferToArrayBuffer(textEncoder.encode('184.0'));
const GB_NEWER_VERSION_UNKNOWN_DATA = null;
const GB_NEWER_VERSION_FILE_FORMAT = 'A';

const NSO_GBC_FORMAT_B_FILENAME = `${DIR}/Pokemon Cristal.sram`;
const RAW_GBC_FORMAT_B_FILENAME = `${DIR}/Pokemon Cristal.sav`;
const GBC_FORMAT_B_ROM_HASH = Util.bufferToArrayBuffer(textEncoder.encode('889a06fc0bb863666865aa69def0adf97945ac2a'));
const GBC_FORMAT_B_VERSION_NUMBER = Util.bufferToArrayBuffer(textEncoder.encode('203.0'));
const GBC_FORMAT_B_UNKNOWN_DATA = Util.bufferToArrayBuffer(
  new Uint8Array(
    [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x09, 0x0A, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x09, 0x0A, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00],
  ),
);
const GB_FORMAT_B_FILE_FORMAT = 'B';

const NSO_GBC_FORMAT_C_FILENAME = `${DIR}/Pokemon_TCG.sram`;
const RAW_GBC_FORMAT_C_FILENAME = `${DIR}/Pokemon_TCG.sav`;
const GBC_FORMAT_C_ROM_HASH = Util.bufferToArrayBuffer(textEncoder.encode('0f8670a583255cff3e5b7ca71b5d7454d928fc48'));
const GBC_FORMAT_C_VERSION_NUMBER = Util.bufferToArrayBuffer(textEncoder.encode('196.0'));
const GBC_FORMAT_C_UNKNOWN_DATA = null;
const GB_FORMAT_C_FILE_FORMAT = 'C';

const NSO_GBC_FORMAT_D_FILENAME = `${DIR}/Pokemon_-_Crystal_Version.sram`;
const RAW_GBC_FORMAT_D_FILENAME = `${DIR}/Pokemon_-_Crystal_Version.sav`;
const GBC_FORMAT_D_ROM_HASH = Util.bufferToArrayBuffer(textEncoder.encode('f2f52230b536214ef7c9924f483392993e226cfb'));
const GBC_FORMAT_D_VERSION_NUMBER = Util.bufferToArrayBuffer(textEncoder.encode('199.0'));
const GBC_FORMAT_D_UNKNOWN_DATA = Util.bufferToArrayBuffer(
  new Uint8Array(
    [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x09, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x09, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
  ),
);
const GB_FORMAT_D_FILE_FORMAT = 'D';

describe('Nintendo Switch Online - Gameboy', () => {
  it('should convert a raw GB save to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GB_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromRawData(rawArrayBuffer, GB_ROM_HASH, GB_VERSION_NUMBER, GB_UNKNOWN_DATA, GB_FILE_FORMAT);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO GB save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GB_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedRomHash(), GB_ROM_HASH)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedVersion(), GB_VERSION_NUMBER)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getFileFormat(), GB_FILE_FORMAT)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw newer version GB save to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GB_NEWER_VERSION_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_NEWER_VERSION_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromRawData(rawArrayBuffer, GB_NEWER_VERSION_ROM_HASH, GB_NEWER_VERSION_NUMBER, GB_NEWER_VERSION_UNKNOWN_DATA, GB_NEWER_VERSION_FILE_FORMAT);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO newer version GB save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GB_NEWER_VERSION_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_NEWER_VERSION_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedRomHash(), GB_NEWER_VERSION_ROM_HASH)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedVersion(), GB_NEWER_VERSION_NUMBER)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getFileFormat(), GB_NEWER_VERSION_FILE_FORMAT)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw format B GBC save to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_FORMAT_B_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_FORMAT_B_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromRawData(rawArrayBuffer, GBC_FORMAT_B_ROM_HASH, GBC_FORMAT_B_VERSION_NUMBER, GBC_FORMAT_B_UNKNOWN_DATA, GB_FORMAT_B_FILE_FORMAT);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO format B GBC save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_FORMAT_B_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_FORMAT_B_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedRomHash(), GBC_FORMAT_B_ROM_HASH)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedVersion(), GBC_FORMAT_B_VERSION_NUMBER)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getUnknownData(), GBC_FORMAT_B_UNKNOWN_DATA)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getFileFormat(), GB_FORMAT_B_FILE_FORMAT)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw format C GBC save to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_FORMAT_C_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_FORMAT_C_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromRawData(rawArrayBuffer, GBC_FORMAT_C_ROM_HASH, GBC_FORMAT_C_VERSION_NUMBER, GBC_FORMAT_C_UNKNOWN_DATA, GB_FORMAT_C_FILE_FORMAT);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO format C GBC save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_FORMAT_C_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_FORMAT_C_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedRomHash(), GBC_FORMAT_C_ROM_HASH)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedVersion(), GBC_FORMAT_C_VERSION_NUMBER)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getFileFormat(), GB_FORMAT_C_FILE_FORMAT)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw format D GBC save to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_FORMAT_D_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_FORMAT_D_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromRawData(rawArrayBuffer, GBC_FORMAT_D_ROM_HASH, GBC_FORMAT_D_VERSION_NUMBER, GBC_FORMAT_D_UNKNOWN_DATA, GB_FORMAT_D_FILE_FORMAT);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO format D GBC save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_FORMAT_D_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_FORMAT_D_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedRomHash(), GBC_FORMAT_D_ROM_HASH)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedVersion(), GBC_FORMAT_D_VERSION_NUMBER)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getUnknownData(), GBC_FORMAT_D_UNKNOWN_DATA)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getFileFormat(), GB_FORMAT_D_FILE_FORMAT)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw dual compatibility GB/GBC save to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GB_GBC_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_GBC_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromRawData(rawArrayBuffer, GB_GBC_ROM_HASH, GB_GBC_VERSION_NUMBER, GB_GBC_UNKNOWN_DATA, GB_GBC_FILE_FORMAT);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO dual compatibility GB/GBC save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GB_GBC_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_GBC_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedRomHash(), GB_GBC_ROM_HASH)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedVersion(), GB_GBC_VERSION_NUMBER)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getFileFormat(), GB_GBC_FILE_FORMAT)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw GBC save to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromRawData(rawArrayBuffer, GBC_ROM_HASH, GBC_VERSION_NUMBER, GBC_UNKNOWN_DATA, GBC_FILE_FORMAT);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO GBC save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedRomHash(), GBC_ROM_HASH)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getEncodedVersion(), GBC_VERSION_NUMBER)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getFileFormat(), GBC_FILE_FORMAT)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });
});
