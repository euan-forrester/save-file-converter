import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';
import ArrayUtil from '#/util/Array';

import SegaSaturnSaveData from '@/save-formats/SegaSaturn/SegaSaturn';

const DIR = './tests/data/save-formats/segasaturn';

const INTERNAL_MEMORY_1_FILE_FILENAME = `${DIR}/Hyper Duel (Japan).bkr`;
const INTERNAL_MEMORY_1_FILE_FILENAME_FILE_1 = `${DIR}/Hyper Duel (Japan)-1.BUP`;

const CARTRIDGE_MEMORY_1_FILE_FILENAME = `${DIR}/Daytona USA - Championship Circuit Edition (USA).bcr`;
const CARTRIDGE_MEMORY_1_FILE_FILENAME_FILE_1 = `${DIR}/Daytona USA - Championship Circuit Edition (USA)-1.BUP`;
const CARTRIDGE_MEMORY_1_FILE_FILENAME_FILE_2 = `${DIR}/Daytona USA - Championship Circuit Edition (USA)-2.BUP`;

describe('Sega Saturn', () => {
  it('should extract a save from an internal memory file containing 1 save', async () => {
    const segaSaturnArrayBuffer = await ArrayBufferUtil.readArrayBuffer(INTERNAL_MEMORY_1_FILE_FILENAME);
    // const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(INTERNAL_MEMORY_1_FILE_FILENAME_FILE_1);

    const segaSaturnSaveData = SegaSaturnSaveData.createFromSegaSaturnData(segaSaturnArrayBuffer);

    expect(segaSaturnSaveData.getBlockSize()).to.equal(0x40);
    expect(segaSaturnSaveData.getTotalBytes()).to.equal(32768);
    expect(segaSaturnSaveData.getTotalBlocks()).to.equal(512);
    expect(segaSaturnSaveData.getFreeBlocks()).to.equal(505);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(1);

    expect(segaSaturnSaveData.getSaveFiles()[0].name).to.equal('HYPERDUEL_0');
    expect(segaSaturnSaveData.getSaveFiles()[0].language).to.equal('Japanese');
    expect(segaSaturnSaveData.getSaveFiles()[0].comment).to.equal('ﾊｲﾊﾟｰﾃﾞｭｴﾙ'); // "Hyper Duel"
    expect(segaSaturnSaveData.getSaveFiles()[0].date.toUTCString()).to.equal('Wed, 31 May 2000 01:00:00 GMT');
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getSaveFiles()[0].blockList, ArrayUtil.createSequentialArray(3, 6))).to.equal(true);
    expect(segaSaturnSaveData.getSaveFiles()[0].saveSize).to.equal(260);

    ArrayBufferUtil.writeArrayBuffer(INTERNAL_MEMORY_1_FILE_FILENAME_FILE_1, segaSaturnSaveData.getSaveFiles()[0].saveData);

    // expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getSaveFiles()[0].fileData, file1ArrayBuffer)).to.equal(true);
  });

  it('should extract saves from a cartridge memory file containing 2 saves', async () => {
    const segaSaturnArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CARTRIDGE_MEMORY_1_FILE_FILENAME);
    // const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CARTRIDGE_MEMORY_1_FILE_FILENAME_FILE_1);
    // const file2ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CARTRIDGE_MEMORY_1_FILE_FILENAME_FILE_2);

    const segaSaturnSaveData = SegaSaturnSaveData.createFromSegaSaturnData(segaSaturnArrayBuffer);

    expect(segaSaturnSaveData.getBlockSize()).to.equal(0x200);
    expect(segaSaturnSaveData.getTotalBytes()).to.equal(524288);
    expect(segaSaturnSaveData.getTotalBlocks()).to.equal(1024);
    expect(segaSaturnSaveData.getFreeBlocks()).to.equal(890);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(2);

    expect(segaSaturnSaveData.getSaveFiles()[0].name).to.equal('DAYTONA96_0');
    expect(segaSaturnSaveData.getSaveFiles()[0].language).to.equal('English');
    expect(segaSaturnSaveData.getSaveFiles()[0].comment).to.equal('RECORDS');
    expect(segaSaturnSaveData.getSaveFiles()[0].date.toUTCString()).to.equal('Mon, 28 Oct 2024 13:27:00 GMT');
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getSaveFiles()[0].blockList, ArrayUtil.createSequentialArray(3, 10))).to.equal(true);
    expect(segaSaturnSaveData.getSaveFiles()[0].saveSize).to.equal(4033);

    ArrayBufferUtil.writeArrayBuffer(CARTRIDGE_MEMORY_1_FILE_FILENAME_FILE_1, segaSaturnSaveData.getSaveFiles()[0].saveData);

    // expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getSaveFiles()[0].fileData, file1ArrayBuffer)).to.equal(true);

    expect(segaSaturnSaveData.getSaveFiles()[1].name).to.equal('DAYTONA96_1');
    expect(segaSaturnSaveData.getSaveFiles()[1].language).to.equal('English');
    expect(segaSaturnSaveData.getSaveFiles()[1].comment).to.equal('GHOST');
    expect(segaSaturnSaveData.getSaveFiles()[1].date.toUTCString()).to.equal('Mon, 28 Oct 2024 13:27:00 GMT');
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getSaveFiles()[1].blockList, ArrayUtil.createSequentialArray(12, 133))).to.equal(true);
    expect(segaSaturnSaveData.getSaveFiles()[1].saveSize).to.equal(61713);

    ArrayBufferUtil.writeArrayBuffer(CARTRIDGE_MEMORY_1_FILE_FILENAME_FILE_2, segaSaturnSaveData.getSaveFiles()[1].saveData);

    // expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getSaveFiles()[0].fileData, file1ArrayBuffer)).to.equal(true);
  });
});
