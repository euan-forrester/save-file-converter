import { expect } from 'chai';
import PocketNesEmulatorSaveData from '@/save-formats/FlashCarts/GBA/PocketNesEmulator';
import ArrayBufferUtil from '#/util/ArrayBuffer';
import Config from '#/config';

const config = Config.Create();

const TEST_RETAIL_ROMS = config.get().testFlashCartRetailGames; // We don't check retail ROMs into the repo

const DIR = './tests/unit/save-formats/data/flashcarts/pocketnesemulator';

// const RAW_ZELDA_FILENAME = `${DIR}/Zelda II - The Adventure of Link (USA)-from-pocketnes.sav`;
const POCKETNES_ZELDA_FILENAME = `${DIR}/Zelda II - The Adventure of Link (USA)-from-pocketnes.esv`;

/*
const RAW_CART_ZELDA_FILENAME = `${DIR}/Zelda II - The Adventure of Link (USA)-from-cart.sav`;
const GOOMBA_CART_ZELDA_FILENAME = `${DIR}/Zelda II - The Adventure of Link (USA)-from-cart.esv`;
*/

const ZELDA_ROM_FILENAME = `${DIR}/retail/Zelda II - The Adventure of Link (USA).nes`;
const ZELDA_ROM_CHECKSUM = 0x4665B580; // 0x7CFF3E31; <- commented one calculated by algorithm for GB ROMs
const ZELDA_INTERNAL_NAME = 'ZELDA';

// Differences:
//
// - Config data and state header are in opposite order: need to search for each one, I guess
// - ROM checksum is different
// - ROM internal name is "SAVE"
// - What happens with a NES 2.0 headered ROM? checksum & internal name

describe('Flash cart - PocketNES emulator save format', () => {
  it('should convert a PocketNES emulator save made with an EZ Flash ODE to raw format', async () => {
    // const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_ZELDA_FILENAME);
    const pocketNesArrayBuffer = await ArrayBufferUtil.readArrayBuffer(POCKETNES_ZELDA_FILENAME);

    const pocketNesEmulatorSaveData = PocketNesEmulatorSaveData.createFromFlashCartData(pocketNesArrayBuffer);

    // expect(ArrayBufferUtil.arrayBuffersEqual(pocketNesEmulatorSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
    expect(pocketNesEmulatorSaveData.getRomChecksum()).to.equal(ZELDA_ROM_CHECKSUM);
    expect(pocketNesEmulatorSaveData.getFrameCount()).to.equal(0); // Dunno what this means
    expect(pocketNesEmulatorSaveData.getGameTitle()).to.equal(ZELDA_INTERNAL_NAME);
    expect(pocketNesEmulatorSaveData.getCompressedSize()).to.equal(148);
    // expect(pocketNesEmulatorSaveData.getUncompressedSize()).to.equal(rawArrayBuffer.byteLength);
  });

  /*
  it('should convert a save from a cartridge to the Goomba save format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_CART_ZELDA_FILENAME);
    const pocketNesArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GOOMBA_CART_ZELDA_FILENAME);

    const pocketNesEmulatorSaveData = PocketNesEmulatorSaveData.createFromRawDataInternal(rawArrayBuffer, ZELDA_INTERNAL_NAME, ZELDA_ROM_CHECKSUM); // Use the 'internal' function for tests so that we can run the test without the retail ROM

    expect(ArrayBufferUtil.arrayBuffersEqual(pocketNesEmulatorSaveData.getFlashCartArrayBuffer(), pocketNesArrayBuffer)).to.equal(true);
    expect(pocketNesEmulatorSaveData.getRomChecksum()).to.equal(ZELDA_ROM_CHECKSUM);
    expect(pocketNesEmulatorSaveData.getFrameCount()).to.equal(0); // Dunno what this means
    expect(pocketNesEmulatorSaveData.getGameTitle()).to.equal('ZELDA');
    expect(pocketNesEmulatorSaveData.getCompressedSize()).to.equal(1185);
    expect(pocketNesEmulatorSaveData.getUncompressedSize()).to.equal(rawArrayBuffer.byteLength);
  });
  */

  TEST_RETAIL_ROMS && it('should calculate the checksum of a ROM', async () => { // eslint-disable-line no-unused-expressions
    const romArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ZELDA_ROM_FILENAME);
    const calculatedChecksum = PocketNesEmulatorSaveData.calculateRomChecksum(romArrayBuffer);

    expect(calculatedChecksum).to.equal(ZELDA_ROM_CHECKSUM);
  });
});
