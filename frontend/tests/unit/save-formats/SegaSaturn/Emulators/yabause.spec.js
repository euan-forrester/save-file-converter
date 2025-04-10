import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';
import ArrayUtil from '@/util/Array';

import YabauseSegaSaturnSaveData from '@/save-formats/SegaSaturn/Emulators/yabause';
import SegaSaturnUtil from '@/save-formats/SegaSaturn/Util';

const DIR = './tests/data/save-formats/segasaturn/yabause';

const INTERNAL_MEMORY_FILE_FILENAME = `${DIR}/Akumajou Dracula X - Gekka no Yasoukyoku (Japan) (2M).srm`;
const INTERNAL_MEMORY_FILE_FILENAME_FILE_1 = `${DIR}/Akumajou Dracula X - Gekka no Yasoukyoku (Japan) (2M).srm-1.raw`;

describe('Sega Saturn - yabause', () => {
  it('should extract a save from an internal memory file containing 1 save', async () => {
    const segaSaturnArrayBuffer = await ArrayBufferUtil.readArrayBuffer(INTERNAL_MEMORY_FILE_FILENAME);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(INTERNAL_MEMORY_FILE_FILENAME_FILE_1);

    const segaSaturnSaveData = YabauseSegaSaturnSaveData.createFromSegaSaturnData(segaSaturnArrayBuffer);

    expect(segaSaturnSaveData.getVolumeInfo().blockSize).to.equal(0x40);
    expect(segaSaturnSaveData.getVolumeInfo().totalBytes).to.equal(32768);
    expect(segaSaturnSaveData.getVolumeInfo().totalBlocks).to.equal(510);
    expect(segaSaturnSaveData.getVolumeInfo().usedBlocks).to.equal(77);
    expect(segaSaturnSaveData.getVolumeInfo().freeBlocks).to.equal(433);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(1);

    expect(segaSaturnSaveData.getSaveFiles()[0].name).to.equal('DRACULAX_01');
    expect(segaSaturnSaveData.getSaveFiles()[0].language).to.equal('Japanese');
    expect(segaSaturnSaveData.getSaveFiles()[0].comment).to.equal('ULTIMATE');
    expect(segaSaturnSaveData.getSaveFiles()[0].date.toUTCString()).to.equal('Sat, 05 Apr 2025 11:54:00 GMT');
    expect(ArrayUtil.arraysEqual(segaSaturnSaveData.getSaveFiles()[0].blockList, ArrayUtil.createSequentialArray(3, 76))).to.equal(true);
    expect(segaSaturnSaveData.getSaveFiles()[0].saveSize).to.equal(4388);
    expect(segaSaturnSaveData.getSaveFiles()[0].saveSize).to.equal(file1ArrayBuffer.byteLength);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getSaveFiles()[0].rawData, file1ArrayBuffer)).to.equal(true);
  });

  it('should create an internal memory file containing 1 save', async () => {
    const segaSaturnArrayBuffer = await ArrayBufferUtil.readArrayBuffer(INTERNAL_MEMORY_FILE_FILENAME);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(INTERNAL_MEMORY_FILE_FILENAME_FILE_1);

    const saveFiles = [
      {
        name: 'DRACULAX_01',
        languageCode: SegaSaturnUtil.getLanguageCode('Japanese'),
        comment: 'ULTIMATE',
        dateCode: SegaSaturnUtil.getDateCode(new Date('Sat, 05 Apr 2025 11:54:00 GMT')),
        saveSize: file1ArrayBuffer.byteLength,
        rawData: file1ArrayBuffer,
      },
    ];

    const segaSaturnSaveData = YabauseSegaSaturnSaveData.createFromSaveFiles(saveFiles, 0x40);

    expect(segaSaturnSaveData.getVolumeInfo().blockSize).to.equal(0x40);
    expect(segaSaturnSaveData.getVolumeInfo().totalBytes).to.equal(32768);
    expect(segaSaturnSaveData.getVolumeInfo().totalBlocks).to.equal(510);
    expect(segaSaturnSaveData.getVolumeInfo().usedBlocks).to.equal(77);
    expect(segaSaturnSaveData.getVolumeInfo().freeBlocks).to.equal(433);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(1);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getArrayBuffer(), segaSaturnArrayBuffer)).to.equal(true);
  });
});
