import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import GameCubeSaveData from '@/save-formats/GameCube/GameCube';

const DIR = './tests/data/save-formats/gamecube';

const EMPTY_ASCII_FILENAME = `${DIR}/usa-empty-0251b-16mb.raw`;
const EMPTY_SHIFT_JIS_FILENAME = `${DIR}/jpn-empty-0251b-16mb.raw`;

describe('GameCube', () => {
  it('should correctly read an empty ASCII GameCube file', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMPTY_ASCII_FILENAME);

    const gameCubeSaveData = GameCubeSaveData.createFromGameCubeData(arrayBuffer);

    expect(gameCubeSaveData.getSaveFiles().length).to.equal(0);

    expect(gameCubeSaveData.getVolumeInfo().formatTime.toUTCString()).to.equal('Tue, 25 Aug 2020 17:46:54 GMT');
    expect(gameCubeSaveData.getVolumeInfo().memcardSlot).to.equal(GameCubeSaveData.MEMCARD_SLOT_A);
    expect(gameCubeSaveData.getVolumeInfo().memcardSizeMegabits).to.equal(16);
    expect(gameCubeSaveData.getVolumeInfo().encodingString).to.equal('US-ASCII');
  });

  it('should correctly read an empty shift-jis GameCube file', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMPTY_SHIFT_JIS_FILENAME);

    const gameCubeSaveData = GameCubeSaveData.createFromGameCubeData(arrayBuffer);

    expect(gameCubeSaveData.getSaveFiles().length).to.equal(0);

    expect(gameCubeSaveData.getVolumeInfo().formatTime.toUTCString()).to.equal('Tue, 07 Sep 2021 20:52:11 GMT');
    expect(gameCubeSaveData.getVolumeInfo().memcardSlot).to.equal(GameCubeSaveData.MEMCARD_SLOT_A);
    expect(gameCubeSaveData.getVolumeInfo().memcardSizeMegabits).to.equal(16);
    expect(gameCubeSaveData.getVolumeInfo().encodingString).to.equal('shift-jis');
  });
});
