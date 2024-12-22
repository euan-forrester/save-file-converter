import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import SarooSegaSaturnSaveData from '@/save-formats/SegaSaturn/Saroo/Saroo';
import ArrayUtil from '@/util/Array';
import SegaSaturnUtil from '@/save-formats/SegaSaturn/Util';

const DIR = './tests/data/save-formats/segasaturn/saroo';

const SAROO_FILENAME_EMPTY = `${DIR}/SS_SAVE_empty.BIN`;

const SAROO_FILENAME_2_GAMES = `${DIR}/SS_SAVE_2_games.BIN`;
const SAROO_FILENAME_2_GAMES_RECREATED = `${DIR}/SS_SAVE_2_games-recreated.BIN`; // Because the original has 2 game with empty saves that are represented differently from each other so we can't know how to represent each
const SAROO_FILENAME_2_GAMES_FILE_1 = `${DIR}/Hyper Duel (Japan).raw`;
const SAROO_FILENAME_2_GAMES_FILE_2 = `${DIR}/Dungeons and Dragons Collection (Japan) (Disc 2) (Shadows over Mystara).raw`;

const SAROO_1_GAME_2_SAVES = `${DIR}/SS_SAVE_1_game_2_saves.BIN`;
const SAROO_1_GAME_2_SAVES_FILE_1 = `${DIR}/Shining Force III Scenario 1 (English v25.1)-1.raw`;
const SAROO_1_GAME_2_SAVES_FILE_2 = `${DIR}/Shining Force III Scenario 1 (English v25.1)-2.raw`;

describe('Sega Saturn - Saroo', () => {
  it('should parse an empty file', async () => {
    const sarooArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_FILENAME_EMPTY);

    const segaSaturnSaveData = SarooSegaSaturnSaveData.createFromSarooData(sarooArrayBuffer);

    expect(segaSaturnSaveData.getVolumeInfo().totalSlots).to.equal(1);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(0);
  });

  it('should create an empty file', async () => {
    const sarooArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_FILENAME_EMPTY);

    const segaSaturnSaveData = SarooSegaSaturnSaveData.createFromSaveFiles([]);

    expect(segaSaturnSaveData.getVolumeInfo().totalSlots).to.equal(1);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(0);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getArrayBuffer(), sarooArrayBuffer)).to.equal(true);
  });

  it('should extract saves from a Saroo file containing 4 saves all for different games, 2 of which are empty', async () => {
    // One save is empty by having a blank slot for that game ID
    // The other save is empty by having 0 as the first save block number
    const sarooArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_FILENAME_2_GAMES);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_FILENAME_2_GAMES_FILE_1);
    const file2ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_FILENAME_2_GAMES_FILE_2);

    const segaSaturnSaveData = SarooSegaSaturnSaveData.createFromSarooData(sarooArrayBuffer);

    expect(segaSaturnSaveData.getVolumeInfo().totalSlots).to.equal(5);

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

  it('should create a Saroo file containing saves for 4 different games, 2 of which are empty', async () => {
    const sarooArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_FILENAME_2_GAMES_RECREATED);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_FILENAME_2_GAMES_FILE_1);
    const file2ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_FILENAME_2_GAMES_FILE_2);

    const gameSaveFiles = [
      {
        gameId: 'T-1809G   V1.001', // Hyper Duel
        saveFiles: [
          {
            name: 'HYPERDUEL_0',
            languageCode: SegaSaturnUtil.getLanguageCode('Japanese'),
            comment: 'ﾊｲﾊﾟｰﾃﾞｭｴﾙ', // "Hyper Duel"
            dateCode: SegaSaturnUtil.getDateCode(new Date('Thu, 01 Jun 2000 01:00:00 GMT')),
            saveSize: file1ArrayBuffer.byteLength,
            rawData: file1ArrayBuffer,
          },
        ],
      },
      {
        gameId: 'T-1810G   V1.003', // Blast Wind
        saveFiles: [],
      },
      {
        gameId: 'T-1245G   V1.000', // Dungeons and Dragons Collection
        saveFiles: [
          {
            name: 'CAP_DAD_002',
            languageCode: SegaSaturnUtil.getLanguageCode('Japanese'),
            comment: 'D&Dｺﾚｸｼｮﾝ2', // "D&D Collection 2"
            dateCode: SegaSaturnUtil.getDateCode(new Date('Sun, 01 Dec 2024 21:31:00 GMT')),
            saveSize: file2ArrayBuffer.byteLength,
            rawData: file2ArrayBuffer,
          },
        ],
      },
      {
        gameId: 'T-2301H   V1.000', // Shinobi Legions
        saveFiles: [],
      },
    ];

    const segaSaturnSaveData = SarooSegaSaturnSaveData.createFromSaveFiles(gameSaveFiles);

    expect(segaSaturnSaveData.getVolumeInfo().totalSlots).to.equal(5);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(2);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getArrayBuffer(), sarooArrayBuffer)).to.equal(true);
  });

  it('should extract saves from a Saroo file containing 2 saves, both from the same game', async () => {
    const sarooArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_1_GAME_2_SAVES);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_1_GAME_2_SAVES_FILE_1);
    const file2ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_1_GAME_2_SAVES_FILE_2);

    const segaSaturnSaveData = SarooSegaSaturnSaveData.createFromSarooData(sarooArrayBuffer);

    expect(segaSaturnSaveData.getVolumeInfo().totalSlots).to.equal(2);

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

  it('should create a Saroo file containing 2 saves, both from the same game', async () => {
    const sarooArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_1_GAME_2_SAVES);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_1_GAME_2_SAVES_FILE_1);
    const file2ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_1_GAME_2_SAVES_FILE_2);

    const gameSaveFiles = [
      {
        gameId: 'SF3TRANS  V25.1 ', // Shining Force III Scenario 1, translated
        saveFiles: [
          {
            name: 'SFORCE31_01',
            languageCode: SegaSaturnUtil.getLanguageCode('Japanese'),
            comment: 'Euan-1A   ',
            dateCode: SegaSaturnUtil.getDateCode(new Date('Wed, 11 Dec 2024 14:25:00 GMT')),
            saveSize: file1ArrayBuffer.byteLength,
            rawData: file1ArrayBuffer,
          },
          {
            name: 'SFORCE31_02',
            languageCode: SegaSaturnUtil.getLanguageCode('Japanese'),
            comment: 'Euan-1A   ',
            dateCode: SegaSaturnUtil.getDateCode(new Date('Wed, 11 Dec 2024 14:26:00 GMT')),
            saveSize: file2ArrayBuffer.byteLength,
            rawData: file2ArrayBuffer,
          },
        ],
      },
    ];

    const segaSaturnSaveData = SarooSegaSaturnSaveData.createFromSaveFiles(gameSaveFiles);

    expect(segaSaturnSaveData.getVolumeInfo().totalSlots).to.equal(2);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(2);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getArrayBuffer(), sarooArrayBuffer)).to.equal(true);
  });
});
