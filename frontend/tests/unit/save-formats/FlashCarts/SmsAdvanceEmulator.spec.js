import { expect } from 'chai';
import SmsAdvanceEmulatorSaveData from '@/save-formats/FlashCarts/GBA/SmsAdvanceEmulator';
import ArrayBufferUtil from '#/util/ArrayBuffer';
import Config from '#/config';

const config = Config.Create();

const TEST_RETAIL_ROMS = config.get().testFlashCartRetailGames; // We don't check retail ROMs into the repo

const DIR = './tests/unit/save-formats/data/flashcarts/smsadvanceemulator';

// const RAW_POCKETNES_ZELDA_FILENAME = `${DIR}/Zelda II - The Adventure of Link (USA)-from-pocketnes.sav`;
const RAW_PHANTASY_STAR_FILENAME = `${DIR}/Phantasy Star-from-smsadvance.sav`;
const SMS_ADVANCE_PHANTASY_STAR_FILENAME = `${DIR}/Phantasy Star-from-smsadvance.esv`;

// const RAW_CART_ZELDA_FILENAME = `${DIR}/Zelda II - The Adventure of Link (USA)-from-cart.sav`;
// const POCKETNES_CART_ZELDA_FILENAME = `${DIR}/Zelda II - The Adventure of Link (USA)-from-cart.esv`;

const PHANTASY_STAR_ROM_FILENAME = `${DIR}/retail/Phantasy Star (USA, Europe).sms`;
const PHANTASY_STAR_ROM_CHECKSUM = 0x4665B580;

describe('Flash cart - SMSAdvance emulator save format', () => {
  it('should convert an SMSAdvance emulator save made with the emulator running standalone to raw format', async () => {
    // const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_PHANTASY_STAR_FILENAME);
    const smsAdvanceArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SMS_ADVANCE_PHANTASY_STAR_FILENAME);

    const smsAdvanceEmulatorSaveData = SmsAdvanceEmulatorSaveData.createFromFlashCartData(pocketNesArrayBuffer);

    // expect(ArrayBufferUtil.arrayBuffersEqual(smsAdvanceEmulatorSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
    expect(smsAdvanceEmulatorSaveData.getRomChecksum()).to.equal(ZELDA_ROM_CHECKSUM);
    expect(smsAdvanceEmulatorSaveData.getFrameCount()).to.equal(0); // Dunno what this means
    expect(smsAdvanceEmulatorSaveData.getGameTitle()).to.equal('Phantasy Star'); // This comes from the filename of the rom. What happens when it's integrated into the flash cart operating system?
    expect(smsAdvanceEmulatorSaveData.getCompressedSize()).to.equal(3500);
    // expect(smsAdvanceEmulatorSaveData.getUncompressedSize()).to.equal(rawArrayBuffer.byteLength);

    ArrayBufferUtil.writeArrayBuffer(RAW_PHANTASY_STAR_FILENAME, smsAdvanceEmulatorSaveData.getRawArrayBuffer());
  });

  /*
  it('should convert a save from a cartridge to the PocketNES save format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_CART_ZELDA_FILENAME);
    const pocketNesArrayBuffer = await ArrayBufferUtil.readArrayBuffer(POCKETNES_CART_ZELDA_FILENAME);

    const smsAdvanceEmulatorSaveData = SmsAdvanceEmulatorSaveData.createFromRawDataInternal(rawArrayBuffer, ZELDA_ROM_CHECKSUM); // Use the 'internal' function for tests so that we can run the test without the retail ROM

    expect(ArrayBufferUtil.arrayBuffersEqual(smsAdvanceEmulatorSaveData.getFlashCartArrayBuffer(), pocketNesArrayBuffer)).to.equal(true);
    expect(smsAdvanceEmulatorSaveData.getRomChecksum()).to.equal(ZELDA_ROM_CHECKSUM);
    expect(smsAdvanceEmulatorSaveData.getFrameCount()).to.equal(0); // Dunno what this means
    expect(smsAdvanceEmulatorSaveData.getGameTitle()).to.equal(PocketNesEmulatorSaveData.GAME_TITLE);
    expect(smsAdvanceEmulatorSaveData.getCompressedSize()).to.equal(3960);
    expect(smsAdvanceEmulatorSaveData.getUncompressedSize()).to.equal(rawArrayBuffer.byteLength);
  });
  */

  TEST_RETAIL_ROMS && it('should calculate the checksum of a ROM', async () => { // eslint-disable-line no-unused-expressions
    const romArrayBuffer = await ArrayBufferUtil.readArrayBuffer(PHANTASY_STAR_ROM_FILENAME);
    const calculatedChecksum = PocketNesEmulatorSaveData.calculateRomChecksum(romArrayBuffer);

    expect(calculatedChecksum).to.equal(PHANTASY_STAR_ROM_CHECKSUM);
  });
});
