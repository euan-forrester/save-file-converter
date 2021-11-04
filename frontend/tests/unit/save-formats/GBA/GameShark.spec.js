import { expect } from 'chai';
import GameSharkSaveData from '@/save-formats/GBA/GameShark';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/gba/gameshark';

const GAMESHARK_FILENAME = `${DIR}/the-legend-of-zelda-the-minish-cap.6650.sps`;
const SAVE_TITLE = 'GBAZELDA MC';
const SAVE_TIME = '07/03/05 01:32:40 a.m.';
const SAVE_NOTES = '';

const RAW_FILENAME = `${DIR}/the-legend-of-zelda-the-minish-cap.6650.srm`;
const ROM_FILENAME = `${DIR}/Legend of Zelda, The - The Minish Cap (U).gba`; // Not a real ROM file (!), just the parts in the header that we read

const GAMESHARK_SIZE = 65536; // Bytes
const RAW_SIZE = 8192; // Bytes

const IGNORE_CHECKSUM_SIZE = 4; // Bytes - size of the checksum at the end of the GameShark file. Various sources of these files use various algorithms for this checksum, and it's not checked by various emulators. So ours won't match (it was copied from a particular emulator) and we can safely ignore it

describe('GameShark save format', () => {
  it('should convert a GameShark file to a raw file', async () => {
    const gameSharkArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GAMESHARK_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    const gameSharkSaveData = GameSharkSaveData.createFromGameSharkData(gameSharkArrayBuffer);

    const resizedGameSharkSaveData = GameSharkSaveData.createWithNewSize(gameSharkSaveData, RAW_SIZE);

    expect(ArrayBufferUtil.arrayBuffersEqual(resizedGameSharkSaveData.getRawSaveData(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw file to a GameShark file', async () => {
    const gameSharkArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GAMESHARK_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);
    const romArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ROM_FILENAME);

    const gameSharkSaveData = GameSharkSaveData.createFromEmulatorData(rawArrayBuffer, SAVE_TITLE, SAVE_TIME, SAVE_NOTES, romArrayBuffer);

    const resizedGameSharkSaveData = GameSharkSaveData.createWithNewSize(gameSharkSaveData, GAMESHARK_SIZE);

    expect(ArrayBufferUtil.arrayBuffersEqual(resizedGameSharkSaveData.getArrayBuffer(), gameSharkArrayBuffer, IGNORE_CHECKSUM_SIZE)).to.equal(true);
  });
});
