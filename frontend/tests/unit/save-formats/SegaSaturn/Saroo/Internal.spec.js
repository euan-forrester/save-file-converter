import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import SarooSegaSaturnInternalSaveData from '@/save-formats/SegaSaturn/Saroo/Internal';
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

const SAROO_HUGE_FILENAME = `${DIR}/SS_SAVE_huge.BIN`;

describe('Sega Saturn - Saroo internal', () => {
  it('should parse an empty file', async () => {
    const sarooArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_FILENAME_EMPTY);

    const segaSaturnSaveData = SarooSegaSaturnInternalSaveData.createFromSarooData(sarooArrayBuffer);

    expect(segaSaturnSaveData.getVolumeInfo().totalSlots).to.equal(1);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(0);
  });

  it('should create an empty file', async () => {
    const sarooArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_FILENAME_EMPTY);

    const segaSaturnSaveData = SarooSegaSaturnInternalSaveData.createFromSaveFiles([]);

    expect(segaSaturnSaveData.getVolumeInfo().totalSlots).to.equal(1);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(0);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getArrayBuffer(), sarooArrayBuffer)).to.equal(true);
  });

  it('should extract saves from a Saroo internal file containing 4 saves all for different games, 2 of which are empty', async () => {
    // One save is empty by having a blank slot for that game ID
    // The other save is empty by having 0 as the first save block number
    const sarooArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_FILENAME_2_GAMES);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_FILENAME_2_GAMES_FILE_1);
    const file2ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_FILENAME_2_GAMES_FILE_2);

    const segaSaturnSaveData = SarooSegaSaturnInternalSaveData.createFromSarooData(sarooArrayBuffer);

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

  it('should create a Saroo internal file containing saves for 4 different games, 2 of which are empty', async () => {
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

    const segaSaturnSaveData = SarooSegaSaturnInternalSaveData.createFromSaveFiles(gameSaveFiles);

    expect(segaSaturnSaveData.getVolumeInfo().totalSlots).to.equal(5);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(2);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getArrayBuffer(), sarooArrayBuffer)).to.equal(true);
  });

  it('should extract saves from a Saroo internal file containing 2 saves, both from the same game', async () => {
    const sarooArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_1_GAME_2_SAVES);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_1_GAME_2_SAVES_FILE_1);
    const file2ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_1_GAME_2_SAVES_FILE_2);

    const segaSaturnSaveData = SarooSegaSaturnInternalSaveData.createFromSarooData(sarooArrayBuffer);

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

  it('should create a Saroo internal file containing 2 saves, both from the same game', async () => {
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

    const segaSaturnSaveData = SarooSegaSaturnInternalSaveData.createFromSaveFiles(gameSaveFiles);

    expect(segaSaturnSaveData.getVolumeInfo().totalSlots).to.equal(2);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(2);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getArrayBuffer(), sarooArrayBuffer)).to.equal(true);
  });

  it('should parse a Saroo internal file with a comment that is too long', async () => {
    // It looks like the Saroo doesn't do sufficient error checking, and the game Nissan Presents: Over Drivin' GT-R
    // (or, more specifically, its fan translation?) has a comment that is too long. The comment field is
    // supposed to be 0xA bytes long but this one appears to be 0xF bytes long and so it stomps the next fields,
    // which are the language and date

    const sarooArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_HUGE_FILENAME);

    const segaSaturnSaveData = SarooSegaSaturnInternalSaveData.createFromSarooData(sarooArrayBuffer);

    expect(segaSaturnSaveData.getVolumeInfo().totalSlots).to.equal(159);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(75);

    // There's a ton of saves in this file, so let's just test the one with the issue

    expect(segaSaturnSaveData.getSaveFiles()[22].name).to.equal('GTR______00');
    expect(segaSaturnSaveData.getSaveFiles()[22].language).to.equal('Unknown');
    expect(segaSaturnSaveData.getSaveFiles()[22].languageCode).to.equal(68); // The 'D' in 'DATA'
    expect(segaSaturnSaveData.getSaveFiles()[22].comment).to.equal('OVERDRIVIN'); // In the file, this appears to be the string "OVERDRIVIN DATA"
    expect(segaSaturnSaveData.getSaveFiles()[22].date.toUTCString()).to.equal('Wed, 05 Dec 4063 08:04:00 GMT'); // Garbage date because it has been stomped
    expect(segaSaturnSaveData.getSaveFiles()[22].dateCode).to.equal(0x41544100); // The 'ATA' in 'DATA' followed by a null
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getSaveFiles()[22].blockList, ArrayUtil.createSequentialArray(2, 26))).to.equal(true);
    expect(segaSaturnSaveData.getSaveFiles()[22].saveSize).to.equal(3270);
  });

  it('should upsert a new game into existing save files', async () => {
    const existingGameSaveFiles = [
      {
        gameId: 'ExistingGameId1',
        saveFiles: [
          {
            name: 'ExistingSaveFile1',
            languageCode: SegaSaturnUtil.getLanguageCode('English'),
            comment: 'Comment1',
            dateCode: SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 14:00:00 GMT')),
            saveSize: 1234,
            rawData: null,
          },
        ],
      },
    ];

    const newGameSaveFiles = [
      {
        gameId: 'NewGameId1',
        saveFiles: [
          {
            name: 'NewSaveFile1',
            languageCode: SegaSaturnUtil.getLanguageCode('English'),
            comment: 'Comment2',
            dateCode: SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 15:00:00 GMT')),
            saveSize: 2345,
            rawData: null,
          },
        ],
      },
    ];

    const combinedGameSaveFiles = SarooSegaSaturnInternalSaveData.upsertGameSaveFiles(existingGameSaveFiles, newGameSaveFiles);

    expect(combinedGameSaveFiles.length).to.equal(2);

    expect(combinedGameSaveFiles[0].gameId).to.equal('ExistingGameId1');
    expect(combinedGameSaveFiles[0].saveFiles.length).to.equal(1);

    expect(combinedGameSaveFiles[0].saveFiles[0].name).to.equal('ExistingSaveFile1');
    expect(combinedGameSaveFiles[0].saveFiles[0].languageCode).to.equal(SegaSaturnUtil.getLanguageCode('English'));
    expect(combinedGameSaveFiles[0].saveFiles[0].comment).to.equal('Comment1');
    expect(combinedGameSaveFiles[0].saveFiles[0].dateCode).to.equal(SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 14:00:00 GMT')));
    expect(combinedGameSaveFiles[0].saveFiles[0].saveSize).to.equal(1234);
    expect(combinedGameSaveFiles[0].saveFiles[0].rawData).to.equal(null);

    expect(combinedGameSaveFiles[1].gameId).to.equal('NewGameId1');
    expect(combinedGameSaveFiles[1].saveFiles.length).to.equal(1);

    expect(combinedGameSaveFiles[1].saveFiles[0].name).to.equal('NewSaveFile1');
    expect(combinedGameSaveFiles[1].saveFiles[0].languageCode).to.equal(SegaSaturnUtil.getLanguageCode('English'));
    expect(combinedGameSaveFiles[1].saveFiles[0].comment).to.equal('Comment2');
    expect(combinedGameSaveFiles[1].saveFiles[0].dateCode).to.equal(SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 15:00:00 GMT')));
    expect(combinedGameSaveFiles[1].saveFiles[0].saveSize).to.equal(2345);
    expect(combinedGameSaveFiles[1].saveFiles[0].rawData).to.equal(null);
  });

  it('should upsert a new save file into an existing game', async () => {
    const existingGameSaveFiles = [
      {
        gameId: 'ExistingGameId1',
        saveFiles: [
          {
            name: 'ExistingSaveFile1',
            languageCode: SegaSaturnUtil.getLanguageCode('English'),
            comment: 'Comment1',
            dateCode: SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 14:00:00 GMT')),
            saveSize: 1234,
            rawData: null,
          },
        ],
      },
    ];

    const newGameSaveFiles = [
      {
        gameId: 'ExistingGameId1',
        saveFiles: [
          {
            name: 'NewSaveFile1',
            languageCode: SegaSaturnUtil.getLanguageCode('English'),
            comment: 'Comment2',
            dateCode: SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 15:00:00 GMT')),
            saveSize: 2345,
            rawData: null,
          },
        ],
      },
    ];

    const combinedGameSaveFiles = SarooSegaSaturnInternalSaveData.upsertGameSaveFiles(existingGameSaveFiles, newGameSaveFiles);

    expect(combinedGameSaveFiles.length).to.equal(1);

    expect(combinedGameSaveFiles[0].gameId).to.equal('ExistingGameId1');
    expect(combinedGameSaveFiles[0].saveFiles.length).to.equal(2);

    expect(combinedGameSaveFiles[0].saveFiles[0].name).to.equal('ExistingSaveFile1');
    expect(combinedGameSaveFiles[0].saveFiles[0].languageCode).to.equal(SegaSaturnUtil.getLanguageCode('English'));
    expect(combinedGameSaveFiles[0].saveFiles[0].comment).to.equal('Comment1');
    expect(combinedGameSaveFiles[0].saveFiles[0].dateCode).to.equal(SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 14:00:00 GMT')));
    expect(combinedGameSaveFiles[0].saveFiles[0].saveSize).to.equal(1234);
    expect(combinedGameSaveFiles[0].saveFiles[0].rawData).to.equal(null);

    expect(combinedGameSaveFiles[0].saveFiles[1].name).to.equal('NewSaveFile1');
    expect(combinedGameSaveFiles[0].saveFiles[1].languageCode).to.equal(SegaSaturnUtil.getLanguageCode('English'));
    expect(combinedGameSaveFiles[0].saveFiles[1].comment).to.equal('Comment2');
    expect(combinedGameSaveFiles[0].saveFiles[1].dateCode).to.equal(SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 15:00:00 GMT')));
    expect(combinedGameSaveFiles[0].saveFiles[1].saveSize).to.equal(2345);
    expect(combinedGameSaveFiles[0].saveFiles[1].rawData).to.equal(null);
  });

  it('should upsert an existing save file into an existing game', async () => {
    const existingGameSaveFiles = [
      {
        gameId: 'ExistingGameId1',
        saveFiles: [
          {
            name: 'ExistingSaveFile1',
            languageCode: SegaSaturnUtil.getLanguageCode('English'),
            comment: 'Comment1',
            dateCode: SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 14:00:00 GMT')),
            saveSize: 1234,
            rawData: null,
          },
        ],
      },
    ];

    const newGameSaveFiles = [
      {
        gameId: 'ExistingGameId1',
        saveFiles: [
          {
            name: 'ExistingSaveFile1',
            languageCode: SegaSaturnUtil.getLanguageCode('English'),
            comment: 'NewComment2',
            dateCode: SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 15:00:00 GMT')),
            saveSize: 2345,
            rawData: null,
          },
        ],
      },
    ];

    const combinedGameSaveFiles = SarooSegaSaturnInternalSaveData.upsertGameSaveFiles(existingGameSaveFiles, newGameSaveFiles);

    expect(combinedGameSaveFiles.length).to.equal(1);

    expect(combinedGameSaveFiles[0].gameId).to.equal('ExistingGameId1');
    expect(combinedGameSaveFiles[0].saveFiles.length).to.equal(1);

    expect(combinedGameSaveFiles[0].saveFiles[0].name).to.equal('ExistingSaveFile1');
    expect(combinedGameSaveFiles[0].saveFiles[0].languageCode).to.equal(SegaSaturnUtil.getLanguageCode('English'));
    expect(combinedGameSaveFiles[0].saveFiles[0].comment).to.equal('NewComment2');
    expect(combinedGameSaveFiles[0].saveFiles[0].dateCode).to.equal(SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 15:00:00 GMT')));
    expect(combinedGameSaveFiles[0].saveFiles[0].saveSize).to.equal(2345);
    expect(combinedGameSaveFiles[0].saveFiles[0].rawData).to.equal(null);
  });

  it('should upsert a new game, a new save file into an existing game, and a new save file into an existing save file', async () => {
    const existingGameSaveFiles = [
      {
        gameId: 'ExistingGameId1',
        saveFiles: [
          {
            name: 'ExistingSaveFile1',
            languageCode: SegaSaturnUtil.getLanguageCode('English'),
            comment: 'Comment1',
            dateCode: SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 11:00:00 GMT')),
            saveSize: 1234,
            rawData: null,
          },
          {
            name: 'ExistingSaveFile2',
            languageCode: SegaSaturnUtil.getLanguageCode('English'),
            comment: 'Comment2',
            dateCode: SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 12:00:00 GMT')),
            saveSize: 2345,
            rawData: null,
          },
        ],
      },
      {
        gameId: 'ExistingGameId2',
        saveFiles: [
          {
            name: 'ExistingSaveFile3',
            languageCode: SegaSaturnUtil.getLanguageCode('English'),
            comment: 'Comment3',
            dateCode: SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 13:00:00 GMT')),
            saveSize: 3456,
            rawData: null,
          },
        ],
      },
    ];

    const newGameSaveFiles = [
      {
        gameId: 'NewGameId1',
        saveFiles: [
          {
            name: 'NewSaveFile1',
            languageCode: SegaSaturnUtil.getLanguageCode('English'),
            comment: 'Comment4',
            dateCode: SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 14:00:00 GMT')),
            saveSize: 4567,
            rawData: null,
          },
        ],
      },
      {
        gameId: 'ExistingGameId1',
        saveFiles: [
          {
            name: 'NewSaveFile2',
            languageCode: SegaSaturnUtil.getLanguageCode('English'),
            comment: 'Comment5',
            dateCode: SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 15:00:00 GMT')),
            saveSize: 5678,
            rawData: null,
          },
          {
            name: 'ExistingSaveFile2',
            languageCode: SegaSaturnUtil.getLanguageCode('English'),
            comment: 'NewComment6',
            dateCode: SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 16:00:00 GMT')),
            saveSize: 6789,
            rawData: null,
          },
        ],
      },
      {
        gameId: 'ExistingGameId2',
        saveFiles: [
          {
            name: 'ExistingSaveFile3',
            languageCode: SegaSaturnUtil.getLanguageCode('English'),
            comment: 'NewComment7',
            dateCode: SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 17:00:00 GMT')),
            saveSize: 7890,
            rawData: null,
          },
        ],
      },
    ];

    const combinedGameSaveFiles = SarooSegaSaturnInternalSaveData.upsertGameSaveFiles(existingGameSaveFiles, newGameSaveFiles);

    expect(combinedGameSaveFiles.length).to.equal(3);

    expect(combinedGameSaveFiles[0].gameId).to.equal('ExistingGameId1');
    expect(combinedGameSaveFiles[0].saveFiles.length).to.equal(3);

    expect(combinedGameSaveFiles[0].saveFiles[0].name).to.equal('ExistingSaveFile1');
    expect(combinedGameSaveFiles[0].saveFiles[0].languageCode).to.equal(SegaSaturnUtil.getLanguageCode('English'));
    expect(combinedGameSaveFiles[0].saveFiles[0].comment).to.equal('Comment1');
    expect(combinedGameSaveFiles[0].saveFiles[0].dateCode).to.equal(SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 11:00:00 GMT')));
    expect(combinedGameSaveFiles[0].saveFiles[0].saveSize).to.equal(1234);
    expect(combinedGameSaveFiles[0].saveFiles[0].rawData).to.equal(null);

    expect(combinedGameSaveFiles[0].saveFiles[1].name).to.equal('ExistingSaveFile2');
    expect(combinedGameSaveFiles[0].saveFiles[1].languageCode).to.equal(SegaSaturnUtil.getLanguageCode('English'));
    expect(combinedGameSaveFiles[0].saveFiles[1].comment).to.equal('NewComment6');
    expect(combinedGameSaveFiles[0].saveFiles[1].dateCode).to.equal(SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 16:00:00 GMT')));
    expect(combinedGameSaveFiles[0].saveFiles[1].saveSize).to.equal(6789);
    expect(combinedGameSaveFiles[0].saveFiles[1].rawData).to.equal(null);

    expect(combinedGameSaveFiles[0].saveFiles[2].name).to.equal('NewSaveFile2');
    expect(combinedGameSaveFiles[0].saveFiles[2].languageCode).to.equal(SegaSaturnUtil.getLanguageCode('English'));
    expect(combinedGameSaveFiles[0].saveFiles[2].comment).to.equal('Comment5');
    expect(combinedGameSaveFiles[0].saveFiles[2].dateCode).to.equal(SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 15:00:00 GMT')));
    expect(combinedGameSaveFiles[0].saveFiles[2].saveSize).to.equal(5678);
    expect(combinedGameSaveFiles[0].saveFiles[2].rawData).to.equal(null);

    expect(combinedGameSaveFiles[1].gameId).to.equal('ExistingGameId2');
    expect(combinedGameSaveFiles[1].saveFiles.length).to.equal(1);

    expect(combinedGameSaveFiles[1].saveFiles[0].name).to.equal('ExistingSaveFile3');
    expect(combinedGameSaveFiles[1].saveFiles[0].languageCode).to.equal(SegaSaturnUtil.getLanguageCode('English'));
    expect(combinedGameSaveFiles[1].saveFiles[0].comment).to.equal('NewComment7');
    expect(combinedGameSaveFiles[1].saveFiles[0].dateCode).to.equal(SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 17:00:00 GMT')));
    expect(combinedGameSaveFiles[1].saveFiles[0].saveSize).to.equal(7890);
    expect(combinedGameSaveFiles[1].saveFiles[0].rawData).to.equal(null);

    expect(combinedGameSaveFiles[2].gameId).to.equal('NewGameId1');
    expect(combinedGameSaveFiles[2].saveFiles.length).to.equal(1);

    expect(combinedGameSaveFiles[2].saveFiles[0].name).to.equal('NewSaveFile1');
    expect(combinedGameSaveFiles[2].saveFiles[0].languageCode).to.equal(SegaSaturnUtil.getLanguageCode('English'));
    expect(combinedGameSaveFiles[2].saveFiles[0].comment).to.equal('Comment4');
    expect(combinedGameSaveFiles[2].saveFiles[0].dateCode).to.equal(SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 14:00:00 GMT')));
    expect(combinedGameSaveFiles[2].saveFiles[0].saveSize).to.equal(4567);
    expect(combinedGameSaveFiles[2].saveFiles[0].rawData).to.equal(null);
  });
});
