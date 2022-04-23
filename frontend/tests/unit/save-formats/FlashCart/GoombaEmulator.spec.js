import { expect } from 'chai';
import GoombaEmulatorSaveData from '@/save-formats/FlashCart/GoombaEmulator';
import ArrayBufferUtil from '#/util/ArrayBuffer';
import Config from '#/config';

const config = Config.Create();

const TEST_RETAIL_ROMS = config.get().testFlashCartRetailGames; // We don't check retail ROMs into the repo

const DIR = './tests/unit/save-formats/data/flashcart/goombaemulator';

const RAW_ZELDA_FILENAME = `${DIR}/Legend of Zelda, The - Link's Awakening (USA, Europe).sav`;
const GOOMBA_ZELDA_FILENAME = `${DIR}/Legend of Zelda, The - Link's Awakening (USA, Europe).esv`;

const ZELDA_ROM_FILENAME = `${DIR}/retail/Legend of Zelda, The - Link's Awakening (USA, Europe).gb`;
const ZELDA_ROM_CHECKSUM = 0x377aa60f;

const RAW_WARIO_FILENAME = `${DIR}/Wario Land 3.sav`;
const GOOMBA_WARIO_FILENAME = `${DIR}/Wario Land 3.srm`;

const WARIO_ROM_CHECKSUM = 0xb2380b51;

describe('Flash cart - Goomba emulator save format', () => {
  it('should convert a Goomba emulator save made with an EZ Flash ODE to raw format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_ZELDA_FILENAME);
    const goombaArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GOOMBA_ZELDA_FILENAME);

    const goombaEmulatorSaveData = GoombaEmulatorSaveData.createFromGoombaData(goombaArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(goombaEmulatorSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
    expect(goombaEmulatorSaveData.getRomChecksum()).to.equal(ZELDA_ROM_CHECKSUM);
    expect(goombaEmulatorSaveData.getFrameCount()).to.equal(0); // Dunno what this means
    expect(goombaEmulatorSaveData.getGameTitle()).to.equal('ZELDA');
    expect(goombaEmulatorSaveData.getCompressedSize()).to.equal(148);
    expect(goombaEmulatorSaveData.getUncompressedSize()).to.equal(rawArrayBuffer.byteLength);
  });

  it('should convert a Goomba emulator save made with an Everdrive GBA to raw format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_WARIO_FILENAME);
    const goombaArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GOOMBA_WARIO_FILENAME);

    const goombaEmulatorSaveData = GoombaEmulatorSaveData.createFromGoombaData(goombaArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(goombaEmulatorSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
    expect(goombaEmulatorSaveData.getRomChecksum()).to.equal(WARIO_ROM_CHECKSUM);
    expect(goombaEmulatorSaveData.getFrameCount()).to.equal(0); // Dunno what this means
    expect(goombaEmulatorSaveData.getGameTitle()).to.equal('WARIOLAND3');
    expect(goombaEmulatorSaveData.getCompressedSize()).to.equal(5368);
    expect(goombaEmulatorSaveData.getUncompressedSize()).to.equal(rawArrayBuffer.byteLength);
  });

  TEST_RETAIL_ROMS && it('should calculate the checksum of a ROM', async () => { // eslint-disable-line no-unused-expressions
    const romArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ZELDA_ROM_FILENAME);

    expect(GoombaEmulatorSaveData.calculateRomChecksum(romArrayBuffer)).to.equal(ZELDA_ROM_CHECKSUM);
  });
});
