import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';
import Util from '@/util/util';

import NsoGameboySaveData from '@/save-formats/NintendoSwitchOnline/Gameboy';

const textEncoder = new TextEncoder();

const DIR = './tests/data/save-formats/nintendoswitchonline/gb';

const NSO_GB_FILENAME = `${DIR}/Metroid_II_Return_of_Samus.sram`;
const RAW_GB_FILENAME = `${DIR}/Metroid_II_Return_of_Samus.sav`;
const GB_ROM_HASH = Util.bufferToArrayBuffer(textEncoder.encode('74a2fad86b9a4c013149b1e214bc4600efb1066d'));
const GB_GIT_REVISION_NUMBER = Util.bufferToArrayBuffer(textEncoder.encode('HEAD-v178.0'));
const GB_RTC_DATA = null;

const NSO_GB_NEWER_VERSION_FILENAME = `${DIR}/Kirbys_Dreamland_2.sram`;
const RAW_GB_NEWER_VERSION_FILENAME = `${DIR}/Kirbys_Dreamland_2.sav`;
const GB_NEWER_VERSION_ROM_HASH = Util.bufferToArrayBuffer(textEncoder.encode('8a2898ffa17e25f43793f40c88421d840d372d3c'));
const GB_NEWER_VERSION_GIT_REVISION_NUMBER = Util.bufferToArrayBuffer(textEncoder.encode('HEAD-v184.0'));
const GB_NEWER_VERSION_RTC_DATA = null;

const NSO_GBC_WITH_RTC_DATA_FILENAME = `${DIR}/Pokemon Cristal.sram`;
const RAW_GBC_WITH_RTC_DATA_FILENAME = `${DIR}/Pokemon Cristal.sav`;
const GBC_WITH_RTC_DATA_ROM_HASH = Util.bufferToArrayBuffer(textEncoder.encode('889a06fc0bb863666865aa69def0adf97945ac2a'));
const GBC_WITH_RTC_DATA_GIT_REVISION_NUMBER = Util.bufferToArrayBuffer(textEncoder.encode('HEAD-v203.0'));
const GBC_WITH_RTC_DATA_RTC_DATA = Util.bufferToArrayBuffer(
  new Uint8Array(
    [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x09, 0x0A, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x09, 0x0A, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00],
  ),
);

const NSO_GBC_WITH_MASTER_GIT_REVISION_FILENAME = `${DIR}/Pokemon_TCG.sram`;
const RAW_GBC_WITH_MASTER_GIT_REVISION_FILENAME = `${DIR}/Pokemon_TCG.sav`;
const GBC_WITH_MASTER_GIT_REVISION_ROM_HASH = Util.bufferToArrayBuffer(textEncoder.encode('0f8670a583255cff3e5b7ca71b5d7454d928fc48'));
const GBC_WITH_MASTER_GIT_REVISION_GIT_REVISION_NUMBER = Util.bufferToArrayBuffer(textEncoder.encode('master-v196.0'));
const GBC_WITH_MASTER_GIT_REVISION_RTC_DATA = null;

const NSO_GBC_WITH_COMMIT_HASH_FILENAME = `${DIR}/Pokemon_TCG_Europe.sram`;
const RAW_GBC_WITH_COMMIT_HASH_FILENAME = `${DIR}/Pokemon_TCG_Europe.sav`;
const GBC_WITH_COMMIT_HASH_ROM_HASH = Util.bufferToArrayBuffer(textEncoder.encode('dffc15f3063a4c2df84c6361406b41aec1696d3e'));
const GBC_WITH_COMMIT_HASH_GIT_REVISION_NUMBER = Util.bufferToArrayBuffer(textEncoder.encode('HEAD-v213.0-1-g59d2e63b'));
const GBC_WITH_COMMIT_HASH_RTC_DATA = null;

const NSO_GBC_WITH_MASTER_GIT_REVISION_AND_RTC_DATA_FILENAME = `${DIR}/Pokemon_-_Crystal_Version.sram`;
const RAW_GBC_WITH_MASTER_GIT_REVISION_AND_RTC_DATA_FILENAME = `${DIR}/Pokemon_-_Crystal_Version.sav`;
const GBC_WITH_MASTER_GIT_REVISION_AND_RTC_DATA_ROM_HASH = Util.bufferToArrayBuffer(textEncoder.encode('f2f52230b536214ef7c9924f483392993e226cfb'));
const GBC_WITH_MASTER_GIT_REVISION_AND_RTC_DATA_GIT_REVISION_NUMBER = Util.bufferToArrayBuffer(textEncoder.encode('master-v199.0'));
const GBC_WITH_MASTER_GIT_REVISION_AND_RTC_DATA_RTC_DATA = Util.bufferToArrayBuffer(
  new Uint8Array(
    [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x09, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x09, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
  ),
);

const NSO_GB_GBC_FILENAME = `${DIR}/Links_Awakening_DX.sram`;
const RAW_GB_GBC_FILENAME = `${DIR}/Links_Awakening_DX.sav`;
const GB_GBC_ROM_HASH = Util.bufferToArrayBuffer(textEncoder.encode('1c091225688d966928cc74336dbef2e07d12a47c'));
const GB_GBC_GIT_REVISION_NUMBER = Util.bufferToArrayBuffer(textEncoder.encode('HEAD-v178.0'));
const GB_GBC_RTC_DATA = null;

const NSO_GBC_FILENAME = `${DIR}/Wario_Land_3.sram`;
const RAW_GBC_FILENAME = `${DIR}/Wario_Land_3.sav`;
const GBC_ROM_HASH = Util.bufferToArrayBuffer(textEncoder.encode('bb7877309834441fd03adb7fa65738e5d5b2d7ba'));
const GBC_GIT_REVISION_NUMBER = Util.bufferToArrayBuffer(textEncoder.encode('HEAD-v178.0'));
const GBC_RTC_DATA = null;

describe('Nintendo Switch Online - Gameboy', () => {
  it('should convert a raw GB save to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GB_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromRawData(rawArrayBuffer, GB_ROM_HASH, GB_GIT_REVISION_NUMBER, GB_RTC_DATA);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO GB save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GB_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRomHashArrayBuffer(), GB_ROM_HASH)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getGitRevisionNumberArrayBuffer(), GB_GIT_REVISION_NUMBER)).to.equal(true);
    expect(nsoSaveData.getRtcDataArrayBuffer()).to.equal(GB_RTC_DATA);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw newer version GB save to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GB_NEWER_VERSION_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_NEWER_VERSION_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromRawData(rawArrayBuffer, GB_NEWER_VERSION_ROM_HASH, GB_NEWER_VERSION_GIT_REVISION_NUMBER, GB_NEWER_VERSION_RTC_DATA);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO newer version GB save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GB_NEWER_VERSION_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_NEWER_VERSION_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRomHashArrayBuffer(), GB_NEWER_VERSION_ROM_HASH)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getGitRevisionNumberArrayBuffer(), GB_NEWER_VERSION_GIT_REVISION_NUMBER)).to.equal(true);
    expect(nsoSaveData.getRtcDataArrayBuffer()).to.equal(GB_NEWER_VERSION_RTC_DATA);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a GBC save with RTC data to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_WITH_RTC_DATA_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_WITH_RTC_DATA_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromRawData(rawArrayBuffer, GBC_WITH_RTC_DATA_ROM_HASH, GBC_WITH_RTC_DATA_GIT_REVISION_NUMBER, GBC_WITH_RTC_DATA_RTC_DATA);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO GBC save with RTC data to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_WITH_RTC_DATA_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_WITH_RTC_DATA_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRomHashArrayBuffer(), GBC_WITH_RTC_DATA_ROM_HASH)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getGitRevisionNumberArrayBuffer(), GBC_WITH_RTC_DATA_GIT_REVISION_NUMBER)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRtcDataArrayBuffer(), GBC_WITH_RTC_DATA_RTC_DATA)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw GBC save with master git revision to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_WITH_MASTER_GIT_REVISION_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_WITH_MASTER_GIT_REVISION_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromRawData(
      rawArrayBuffer,
      GBC_WITH_MASTER_GIT_REVISION_ROM_HASH,
      GBC_WITH_MASTER_GIT_REVISION_GIT_REVISION_NUMBER,
      GBC_WITH_MASTER_GIT_REVISION_RTC_DATA,
    );

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO GBC save with master git revision to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_WITH_MASTER_GIT_REVISION_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_WITH_MASTER_GIT_REVISION_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRomHashArrayBuffer(), GBC_WITH_MASTER_GIT_REVISION_ROM_HASH)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getGitRevisionNumberArrayBuffer(), GBC_WITH_MASTER_GIT_REVISION_GIT_REVISION_NUMBER)).to.equal(true);
    expect(nsoSaveData.getRtcDataArrayBuffer()).to.equal(GBC_WITH_MASTER_GIT_REVISION_RTC_DATA);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw GBC save with a commit hash to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_WITH_COMMIT_HASH_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_WITH_COMMIT_HASH_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromRawData(
      rawArrayBuffer,
      GBC_WITH_COMMIT_HASH_ROM_HASH,
      GBC_WITH_COMMIT_HASH_GIT_REVISION_NUMBER,
      GBC_WITH_COMMIT_HASH_RTC_DATA,
    );

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO GBC save with a commit hash to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_WITH_COMMIT_HASH_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_WITH_COMMIT_HASH_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRomHashArrayBuffer(), GBC_WITH_COMMIT_HASH_ROM_HASH)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getGitRevisionNumberArrayBuffer(), GBC_WITH_COMMIT_HASH_GIT_REVISION_NUMBER)).to.equal(true);
    expect(nsoSaveData.getRtcDataArrayBuffer()).to.equal(GBC_WITH_COMMIT_HASH_RTC_DATA);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw GBC save with master git revision number and RTC data to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_WITH_MASTER_GIT_REVISION_AND_RTC_DATA_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_WITH_MASTER_GIT_REVISION_AND_RTC_DATA_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromRawData(
      rawArrayBuffer,
      GBC_WITH_MASTER_GIT_REVISION_AND_RTC_DATA_ROM_HASH,
      GBC_WITH_MASTER_GIT_REVISION_AND_RTC_DATA_GIT_REVISION_NUMBER,
      GBC_WITH_MASTER_GIT_REVISION_AND_RTC_DATA_RTC_DATA,
    );

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO GBC save with master git revision number and RTC data to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_WITH_MASTER_GIT_REVISION_AND_RTC_DATA_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_WITH_MASTER_GIT_REVISION_AND_RTC_DATA_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRomHashArrayBuffer(), GBC_WITH_MASTER_GIT_REVISION_AND_RTC_DATA_ROM_HASH)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getGitRevisionNumberArrayBuffer(), GBC_WITH_MASTER_GIT_REVISION_AND_RTC_DATA_GIT_REVISION_NUMBER)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRtcDataArrayBuffer(), GBC_WITH_MASTER_GIT_REVISION_AND_RTC_DATA_RTC_DATA)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw dual compatibility GB/GBC save to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GB_GBC_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_GBC_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromRawData(rawArrayBuffer, GB_GBC_ROM_HASH, GB_GBC_GIT_REVISION_NUMBER, GB_GBC_RTC_DATA);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO dual compatibility GB/GBC save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GB_GBC_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GB_GBC_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRomHashArrayBuffer(), GB_GBC_ROM_HASH)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getGitRevisionNumberArrayBuffer(), GB_GBC_GIT_REVISION_NUMBER)).to.equal(true);
    expect(nsoSaveData.getRtcDataArrayBuffer()).to.equal(GB_GBC_RTC_DATA);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw GBC save to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromRawData(rawArrayBuffer, GBC_ROM_HASH, GBC_GIT_REVISION_NUMBER, GBC_RTC_DATA);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO GBC save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_GBC_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GBC_FILENAME);

    const nsoSaveData = NsoGameboySaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRomHashArrayBuffer(), GBC_ROM_HASH)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getGitRevisionNumberArrayBuffer(), GBC_GIT_REVISION_NUMBER)).to.equal(true);
    expect(nsoSaveData.getRtcDataArrayBuffer()).to.equal(GBC_RTC_DATA);
    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });
});
