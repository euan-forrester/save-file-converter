import { expect } from 'chai';
import SmsAdvanceEmulatorSaveData from '@/save-formats/FlashCarts/GBA/SmsAdvanceEmulator';
import ArrayBufferUtil from '#/util/ArrayBuffer';
import Config from '#/config';

const config = Config.Create();

const TEST_RETAIL_ROMS = config.get().testFlashCartRetailGames; // We don't check retail ROMs into the repo

const DIR = './tests/data/save-formats/flashcarts/gba/smsadvanceemulator';

const RAW_PHANTASY_STAR_ON_GBA_FILENAME = `${DIR}/Phantasy Star (USA, Europe) (Rev 1)-from-coury-raw.srm`;
const SMS_ADVANCE_PHANTASY_STAR_ON_GBA_FILENAME = `${DIR}/Phantasy Star (USA, Europe) (Rev 1)-from-coury.srm`;

// I don't own a GBA Everdrive to be able to test this personally, so let's use both saves we got from other people just to be safe
const RAW_PHANTASY_STAR_AGAIN_ON_GBA_FILENAME = `${DIR}/Phantasy Star (USA, Europe) (v1.3)-from-reddit-raw.srm`;
const SMS_ADVANCE_PHANTASY_STAR_AGAIN_ON_GBA_FILENAME = `${DIR}/Phantasy Star (USA, Europe) (v1.3)-from-reddit.srm`;

// I have an EZ-Flash ODE, which (without custom firmware) can only run this emulator in bundled mode where you use a PC to
// bundle the emulator with a fixed set of game ROMs. This save file is from that, so let's test it too. The main
// difference seems to be that these files can contain saves from multiple games, and they have the confis data before the save data
const RAW_PHANTASY_STAR_BUNDLED_ON_GBA_FILENAME = `${DIR}/Phantasy Star-from-smsadvance-bundled-raw.sav`;
const SMS_ADVANCE_PHANTASY_STAR_BUNDLED_ON_GBA_FILENAME = `${DIR}/Phantasy Star-from-smsadvance-bundled.sav`;

const RAW_PHANTASY_STAR_FROM_EMULATOR_FILENAME = `${DIR}/Phantasy Star (USA, Europe) (Rev A)-from-emulator.sav`;
const SMS_ADVANCE_PHANTASY_STAR_FROM_EMULATOR_FILENAME = `${DIR}/Phantasy Star (USA, Europe) (Rev A)-from-emulator-to-smsadvance.sav`;

const PHANTASY_STAR_ROM_FILENAME = `${DIR}/retail/Phantasy Star (USA, Europe) (Rev A).sms`;
const PHANTASY_STAR_ROM_CHECKSUM = 0xE48D79F0;

describe('Flash cart - GBA - SMSAdvance emulator save format', () => {
  it('should convert an SMSAdvance emulator save made with the emulator running integrated into the GBA Everdrive OS', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_PHANTASY_STAR_ON_GBA_FILENAME);
    const smsAdvanceArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SMS_ADVANCE_PHANTASY_STAR_ON_GBA_FILENAME);

    const smsAdvanceEmulatorSaveData = SmsAdvanceEmulatorSaveData.createFromFlashCartData(smsAdvanceArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(smsAdvanceEmulatorSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
    expect(smsAdvanceEmulatorSaveData.getRomChecksum()).to.equal(PHANTASY_STAR_ROM_CHECKSUM);
    expect(smsAdvanceEmulatorSaveData.getFrameCount()).to.equal(2872);
    expect(smsAdvanceEmulatorSaveData.getGameTitle()).to.equal('/3 Emulated Systems/3 Sega Mast');
    expect(smsAdvanceEmulatorSaveData.getCompressedSize()).to.equal(340);
    expect(smsAdvanceEmulatorSaveData.getUncompressedSize()).to.equal(rawArrayBuffer.byteLength);
  });

  it('should convert another SMSAdvance emulator save made with the emulator running integrated into the GBA Everdrive OS', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_PHANTASY_STAR_AGAIN_ON_GBA_FILENAME);
    const smsAdvanceArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SMS_ADVANCE_PHANTASY_STAR_AGAIN_ON_GBA_FILENAME);

    const smsAdvanceEmulatorSaveData = SmsAdvanceEmulatorSaveData.createFromFlashCartData(smsAdvanceArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(smsAdvanceEmulatorSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
    expect(smsAdvanceEmulatorSaveData.getRomChecksum()).to.equal(PHANTASY_STAR_ROM_CHECKSUM);
    expect(smsAdvanceEmulatorSaveData.getFrameCount()).to.equal(4464);
    expect(smsAdvanceEmulatorSaveData.getGameTitle()).to.equal('/SMS/Phantasy Star (USA, Europe');
    expect(smsAdvanceEmulatorSaveData.getCompressedSize()).to.equal(336);
    expect(smsAdvanceEmulatorSaveData.getUncompressedSize()).to.equal(rawArrayBuffer.byteLength);
  });

  it('should convert an SMSAdvance emulator save made with the emulator running in bundled mode on an EZ Flash ODE', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_PHANTASY_STAR_BUNDLED_ON_GBA_FILENAME);
    const smsAdvanceArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SMS_ADVANCE_PHANTASY_STAR_BUNDLED_ON_GBA_FILENAME);

    const smsAdvanceEmulatorSaveData = SmsAdvanceEmulatorSaveData.createFromFlashCartData(smsAdvanceArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(smsAdvanceEmulatorSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
    expect(smsAdvanceEmulatorSaveData.getRomChecksum()).to.equal(PHANTASY_STAR_ROM_CHECKSUM);
    expect(smsAdvanceEmulatorSaveData.getFrameCount()).to.equal(4062);
    expect(smsAdvanceEmulatorSaveData.getGameTitle()).to.equal('Phantasy Star');
    expect(smsAdvanceEmulatorSaveData.getCompressedSize()).to.equal(340);
    expect(smsAdvanceEmulatorSaveData.getUncompressedSize()).to.equal(rawArrayBuffer.byteLength);
  });

  it('should convert a raw save to the SMSAdvance save format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_PHANTASY_STAR_FROM_EMULATOR_FILENAME);
    const smsAdvanceArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SMS_ADVANCE_PHANTASY_STAR_FROM_EMULATOR_FILENAME);

    const smsAdvanceEmulatorSaveData = SmsAdvanceEmulatorSaveData.createFromRawDataInternal(rawArrayBuffer, PHANTASY_STAR_ROM_CHECKSUM); // Use the 'internal' function for tests so that we can run the test without the retail ROM

    expect(ArrayBufferUtil.arrayBuffersEqual(smsAdvanceEmulatorSaveData.getFlashCartArrayBuffer(), smsAdvanceArrayBuffer)).to.equal(true);
    expect(smsAdvanceEmulatorSaveData.getRomChecksum()).to.equal(PHANTASY_STAR_ROM_CHECKSUM);
    expect(smsAdvanceEmulatorSaveData.getFrameCount()).to.equal(0); // We don't have the means to set this correctly
    expect(smsAdvanceEmulatorSaveData.getGameTitle()).to.equal(SmsAdvanceEmulatorSaveData.GAME_TITLE);
    expect(smsAdvanceEmulatorSaveData.getCompressedSize()).to.equal(260);
    expect(smsAdvanceEmulatorSaveData.getUncompressedSize()).to.equal(rawArrayBuffer.byteLength);
  });

  TEST_RETAIL_ROMS && it('should calculate the checksum of a ROM', async () => { // eslint-disable-line no-unused-expressions
    const romArrayBuffer = await ArrayBufferUtil.readArrayBuffer(PHANTASY_STAR_ROM_FILENAME);
    const calculatedChecksum = SmsAdvanceEmulatorSaveData.calculateRomChecksum(romArrayBuffer);

    expect(calculatedChecksum).to.equal(PHANTASY_STAR_ROM_CHECKSUM);
  });
});
