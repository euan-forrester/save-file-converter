import { expect } from 'chai';
import GenesisMegaEverdriveProNesFlashCartSaveData from '@/save-formats/FlashCarts/Genesis/MegaEverdrivePro/NES';
import GenesisMegaEverdriveProSmsFlashCartSaveData from '@/save-formats/FlashCarts/Genesis/MegaEverdrivePro/SMS';
import GenesisMegaEverdriveProGenesisFlashCartSaveData from '@/save-formats/FlashCarts/Genesis/MegaEverdrivePro/Genesis';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/flashcarts/genesis';

const MEGA_EVERDRIVE_PRO_NES_FILENAME = `${DIR}/megaeverdrivepro/Zelda II - The Adventure of Link (USA).srm`;
const MEGA_EVERDRIVE_PRO_SMS_FILENAME = `${DIR}/megaeverdrivepro/Phantasy Star (USA, Europe) (Rev A).srm`;

const MEGA_EVERDRIVE_PRO_SRAM_FILENAME = `${DIR}/megaeverdrivepro/Phantasy Star II (USA, Europe) (Rev A).srm`;
const MEGA_EVERDRIVE_PRO_EEPROM_FILENAME = `${DIR}/megaeverdrivepro/Wonder Boy in Monster World (USA, Europe).srm`;
const MEGA_EVERDRIVE_PRO_FRAM_FILENAME = `${DIR}/megaeverdrivepro/Sonic The Hedgehog 3 (USA).srm`;

const EMULATOR_FRAM_FILENAME = `${DIR}/emulator/Sonic The Hedgehog 3 (USA).sav`; // For some reason, the GenesisPlus emulator writes out a 64kB file here even though the Mega Everdrive Pro writes out 8kB of data

describe('Flash cart - Genesis - Mega Everdrive Pro', () => {
  it('should convert a raw NES save to flash cart format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_NES_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProNesFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a flash cart NES save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_NES_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProNesFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a raw SMS save to flash cart format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_SMS_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProSmsFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a flash cart SMS save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_SMS_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProSmsFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a raw SRAM save to flash cart format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_SRAM_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProGenesisFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a flash cart SRAM save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_SRAM_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProGenesisFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a raw EEPROM save to flash cart format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_EEPROM_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProGenesisFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a flash cart EEPROM save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_EEPROM_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProGenesisFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a raw FRAM save to flash cart format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_FRAM_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProGenesisFlashCartSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a flash cart FRAM save to raw format', async () => {
    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_FRAM_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProGenesisFlashCartSaveData.createFromFlashCartData(flashCartArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(flashCartSaveData.getFlashCartArrayBuffer(), flashCartSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert an emulator FRAM save to flash cart format', async () => {
    // When we load the Mega Everdrive Pro file on the GenesisPlus emulator, it writes out a 64kB file. So let's
    // truncate that down to 8kB and verify that it's identical to the original Mega Everdrive Pro file.
    //
    // This verifies that the output of the emulator will work on the Mega Everdrive Pro if the user uses the dropdown to reduce the output file size

    const flashCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_EVERDRIVE_PRO_FRAM_FILENAME);
    const emulatorArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_FRAM_FILENAME);

    const flashCartSaveData = GenesisMegaEverdriveProGenesisFlashCartSaveData.createFromRawData(emulatorArrayBuffer);
    const smallerFlashCartSaveData = GenesisMegaEverdriveProGenesisFlashCartSaveData.createWithNewSize(flashCartSaveData, flashCartArrayBuffer.byteLength);

    expect(ArrayBufferUtil.arrayBuffersEqual(smallerFlashCartSaveData.getFlashCartArrayBuffer(), flashCartArrayBuffer)).to.equal(true);
  });
});
