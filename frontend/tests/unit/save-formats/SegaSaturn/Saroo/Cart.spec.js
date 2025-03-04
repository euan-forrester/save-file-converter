import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import SarooSegaSaturnCartSaveData from '@/save-formats/SegaSaturn/Saroo/Cart';
import ArrayUtil from '@/util/Array';
import SegaSaturnUtil from '@/save-formats/SegaSaturn/Util';

const DIR = './tests/data/save-formats/segasaturn/saroo';

const SAROO_FILENAME_EMPTY = `${DIR}/SS_MEMS_empty.BIN`; // This empty file was generated by a Saroo, and it contains a bunch of uninitialized memory that obviously we can't duplicate when we create an empty file
const SAROO_FILENAME_EMPTY_RECREATED = `${DIR}/SS_MEMS_empty-recreated.BIN`;

const SAROO_1_GAME_2_SAVES = `${DIR}/SS_MEMS_1_game_2_extend_saves.BIN`;
const SAROO_1_GAME_2_SAVES_RECREATED = `${DIR}/SS_MEMS_1_game_2_extend_saves-recreated.BIN`; // Again, the Saroo file has a bunch of uninitialized memory in it
const SAROO_1_GAME_2_SAVES_FILE_1 = `${DIR}/Daytona USA - Championship Circuit Edition (USA) 1-1.raw`;
const SAROO_1_GAME_2_SAVES_FILE_2 = `${DIR}/Daytona USA - Championship Circuit Edition (USA) 1-2.raw`;

const SAROO_2_GAMES_3_SAVES = `${DIR}/SS_MEMS_2_games_3_extend_saves.BIN`;
const SAROO_2_GAMES_3_SAVES_RECREATED = `${DIR}/SS_MEMS_2_games_3_extend_saves-recreated.BIN`; // Again, the Saroo file has a bunch of uninitialized memory in it
const SAROO_2_GAMES_3_SAVES_FILE_1 = `${DIR}/Blast Wind (Japan).raw`;
const SAROO_2_GAMES_3_SAVES_FILE_2 = `${DIR}/Daytona USA - Championship Circuit Edition (USA) 2-1.raw`;
const SAROO_2_GAMES_3_SAVES_FILE_3 = `${DIR}/Daytona USA - Championship Circuit Edition (USA) 2-2.raw`;

describe('Sega Saturn - Saroo cart', () => {
  it('should parse an empty file', async () => {
    const sarooArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_FILENAME_EMPTY);

    const segaSaturnSaveData = SarooSegaSaturnCartSaveData.createFromSarooData(sarooArrayBuffer);

    expect(segaSaturnSaveData.getVolumeInfo().totalSize).to.equal(8388608);
    expect(segaSaturnSaveData.getVolumeInfo().numFreeBlocks).to.equal(8056);
    expect(segaSaturnSaveData.getVolumeInfo().numUsedBlocks).to.equal(8); // Header block + 7 directory blocks
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getVolumeInfo().usedBlocks, ArrayUtil.createSequentialArray(0, 8))).to.equal(true);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(0);
  });

  it('should create an empty file', async () => {
    const sarooArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_FILENAME_EMPTY_RECREATED);

    const segaSaturnSaveData = SarooSegaSaturnCartSaveData.createFromSaveFiles([]);

    expect(segaSaturnSaveData.getVolumeInfo().totalSize).to.equal(8388608);
    expect(segaSaturnSaveData.getVolumeInfo().numFreeBlocks).to.equal(8056);
    expect(segaSaturnSaveData.getVolumeInfo().numUsedBlocks).to.equal(8); // Header block + 7 directory blocks
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getVolumeInfo().usedBlocks, ArrayUtil.createSequentialArray(0, 8))).to.equal(true);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(0);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getArrayBuffer(), sarooArrayBuffer)).to.equal(true);
  });

  it('should extract saves from a Saroo cart file containing 2 saves, both from the same game', async () => {
    const sarooArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_1_GAME_2_SAVES);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_1_GAME_2_SAVES_FILE_1);
    const file2ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_1_GAME_2_SAVES_FILE_2);

    const segaSaturnSaveData = SarooSegaSaturnCartSaveData.createFromSarooData(sarooArrayBuffer);

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

  it('should create a Saroo cart save file containing 2 saves, both from the same game', async () => {
    const sarooArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_1_GAME_2_SAVES_RECREATED);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_1_GAME_2_SAVES_FILE_1);
    const file2ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_1_GAME_2_SAVES_FILE_2);

    const gameSaveFiles = [
      {
        name: 'DAYTONA96_0',
        languageCode: SegaSaturnUtil.getLanguageCode('English'),
        comment: 'RECORDS',
        dateCode: SegaSaturnUtil.getDateCode(new Date('Wed, 11 Dec 2024 13:07:00 GMT')),
        saveSize: file1ArrayBuffer.byteLength,
        rawData: file1ArrayBuffer,
      },
      {
        name: 'DAYTONA96_1',
        languageCode: SegaSaturnUtil.getLanguageCode('English'),
        comment: 'GHOST',
        dateCode: SegaSaturnUtil.getDateCode(new Date('Wed, 11 Dec 2024 13:07:00 GMT')),
        saveSize: file2ArrayBuffer.byteLength,
        rawData: file2ArrayBuffer,
      },
    ];

    const segaSaturnSaveData = SarooSegaSaturnCartSaveData.createFromSaveFiles(gameSaveFiles);

    expect(segaSaturnSaveData.getVolumeInfo().totalSize).to.equal(8388608);
    expect(segaSaturnSaveData.getVolumeInfo().numFreeBlocks).to.equal(7989);
    expect(segaSaturnSaveData.getVolumeInfo().numUsedBlocks).to.equal(75); // Header block + 7 directory blocks + 2 archive entry blocks + 4 data blocks (save 0) + 61 data blocks (save 1)
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getVolumeInfo().usedBlocks, ArrayUtil.createSequentialArray(0, 75))).to.equal(true);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(2);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getArrayBuffer(), sarooArrayBuffer)).to.equal(true);
  });

  it('should extract saves from a Saroo extend file containing 3 saves, from 2 different games where one fits in the archive block', async () => {
    const sarooArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_2_GAMES_3_SAVES);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_2_GAMES_3_SAVES_FILE_1);
    const file2ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_2_GAMES_3_SAVES_FILE_2);
    const file3ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_2_GAMES_3_SAVES_FILE_3);

    const segaSaturnSaveData = SarooSegaSaturnCartSaveData.createFromSarooData(sarooArrayBuffer);

    expect(segaSaturnSaveData.getVolumeInfo().totalSize).to.equal(8388608);
    expect(segaSaturnSaveData.getVolumeInfo().numFreeBlocks).to.equal(7988);
    expect(segaSaturnSaveData.getVolumeInfo().numUsedBlocks).to.equal(76); // Header block + 7 directory blocks + 3 archive entry blocks + 4 data blocks (save 1) + 61 data blocks (save 2)
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getVolumeInfo().usedBlocks, ArrayUtil.createSequentialArray(0, 76))).to.equal(true);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(3);

    expect(segaSaturnSaveData.getSaveFiles()[0].name).to.equal('BLASTWIND_0');
    expect(segaSaturnSaveData.getSaveFiles()[0].language).to.equal('Japanese');
    expect(segaSaturnSaveData.getSaveFiles()[0].comment).to.equal('ﾌﾞﾗｽﾄｳｲﾝﾄﾞ'); // "Blast Wind"
    expect(segaSaturnSaveData.getSaveFiles()[0].date.toUTCString()).to.equal('Sun, 01 Dec 2024 21:55:00 GMT');
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getSaveFiles()[0].blockList, [])).to.equal(true);
    expect(segaSaturnSaveData.getSaveFiles()[0].saveSize).to.equal(268);
    expect(segaSaturnSaveData.getSaveFiles()[0].saveSize).to.equal(file1ArrayBuffer.byteLength);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getSaveFiles()[0].rawData, file1ArrayBuffer)).to.equal(true);

    expect(segaSaturnSaveData.getSaveFiles()[1].name).to.equal('DAYTONA96_0');
    expect(segaSaturnSaveData.getSaveFiles()[1].language).to.equal('English');
    expect(segaSaturnSaveData.getSaveFiles()[1].comment).to.equal('RECORDS');
    expect(segaSaturnSaveData.getSaveFiles()[1].date.toUTCString()).to.equal('Thu, 05 Dec 2024 12:23:00 GMT');
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getSaveFiles()[1].blockList, ArrayUtil.createSequentialArray(10, 4))).to.equal(true);
    expect(segaSaturnSaveData.getSaveFiles()[1].saveSize).to.equal(4033);
    expect(segaSaturnSaveData.getSaveFiles()[1].saveSize).to.equal(file2ArrayBuffer.byteLength);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getSaveFiles()[1].rawData, file2ArrayBuffer)).to.equal(true);

    expect(segaSaturnSaveData.getSaveFiles()[2].name).to.equal('DAYTONA96_1');
    expect(segaSaturnSaveData.getSaveFiles()[2].language).to.equal('English');
    expect(segaSaturnSaveData.getSaveFiles()[2].comment).to.equal('GHOST');
    expect(segaSaturnSaveData.getSaveFiles()[2].date.toUTCString()).to.equal('Thu, 05 Dec 2024 11:51:00 GMT');
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getSaveFiles()[2].blockList, ArrayUtil.createSequentialArray(15, 61))).to.equal(true);
    expect(segaSaturnSaveData.getSaveFiles()[2].saveSize).to.equal(61713);
    expect(segaSaturnSaveData.getSaveFiles()[2].saveSize).to.equal(file3ArrayBuffer.byteLength);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getSaveFiles()[2].rawData, file3ArrayBuffer)).to.equal(true);
  });

  it('should create a Saroo cart file containing 3 saves, from 2 different games where one fits in the archive block', async () => {
    const sarooArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_2_GAMES_3_SAVES_RECREATED);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_2_GAMES_3_SAVES_FILE_1);
    const file2ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_2_GAMES_3_SAVES_FILE_2);
    const file3ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_2_GAMES_3_SAVES_FILE_3);

    const gameSaveFiles = [
      {
        name: 'BLASTWIND_0',
        languageCode: SegaSaturnUtil.getLanguageCode('Japanese'),
        comment: 'ﾌﾞﾗｽﾄｳｲﾝﾄﾞ', // "Blast Wind"
        dateCode: SegaSaturnUtil.getDateCode(new Date('Sun, 01 Dec 2024 21:55:00 GMT')),
        saveSize: file1ArrayBuffer.byteLength,
        rawData: file1ArrayBuffer,
      },
      {
        name: 'DAYTONA96_0',
        languageCode: SegaSaturnUtil.getLanguageCode('English'),
        comment: 'RECORDS',
        dateCode: SegaSaturnUtil.getDateCode(new Date('Thu, 05 Dec 2024 12:23:00 GMT')),
        saveSize: file2ArrayBuffer.byteLength,
        rawData: file2ArrayBuffer,
      },
      {
        name: 'DAYTONA96_1',
        languageCode: SegaSaturnUtil.getLanguageCode('English'),
        comment: 'GHOST',
        dateCode: SegaSaturnUtil.getDateCode(new Date('Thu, 05 Dec 2024 11:51:00 GMT')),
        saveSize: file3ArrayBuffer.byteLength,
        rawData: file3ArrayBuffer,
      },
    ];

    const segaSaturnSaveData = SarooSegaSaturnCartSaveData.createFromSaveFiles(gameSaveFiles);

    expect(segaSaturnSaveData.getVolumeInfo().totalSize).to.equal(8388608);
    expect(segaSaturnSaveData.getVolumeInfo().numFreeBlocks).to.equal(7988);
    expect(segaSaturnSaveData.getVolumeInfo().numUsedBlocks).to.equal(76); // Header block + 7 directory blocks + 3 archive entry blocks + 4 data blocks (save 1) + 61 data blocks (save 2)
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getVolumeInfo().usedBlocks, ArrayUtil.createSequentialArray(0, 76))).to.equal(true);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(3);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getArrayBuffer(), sarooArrayBuffer)).to.equal(true);
  });

  it('should upsert a new save file', async () => {
    const existingSaveFiles = [
      {
        name: 'ExistingSaveFile1',
        languageCode: SegaSaturnUtil.getLanguageCode('English'),
        comment: 'Comment1',
        dateCode: SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 14:00:00 GMT')),
        saveSize: 1234,
        rawData: null,
      },
    ];

    const newSaveFiles = [
      {
        name: 'NewSaveFile1',
        languageCode: SegaSaturnUtil.getLanguageCode('English'),
        comment: 'Comment2',
        dateCode: SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 15:00:00 GMT')),
        saveSize: 2345,
        rawData: null,
      },
    ];

    const combinedSaveFiles = SarooSegaSaturnCartSaveData.upsertGameSaveFiles(existingSaveFiles, newSaveFiles);

    expect(combinedSaveFiles.length).to.equal(2);

    expect(combinedSaveFiles[0].name).to.equal('ExistingSaveFile1');
    expect(combinedSaveFiles[0].languageCode).to.equal(SegaSaturnUtil.getLanguageCode('English'));
    expect(combinedSaveFiles[0].comment).to.equal('Comment1');
    expect(combinedSaveFiles[0].dateCode).to.equal(SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 14:00:00 GMT')));
    expect(combinedSaveFiles[0].saveSize).to.equal(1234);
    expect(combinedSaveFiles[0].rawData).to.equal(null);

    expect(combinedSaveFiles[1].name).to.equal('NewSaveFile1');
    expect(combinedSaveFiles[1].languageCode).to.equal(SegaSaturnUtil.getLanguageCode('English'));
    expect(combinedSaveFiles[1].comment).to.equal('Comment2');
    expect(combinedSaveFiles[1].dateCode).to.equal(SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 15:00:00 GMT')));
    expect(combinedSaveFiles[1].saveSize).to.equal(2345);
    expect(combinedSaveFiles[1].rawData).to.equal(null);
  });

  it('should upsert an existing save file into an existing game', async () => {
    const existingSaveFiles = [
      {
        name: 'ExistingSaveFile1',
        languageCode: SegaSaturnUtil.getLanguageCode('English'),
        comment: 'Comment1',
        dateCode: SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 14:00:00 GMT')),
        saveSize: 1234,
        rawData: null,
      },
    ];

    const newSaveFiles = [
      {
        name: 'ExistingSaveFile1',
        languageCode: SegaSaturnUtil.getLanguageCode('English'),
        comment: 'NewComment2',
        dateCode: SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 15:00:00 GMT')),
        saveSize: 2345,
        rawData: null,
      },
    ];

    const combinedSaveFiles = SarooSegaSaturnCartSaveData.upsertGameSaveFiles(existingSaveFiles, newSaveFiles);

    expect(combinedSaveFiles.length).to.equal(1);

    expect(combinedSaveFiles[0].name).to.equal('ExistingSaveFile1');
    expect(combinedSaveFiles[0].languageCode).to.equal(SegaSaturnUtil.getLanguageCode('English'));
    expect(combinedSaveFiles[0].comment).to.equal('NewComment2');
    expect(combinedSaveFiles[0].dateCode).to.equal(SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 15:00:00 GMT')));
    expect(combinedSaveFiles[0].saveSize).to.equal(2345);
    expect(combinedSaveFiles[0].rawData).to.equal(null);
  });

  it('should upsert a new save file into an existing game and a new save file into an existing save file', async () => {
    const existingSaveFiles = [
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
    ];

    const newSaveFiles = [
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
    ];

    const combinedSaveFiles = SarooSegaSaturnCartSaveData.upsertGameSaveFiles(existingSaveFiles, newSaveFiles);

    expect(combinedSaveFiles.length).to.equal(3);

    expect(combinedSaveFiles[0].name).to.equal('ExistingSaveFile1');
    expect(combinedSaveFiles[0].languageCode).to.equal(SegaSaturnUtil.getLanguageCode('English'));
    expect(combinedSaveFiles[0].comment).to.equal('Comment1');
    expect(combinedSaveFiles[0].dateCode).to.equal(SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 11:00:00 GMT')));
    expect(combinedSaveFiles[0].saveSize).to.equal(1234);
    expect(combinedSaveFiles[0].rawData).to.equal(null);

    expect(combinedSaveFiles[1].name).to.equal('ExistingSaveFile2');
    expect(combinedSaveFiles[1].languageCode).to.equal(SegaSaturnUtil.getLanguageCode('English'));
    expect(combinedSaveFiles[1].comment).to.equal('NewComment6');
    expect(combinedSaveFiles[1].dateCode).to.equal(SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 16:00:00 GMT')));
    expect(combinedSaveFiles[1].saveSize).to.equal(6789);
    expect(combinedSaveFiles[1].rawData).to.equal(null);

    expect(combinedSaveFiles[2].name).to.equal('NewSaveFile2');
    expect(combinedSaveFiles[2].languageCode).to.equal(SegaSaturnUtil.getLanguageCode('English'));
    expect(combinedSaveFiles[2].comment).to.equal('Comment5');
    expect(combinedSaveFiles[2].dateCode).to.equal(SegaSaturnUtil.getDateCode(new Date('Tue, 7 Jan 2025 15:00:00 GMT')));
    expect(combinedSaveFiles[2].saveSize).to.equal(5678);
    expect(combinedSaveFiles[2].rawData).to.equal(null);
  });
});
