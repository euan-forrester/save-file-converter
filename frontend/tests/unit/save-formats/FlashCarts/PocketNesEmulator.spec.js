import { expect } from 'chai';
import PocketNesEmulatorSaveData from '@/save-formats/FlashCarts/GBA/PocketNesEmulator';
import ArrayBufferUtil from '#/util/ArrayBuffer';
import Config from '#/config';

const config = Config.Create();

const TEST_RETAIL_ROMS = config.get().testFlashCartRetailGames; // We don't check retail ROMs into the repo

const DIR = './tests/unit/save-formats/data/flashcarts/pocketnesemulator';

const RAW_POCKETNES_ZELDA_FILENAME = `${DIR}/Zelda II - The Adventure of Link (USA)-from-pocketnes.sav`;
const POCKETNES_ZELDA_FILENAME = `${DIR}/Zelda II - The Adventure of Link (USA)-from-pocketnes.esv`;

const RAW_CART_ZELDA_FILENAME = `${DIR}/Zelda II - The Adventure of Link (USA)-from-cart.sav`;
const POCKETNES_CART_ZELDA_FILENAME = `${DIR}/Zelda II - The Adventure of Link (USA)-from-cart.esv`;

const ZELDA_ROM_FILENAME = `${DIR}/retail/Zelda II - The Adventure of Link (USA).nes`;
const ZELDA_ROM_CHECKSUM = 0x4665B580;

describe('Flash cart - PocketNES emulator save format', () => {
  it('should convert a PocketNES emulator save made with an EZ Flash ODE to raw format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_POCKETNES_ZELDA_FILENAME);
    const pocketNesArrayBuffer = await ArrayBufferUtil.readArrayBuffer(POCKETNES_ZELDA_FILENAME);

    const pocketNesEmulatorSaveData = PocketNesEmulatorSaveData.createFromFlashCartData(pocketNesArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(pocketNesEmulatorSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
    expect(pocketNesEmulatorSaveData.getRomChecksum()).to.equal(ZELDA_ROM_CHECKSUM);
    expect(pocketNesEmulatorSaveData.getFrameCount()).to.equal(0); // Number of ingame frames that has passed doesn't seem to be set in PocketNES
    expect(pocketNesEmulatorSaveData.getGameTitle()).to.equal(PocketNesEmulatorSaveData.GAME_TITLE);
    expect(pocketNesEmulatorSaveData.getCompressedSize()).to.equal(3500);
    expect(pocketNesEmulatorSaveData.getUncompressedSize()).to.equal(rawArrayBuffer.byteLength);
  });

  it('should convert a save from a cartridge to the PocketNES save format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_CART_ZELDA_FILENAME);
    const pocketNesArrayBuffer = await ArrayBufferUtil.readArrayBuffer(POCKETNES_CART_ZELDA_FILENAME);

    const pocketNesEmulatorSaveData = PocketNesEmulatorSaveData.createFromRawDataInternal(rawArrayBuffer, ZELDA_ROM_CHECKSUM); // Use the 'internal' function for tests so that we can run the test without the retail ROM

    expect(ArrayBufferUtil.arrayBuffersEqual(pocketNesEmulatorSaveData.getFlashCartArrayBuffer(), pocketNesArrayBuffer)).to.equal(true);
    expect(pocketNesEmulatorSaveData.getRomChecksum()).to.equal(ZELDA_ROM_CHECKSUM);
    expect(pocketNesEmulatorSaveData.getFrameCount()).to.equal(0); // Number of ingame frames that has passed doesn't seem to be set in PocketNES
    expect(pocketNesEmulatorSaveData.getGameTitle()).to.equal(PocketNesEmulatorSaveData.GAME_TITLE);
    expect(pocketNesEmulatorSaveData.getCompressedSize()).to.equal(3960);
    expect(pocketNesEmulatorSaveData.getUncompressedSize()).to.equal(rawArrayBuffer.byteLength);
  });

  TEST_RETAIL_ROMS && it('should calculate the checksum of a ROM', async () => { // eslint-disable-line no-unused-expressions
    const romArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ZELDA_ROM_FILENAME);
    const calculatedChecksum = PocketNesEmulatorSaveData.calculateRomChecksum(romArrayBuffer);

    expect(calculatedChecksum).to.equal(ZELDA_ROM_CHECKSUM);
  });
});
