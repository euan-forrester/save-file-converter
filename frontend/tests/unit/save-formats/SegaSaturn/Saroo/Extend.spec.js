import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import SarooSegaSaturnExtendSaveData from '@/save-formats/SegaSaturn/Saroo/Extend';
import ArrayUtil from '@/util/Array';
// import SegaSaturnUtil from '@/save-formats/SegaSaturn/Util';

const DIR = './tests/data/save-formats/segasaturn/saroo';

/*
const SAROO_FILENAME_EMPTY = `${DIR}/SS_SAVE_empty.BIN`;

const SAROO_FILENAME_2_GAMES = `${DIR}/SS_SAVE_2_games.BIN`;
const SAROO_FILENAME_2_GAMES_FILE_1 = `${DIR}/Hyper Duel (Japan).raw`;
const SAROO_FILENAME_2_GAMES_FILE_2 = `${DIR}/Dungeons and Dragons Collection (Japan) (Disc 2) (Shadows over Mystara).raw`;
*/

const SAROO_1_GAME_2_SAVES = `${DIR}/SS_MEMS_1_game_2_extend_saves.BIN`;
const SAROO_1_GAME_2_SAVES_FILE_1 = `${DIR}/Daytona USA - Championship Circuit Edition (USA)-1.raw`;
const SAROO_1_GAME_2_SAVES_FILE_2 = `${DIR}/Daytona USA - Championship Circuit Edition (USA)-2.raw`;

// FIXME: Need a test for a game that saves to the backup cart, but has a marker in this file? Not sure how that works yet

// FIXME: Need test for empty file
// FIXME: Need test for file containing saves from > 1 game

describe('Sega Saturn - Saroo extend', () => {
  it('should extract saves from a Saroo extend file containing 2 saves, both from the same game', async () => {
    const sarooArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_1_GAME_2_SAVES);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_1_GAME_2_SAVES_FILE_1);
    const file2ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_1_GAME_2_SAVES_FILE_2);

    const segaSaturnSaveData = SarooSegaSaturnExtendSaveData.createFromSarooData(sarooArrayBuffer);

    expect(segaSaturnSaveData.getVolumeInfo().totalSize).to.equal(8388608);
    expect(segaSaturnSaveData.getVolumeInfo().numFreeBlocks).to.equal(7989);
    expect(segaSaturnSaveData.getVolumeInfo().numUsedBlocks).to.equal(75); // Header block + 7 directory blocks + 2 archive entry blocks + 4 data blocks (save 0) + 61 data blocks (save 1)
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getVolumeInfo().usedBlocks, ArrayUtil.createSequentialArray(0, 75))).to.equal(true);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(2);

    expect(segaSaturnSaveData.getSaveFiles()[0].name).to.equal('DAYTONA96_0');
    expect(segaSaturnSaveData.getSaveFiles()[0].language).to.equal('English');
    expect(segaSaturnSaveData.getSaveFiles()[0].comment).to.equal('RECORDS');
    expect(segaSaturnSaveData.getSaveFiles()[0].date.toUTCString()).to.equal('Wed, 11 Dec 2024 13:07:00 GMT');
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getSaveFiles()[0].blockList, ArrayUtil.createSequentialArray(9, 4))).to.equal(true);
    expect(segaSaturnSaveData.getSaveFiles()[0].saveSize).to.equal(4033);
    expect(segaSaturnSaveData.getSaveFiles()[0].saveSize).to.equal(file1ArrayBuffer.byteLength);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getSaveFiles()[0].rawData, file1ArrayBuffer)).to.equal(true);

    expect(segaSaturnSaveData.getSaveFiles()[1].name).to.equal('DAYTONA96_1');
    expect(segaSaturnSaveData.getSaveFiles()[1].language).to.equal('English');
    expect(segaSaturnSaveData.getSaveFiles()[1].comment).to.equal('GHOST');
    expect(segaSaturnSaveData.getSaveFiles()[1].date.toUTCString()).to.equal('Wed, 11 Dec 2024 13:07:00 GMT');
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getSaveFiles()[1].blockList, ArrayUtil.createSequentialArray(14, 61))).to.equal(true);
    expect(segaSaturnSaveData.getSaveFiles()[1].saveSize).to.equal(61713);
    expect(segaSaturnSaveData.getSaveFiles()[1].saveSize).to.equal(file2ArrayBuffer.byteLength);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getSaveFiles()[1].rawData, file2ArrayBuffer)).to.equal(true);
  });
});
