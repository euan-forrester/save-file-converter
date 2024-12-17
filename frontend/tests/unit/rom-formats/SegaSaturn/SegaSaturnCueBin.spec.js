import { expect } from 'chai';
import SegaSaturnCueBin from '@/rom-formats/SegaSaturnCueBin';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/data/rom-formats/segasaturn';

const GAME_1_FILENAME = `${DIR}/Thunder Force V - track 1 header.bin`; // Not a real ROM file (!), just the parts in the header that we read
const GAME_2_FILENAME = `${DIR}/Saturn Bomberman - track 1 header.bin`; // Not a real ROM file (!), just the parts in the header that we read

describe('Sega Saturn .cue/.bin format', () => {
  it('should parse a .bin file', async () => {
    const romArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GAME_1_FILENAME);

    const segaSaturnCueBin = new SegaSaturnCueBin(romArrayBuffer);

    expect(segaSaturnCueBin.getGameId()).to.equal('T-1811G   V1.002');
  });

  it('should parse another .bin file', async () => {
    const romArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GAME_2_FILENAME);

    const segaSaturnCueBin = new SegaSaturnCueBin(romArrayBuffer);

    expect(segaSaturnCueBin.getGameId()).to.equal('MK-81070  V1.003');
  });
});
