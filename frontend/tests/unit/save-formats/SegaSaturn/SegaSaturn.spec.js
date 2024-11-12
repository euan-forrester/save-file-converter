import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';
import ArrayUtil from '#/util/Array';

import SegaSaturnSaveData from '@/save-formats/SegaSaturn/SegaSaturn';
import SegaSaturnUtil from '@/save-formats/SegaSaturn/Util';

const DIR = './tests/data/save-formats/segasaturn';

const EMPTY_SAVE = `${DIR}/Empty save.bkr`;

const INTERNAL_MEMORY_FILE_FILENAME = `${DIR}/Hyper Duel (Japan).bkr`;
const INTERNAL_MEMORY_FILE_FILENAME_FILE_1 = `${DIR}/Hyper Duel (Japan)-1.raw`;

const CARTRIDGE_MEMORY_FILE_FILENAME = `${DIR}/Daytona USA - Championship Circuit Edition (USA).bcr`;
const CARTRIDGE_MEMORY_FILE_FILENAME_FILE_1 = `${DIR}/Daytona USA - Championship Circuit Edition (USA)-1.raw`;
const CARTRIDGE_MEMORY_FILE_FILENAME_FILE_2 = `${DIR}/Daytona USA - Championship Circuit Edition (USA)-2.raw`;

const INTERNAL_MEMORY_SMALL_FILE_FILENAME = `${DIR}/Dezaemon 2 (Japan).bkr`;
const INTERNAL_MEMORY_SMALL_FILE_FILENAME_FILE_1 = `${DIR}/Dezaemon 2 (Japan)-1.raw`;

const INTERNAL_MEMORY_LARGE_FILE_FILENAME = `${DIR}/Shining Force III Scenario 3 (English v25.1).bkr`;
const INTERNAL_MEMORY_LARGE_FILE_FILENAME_FILE_1 = `${DIR}/Shining Force III Scenario 3 (English v25.1)-1.raw`;

const CARTRIDGE_MEMORY_LARGE_FILE_FILENAME = `${DIR}/Shining Force III Scenario 3 (English v25.1).bcr`;
const CARTRIDGE_MEMORY_LARGE_FILE_FILENAME_FILE_1 = `${DIR}/Shining Force III Scenario 3 (English v25.1)-cart-1.raw`; // Virtually identical to INTERNAL_MEMORY_LARGE_FILE_FILENAME_FILE_1 but 3 bytes of game data are different

describe('Sega Saturn', () => {
  it('should correctly read an empty internal memory save file', async () => {
    const segaSaturnArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMPTY_SAVE);

    const segaSaturnSaveData = SegaSaturnSaveData.createFromSegaSaturnData(segaSaturnArrayBuffer);

    expect(segaSaturnSaveData.getVolumeInfo().blockSize).to.equal(0x40);
    expect(segaSaturnSaveData.getVolumeInfo().totalBytes).to.equal(32768);
    expect(segaSaturnSaveData.getVolumeInfo().totalBlocks).to.equal(510);
    expect(segaSaturnSaveData.getVolumeInfo().usedBlocks).to.equal(0);
    expect(segaSaturnSaveData.getVolumeInfo().freeBlocks).to.equal(510); // A real saturn will report 461 blocks free when the internal memory is empty. This is because it's estimating the amount of space that the various file headers will take: https://www.reddit.com/r/SegaSaturn/comments/y1rsaf/comment/ismy6wt/

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(0);
  });

  it('should correctly create an empty internal memory save file', async () => {
    const segaSaturnArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMPTY_SAVE);

    const segaSaturnSaveData = SegaSaturnSaveData.createFromSaveFiles([], 0x40);

    expect(segaSaturnSaveData.getVolumeInfo().blockSize).to.equal(0x40);
    expect(segaSaturnSaveData.getVolumeInfo().totalBytes).to.equal(32768);
    expect(segaSaturnSaveData.getVolumeInfo().totalBlocks).to.equal(510);
    expect(segaSaturnSaveData.getVolumeInfo().usedBlocks).to.equal(0);
    expect(segaSaturnSaveData.getVolumeInfo().freeBlocks).to.equal(510); // A real saturn will report 461 blocks free when the internal memory is empty. This is because it's estimating the amount of space that the various file headers will take: https://www.reddit.com/r/SegaSaturn/comments/y1rsaf/comment/ismy6wt/

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(0);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getArrayBuffer(), segaSaturnArrayBuffer)).to.equal(true);
  });

  it('should extract a save from an internal memory file containing 1 save', async () => {
    const segaSaturnArrayBuffer = await ArrayBufferUtil.readArrayBuffer(INTERNAL_MEMORY_FILE_FILENAME);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(INTERNAL_MEMORY_FILE_FILENAME_FILE_1);

    const segaSaturnSaveData = SegaSaturnSaveData.createFromSegaSaturnData(segaSaturnArrayBuffer);

    expect(segaSaturnSaveData.getVolumeInfo().blockSize).to.equal(0x40);
    expect(segaSaturnSaveData.getVolumeInfo().totalBytes).to.equal(32768);
    expect(segaSaturnSaveData.getVolumeInfo().totalBlocks).to.equal(510);
    expect(segaSaturnSaveData.getVolumeInfo().usedBlocks).to.equal(5);
    expect(segaSaturnSaveData.getVolumeInfo().freeBlocks).to.equal(505);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(1);

    expect(segaSaturnSaveData.getSaveFiles()[0].name).to.equal('HYPERDUEL_0');
    expect(segaSaturnSaveData.getSaveFiles()[0].language).to.equal('Japanese');
    expect(segaSaturnSaveData.getSaveFiles()[0].comment).to.equal('ﾊｲﾊﾟｰﾃﾞｭｴﾙ'); // "Hyper Duel"
    expect(segaSaturnSaveData.getSaveFiles()[0].date.toUTCString()).to.equal('Wed, 31 May 2000 01:00:00 GMT');
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getSaveFiles()[0].blockList, ArrayUtil.createSequentialArray(3, 4))).to.equal(true);
    expect(segaSaturnSaveData.getSaveFiles()[0].saveSize).to.equal(260);
    expect(segaSaturnSaveData.getSaveFiles()[0].saveSize).to.equal(file1ArrayBuffer.byteLength);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getSaveFiles()[0].rawData, file1ArrayBuffer)).to.equal(true);
  });

  it('should create an internal memory file containing 1 save', async () => {
    const segaSaturnArrayBuffer = await ArrayBufferUtil.readArrayBuffer(INTERNAL_MEMORY_FILE_FILENAME);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(INTERNAL_MEMORY_FILE_FILENAME_FILE_1);

    const saveFiles = [
      {
        name: 'HYPERDUEL_0',
        languageCode: SegaSaturnUtil.getLanguageCode('Japanese'),
        comment: 'ﾊｲﾊﾟｰﾃﾞｭｴﾙ', // "Hyper Duel"
        dateCode: SegaSaturnUtil.getDateCode(new Date('Wed, 31 May 2000 01:00:00 GMT')),
        saveSize: file1ArrayBuffer.byteLength,
        rawData: file1ArrayBuffer,
      },
    ];

    const segaSaturnSaveData = SegaSaturnSaveData.createFromSaveFiles(saveFiles, 0x40);

    expect(segaSaturnSaveData.getVolumeInfo().blockSize).to.equal(0x40);
    expect(segaSaturnSaveData.getVolumeInfo().totalBytes).to.equal(32768);
    expect(segaSaturnSaveData.getVolumeInfo().totalBlocks).to.equal(510);
    expect(segaSaturnSaveData.getVolumeInfo().usedBlocks).to.equal(5);
    expect(segaSaturnSaveData.getVolumeInfo().freeBlocks).to.equal(505);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(1);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getArrayBuffer(), segaSaturnArrayBuffer)).to.equal(true);
  });

  it('should extract saves from a cartridge memory file containing 2 saves', async () => {
    const segaSaturnArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CARTRIDGE_MEMORY_FILE_FILENAME);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CARTRIDGE_MEMORY_FILE_FILENAME_FILE_1);
    const file2ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CARTRIDGE_MEMORY_FILE_FILENAME_FILE_2);

    const segaSaturnSaveData = SegaSaturnSaveData.createFromSegaSaturnData(segaSaturnArrayBuffer);

    expect(segaSaturnSaveData.getVolumeInfo().blockSize).to.equal(0x200);
    expect(segaSaturnSaveData.getVolumeInfo().totalBytes).to.equal(524288);
    expect(segaSaturnSaveData.getVolumeInfo().totalBlocks).to.equal(1022);
    expect(segaSaturnSaveData.getVolumeInfo().usedBlocks).to.equal(132);
    expect(segaSaturnSaveData.getVolumeInfo().freeBlocks).to.equal(890);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(2);

    expect(segaSaturnSaveData.getSaveFiles()[0].name).to.equal('DAYTONA96_0');
    expect(segaSaturnSaveData.getSaveFiles()[0].language).to.equal('English');
    expect(segaSaturnSaveData.getSaveFiles()[0].comment).to.equal('RECORDS');
    expect(segaSaturnSaveData.getSaveFiles()[0].date.toUTCString()).to.equal('Mon, 28 Oct 2024 13:27:00 GMT');
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getSaveFiles()[0].blockList, ArrayUtil.createSequentialArray(3, 8))).to.equal(true);
    expect(segaSaturnSaveData.getSaveFiles()[0].saveSize).to.equal(4033);
    expect(segaSaturnSaveData.getSaveFiles()[0].saveSize).to.equal(file1ArrayBuffer.byteLength);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getSaveFiles()[0].rawData, file1ArrayBuffer)).to.equal(true);

    expect(segaSaturnSaveData.getSaveFiles()[1].name).to.equal('DAYTONA96_1');
    expect(segaSaturnSaveData.getSaveFiles()[1].language).to.equal('English');
    expect(segaSaturnSaveData.getSaveFiles()[1].comment).to.equal('GHOST');
    expect(segaSaturnSaveData.getSaveFiles()[1].date.toUTCString()).to.equal('Mon, 28 Oct 2024 13:27:00 GMT');
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getSaveFiles()[1].blockList, ArrayUtil.createSequentialArray(12, 122))).to.equal(true);
    expect(segaSaturnSaveData.getSaveFiles()[1].saveSize).to.equal(61713);
    expect(segaSaturnSaveData.getSaveFiles()[1].saveSize).to.equal(file2ArrayBuffer.byteLength);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getSaveFiles()[1].rawData, file2ArrayBuffer)).to.equal(true);
  });

  it('should extract a save from an internal memory file containing 1 save which fits in a single block', async () => {
    const segaSaturnArrayBuffer = await ArrayBufferUtil.readArrayBuffer(INTERNAL_MEMORY_SMALL_FILE_FILENAME);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(INTERNAL_MEMORY_SMALL_FILE_FILENAME_FILE_1);

    const segaSaturnSaveData = SegaSaturnSaveData.createFromSegaSaturnData(segaSaturnArrayBuffer);

    expect(segaSaturnSaveData.getVolumeInfo().blockSize).to.equal(0x40);
    expect(segaSaturnSaveData.getVolumeInfo().totalBytes).to.equal(32768);
    expect(segaSaturnSaveData.getVolumeInfo().totalBlocks).to.equal(510);
    expect(segaSaturnSaveData.getVolumeInfo().usedBlocks).to.equal(1);
    expect(segaSaturnSaveData.getVolumeInfo().freeBlocks).to.equal(509);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(1);

    expect(segaSaturnSaveData.getSaveFiles()[0].name).to.equal('DEZA2___SYS');
    expect(segaSaturnSaveData.getSaveFiles()[0].language).to.equal('Japanese');
    expect(segaSaturnSaveData.getSaveFiles()[0].comment).to.equal('ﾃﾞｻﾞ2_ｼｽﾃﾑ'); // "Deza 2_system"
    expect(segaSaturnSaveData.getSaveFiles()[0].date.toUTCString()).to.equal('Tue, 29 Oct 2024 12:27:00 GMT');
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getSaveFiles()[0].blockList, [])).to.equal(true);
    expect(segaSaturnSaveData.getSaveFiles()[0].saveSize).to.equal(17);
    expect(segaSaturnSaveData.getSaveFiles()[0].saveSize).to.equal(file1ArrayBuffer.byteLength);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getSaveFiles()[0].rawData, file1ArrayBuffer)).to.equal(true);
  });

  it('should extract a save from an internal memory file containing 1 save where the block list does not fit in the first block', async () => {
    const segaSaturnArrayBuffer = await ArrayBufferUtil.readArrayBuffer(INTERNAL_MEMORY_LARGE_FILE_FILENAME);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(INTERNAL_MEMORY_LARGE_FILE_FILENAME_FILE_1);

    const segaSaturnSaveData = SegaSaturnSaveData.createFromSegaSaturnData(segaSaturnArrayBuffer);

    expect(segaSaturnSaveData.getVolumeInfo().blockSize).to.equal(0x40);
    expect(segaSaturnSaveData.getVolumeInfo().totalBytes).to.equal(32768);
    expect(segaSaturnSaveData.getVolumeInfo().totalBlocks).to.equal(510);
    expect(segaSaturnSaveData.getVolumeInfo().usedBlocks).to.equal(435);
    expect(segaSaturnSaveData.getVolumeInfo().freeBlocks).to.equal(75);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(1);

    expect(segaSaturnSaveData.getSaveFiles()[0].name).to.equal('SFORCE33_01');
    expect(segaSaturnSaveData.getSaveFiles()[0].language).to.equal('Japanese');
    expect(segaSaturnSaveData.getSaveFiles()[0].comment).to.equal('Julian    ');
    expect(segaSaturnSaveData.getSaveFiles()[0].date.toUTCString()).to.equal('Tue, 29 Oct 2024 16:45:00 GMT');
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getSaveFiles()[0].blockList, ArrayUtil.createSequentialArray(3, 420))).to.equal(true);
    expect(segaSaturnSaveData.getSaveFiles()[0].saveSize).to.equal(24344);
    expect(segaSaturnSaveData.getSaveFiles()[0].saveSize).to.equal(file1ArrayBuffer.byteLength);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getSaveFiles()[0].rawData, file1ArrayBuffer)).to.equal(true);
  });

  it('should extract a save from a cartridge file containing 1 save which was the same as the one that did not fit in the first block of an internal memory save', async () => {
    const segaSaturnArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CARTRIDGE_MEMORY_LARGE_FILE_FILENAME);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CARTRIDGE_MEMORY_LARGE_FILE_FILENAME_FILE_1);

    const segaSaturnSaveData = SegaSaturnSaveData.createFromSegaSaturnData(segaSaturnArrayBuffer);

    expect(segaSaturnSaveData.getVolumeInfo().blockSize).to.equal(0x200);
    expect(segaSaturnSaveData.getVolumeInfo().totalBytes).to.equal(524288);
    expect(segaSaturnSaveData.getVolumeInfo().totalBlocks).to.equal(1022);
    expect(segaSaturnSaveData.getVolumeInfo().usedBlocks).to.equal(49); // This save used 49*512 bytes = 25,088 bytes. Above, the same data used 435*64 bytes = 27,840 bytes due to the smaller block size and thus need to store extra blocks containing the block list
    expect(segaSaturnSaveData.getVolumeInfo().freeBlocks).to.equal(973);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(1);

    expect(segaSaturnSaveData.getSaveFiles()[0].name).to.equal('SFORCE33_01');
    expect(segaSaturnSaveData.getSaveFiles()[0].language).to.equal('Japanese');
    expect(segaSaturnSaveData.getSaveFiles()[0].comment).to.equal('Julian    ');
    expect(segaSaturnSaveData.getSaveFiles()[0].date.toUTCString()).to.equal('Tue, 29 Oct 2024 16:45:00 GMT');
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getSaveFiles()[0].blockList, ArrayUtil.createSequentialArray(3, 48))).to.equal(true);
    expect(segaSaturnSaveData.getSaveFiles()[0].saveSize).to.equal(24344);
    expect(segaSaturnSaveData.getSaveFiles()[0].saveSize).to.equal(file1ArrayBuffer.byteLength);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getSaveFiles()[0].rawData, file1ArrayBuffer)).to.equal(true);
  });
});
