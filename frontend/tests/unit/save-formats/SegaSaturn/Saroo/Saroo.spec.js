import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import SarooSegaSaturnSaveData from '@/save-formats/SegaSaturn/Saroo/Saroo';
import ArrayUtil from '@/util/Array';
// import SegaSaturnUtil from '@/save-formats/SegaSaturn/Util';

const DIR = './tests/data/save-formats/segasaturn/saroo';

const SAROO_FILENAME_EMPTY = `${DIR}/SS_SAVE_empty.BIN`;

const SAROO_FILENAME_2_GAMES = `${DIR}/SS_SAVE_2_games.BIN`;
const SAROO_FILENAME_2_GAMES_FILE_1 = `${DIR}/Hyper Duel (Japan).raw`;
const SAROO_FILENAME_2_GAMES_FILE_2 = `${DIR}/Dungeons and Dragons Collection (Japan) (Disc 2) (Shadows over Mystara).raw`;

const SAROO_1_GAME_2_SAVES = `${DIR}/SS_SAVE_1_game_2_saves.BIN`;
const SAROO_1_GAME_2_SAVES_FILE_1 = `${DIR}/Shining Force III Scenario 1 (English v25.1)-1.raw`;
const SAROO_1_GAME_2_SAVES_FILE_2 = `${DIR}/Shining Force III Scenario 1 (English v25.1)-2.raw`;

// FIXME: Need a test for a game that saves to the backup cart, but has a marker in this file? Not sure how that works yet

describe('Sega Saturn - Saroo', () => {
  it('should parse an empty file', async () => {
    const sarooArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_FILENAME_EMPTY);

    const segaSaturnSaveData = SarooSegaSaturnSaveData.createFromSarooData(sarooArrayBuffer);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(0);
  });

  it('should extract saves from a Saroo file containing 4 saves all for different games, 2 of which are empty', async () => {
    // One save is empty by having a blank slot for that game ID
    // The other save is empty by having 0 as the first save block number
    const sarooArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_FILENAME_2_GAMES);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_FILENAME_2_GAMES_FILE_1);
    const file2ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_FILENAME_2_GAMES_FILE_2);

    const segaSaturnSaveData = SarooSegaSaturnSaveData.createFromSarooData(sarooArrayBuffer);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(2);

    expect(segaSaturnSaveData.getSaveFiles()[0].name).to.equal('HYPERDUEL_0');
    expect(segaSaturnSaveData.getSaveFiles()[0].language).to.equal('Japanese');
    expect(segaSaturnSaveData.getSaveFiles()[0].comment).to.equal('ﾊｲﾊﾟｰﾃﾞｭｴﾙ'); // "Hyper Duel"
    expect(segaSaturnSaveData.getSaveFiles()[0].date.toUTCString()).to.equal('Thu, 01 Jun 2000 01:00:00 GMT');
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getSaveFiles()[0].blockList, [2, 3, 4])).to.equal(true);
    expect(segaSaturnSaveData.getSaveFiles()[0].saveSize).to.equal(260);
    expect(segaSaturnSaveData.getSaveFiles()[0].saveSize).to.equal(file1ArrayBuffer.byteLength);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getSaveFiles()[0].rawData, file1ArrayBuffer)).to.equal(true);

    expect(segaSaturnSaveData.getSaveFiles()[1].name).to.equal('CAP_DAD_002');
    expect(segaSaturnSaveData.getSaveFiles()[1].language).to.equal('Japanese');
    expect(segaSaturnSaveData.getSaveFiles()[1].comment).to.equal('D&Dｺﾚｸｼｮﾝ2'); // "D&D Collection 2"
    expect(segaSaturnSaveData.getSaveFiles()[1].date.toUTCString()).to.equal('Sun, 01 Dec 2024 21:31:00 GMT');
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getSaveFiles()[1].blockList, [2, 3, 4, 5])).to.equal(true);
    expect(segaSaturnSaveData.getSaveFiles()[1].saveSize).to.equal(416);
    expect(segaSaturnSaveData.getSaveFiles()[1].saveSize).to.equal(file2ArrayBuffer.byteLength);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getSaveFiles()[1].rawData, file2ArrayBuffer)).to.equal(true);
  });

  it('should extract saves from a Saroo file containing 2 saves, both from the same game', async () => {
    const sarooArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_1_GAME_2_SAVES);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_1_GAME_2_SAVES_FILE_1);
    const file2ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_1_GAME_2_SAVES_FILE_2);

    const segaSaturnSaveData = SarooSegaSaturnSaveData.createFromSarooData(sarooArrayBuffer);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(2);

    expect(segaSaturnSaveData.getSaveFiles()[0].name).to.equal('SFORCE31_01');
    expect(segaSaturnSaveData.getSaveFiles()[0].language).to.equal('Japanese');
    expect(segaSaturnSaveData.getSaveFiles()[0].comment).to.equal('Euan-1A   ');
    expect(segaSaturnSaveData.getSaveFiles()[0].date.toUTCString()).to.equal('Wed, 11 Dec 2024 14:25:00 GMT');
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getSaveFiles()[0].blockList, ArrayUtil.createSequentialArray(2, 101))).to.equal(true);
    expect(segaSaturnSaveData.getSaveFiles()[0].saveSize).to.equal(12904);
    expect(segaSaturnSaveData.getSaveFiles()[0].saveSize).to.equal(file1ArrayBuffer.byteLength);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getSaveFiles()[0].rawData, file1ArrayBuffer)).to.equal(true);

    expect(segaSaturnSaveData.getSaveFiles()[1].name).to.equal('SFORCE31_02');
    expect(segaSaturnSaveData.getSaveFiles()[1].language).to.equal('Japanese');
    expect(segaSaturnSaveData.getSaveFiles()[1].comment).to.equal('Euan-1A   ');
    expect(segaSaturnSaveData.getSaveFiles()[1].date.toUTCString()).to.equal('Wed, 11 Dec 2024 14:26:00 GMT');
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getSaveFiles()[1].blockList, ArrayUtil.createSequentialArray(104, 101))).to.equal(true);
    expect(segaSaturnSaveData.getSaveFiles()[1].saveSize).to.equal(12904);
    expect(segaSaturnSaveData.getSaveFiles()[1].saveSize).to.equal(file2ArrayBuffer.byteLength);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getSaveFiles()[1].rawData, file2ArrayBuffer)).to.equal(true);
  });
});
