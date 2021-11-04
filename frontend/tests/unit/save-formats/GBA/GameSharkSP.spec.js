import { expect } from 'chai';
import GameSharkSpSaveData from '@/save-formats/GBA/GameSharkSP';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/gba/gameshark-sp';

const GAMESHARKSP_FILENAME = `${DIR}/final-fantasy-tactics-advance.22864.gsv`;
const RAW_FILENAME = `${DIR}/final-fantasy-tactics-advance.22864.srm`;

describe('GameShark SP save format', () => {
  it('should convert a GameShark SP file to a raw file', async () => {
    const gameSharkSpArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GAMESHARKSP_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    const gameSharkSpSaveData = GameSharkSpSaveData.createFromGameSharkSpData(gameSharkSpArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(gameSharkSpSaveData.getRawSaveData(), rawArrayBuffer)).to.equal(true);
  });
});
