import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';
import ArrayUtil from '@/util/Array';

import MednafenSegaSaturnSaveData from '@/save-formats/SegaSaturn/Emulators/mednafen';
import SegaSaturnUtil from '@/save-formats/SegaSaturn/Util';

const DIR = './tests/data/save-formats/segasaturn';

const INTERNAL_MEMORY_FILE_FILENAME = `${DIR}/Hyper Duel (Japan).bkr`;
const INTERNAL_MEMORY_FILE_FILENAME_FILE_1 = `${DIR}/Hyper Duel (Japan)-1.raw`;

const CARTRIDGE_MEMORY_FILE_FILENAME = `${DIR}/Shining Force III Scenario 3 (English v25.1).bcr`;
const CARTRIDGE_MEMORY_FILE_FILENAME_RECREATED = `${DIR}/Shining Force III Scenario 3 (English v25.1)-recreated.bcr`; // This differs from the emulator-created file by 1 bit. Presumably something different in a compression header or something due to using different compression settings. The file still loads correctly in the emulator
const CARTRIDGE_MEMORY_FILE_FILENAME_FILE_1 = `${DIR}/Shining Force III Scenario 3 (English v25.1)-cart-1.raw`;

describe('Sega Saturn - mednafen', () => {
  it('should extract a save from an internal memory file containing 1 save', async () => {
    const segaSaturnArrayBuffer = await ArrayBufferUtil.readArrayBuffer(INTERNAL_MEMORY_FILE_FILENAME);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(INTERNAL_MEMORY_FILE_FILENAME_FILE_1);

    const segaSaturnSaveData = MednafenSegaSaturnSaveData.createFromSegaSaturnData(segaSaturnArrayBuffer);

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

    const segaSaturnSaveData = MednafenSegaSaturnSaveData.createFromSaveFiles(saveFiles, 0x40);

    expect(segaSaturnSaveData.getVolumeInfo().blockSize).to.equal(0x40);
    expect(segaSaturnSaveData.getVolumeInfo().totalBytes).to.equal(32768);
    expect(segaSaturnSaveData.getVolumeInfo().totalBlocks).to.equal(510);
    expect(segaSaturnSaveData.getVolumeInfo().usedBlocks).to.equal(5);
    expect(segaSaturnSaveData.getVolumeInfo().freeBlocks).to.equal(505);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(1);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getArrayBuffer(), segaSaturnArrayBuffer)).to.equal(true);
  });

  it('should extract a save from a cartridge file containing 1 save', async () => {
    const segaSaturnArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CARTRIDGE_MEMORY_FILE_FILENAME);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CARTRIDGE_MEMORY_FILE_FILENAME_FILE_1);

    const segaSaturnSaveData = MednafenSegaSaturnSaveData.createFromSegaSaturnData(segaSaturnArrayBuffer);

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

  it('should create a cartridge file containing 1 save', async () => {
    const segaSaturnArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CARTRIDGE_MEMORY_FILE_FILENAME_RECREATED);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CARTRIDGE_MEMORY_FILE_FILENAME_FILE_1);

    const saveFiles = [
      {
        name: 'SFORCE33_01',
        languageCode: SegaSaturnUtil.getLanguageCode('Japanese'),
        comment: 'Julian    ',
        dateCode: SegaSaturnUtil.getDateCode(new Date('Tue, 29 Oct 2024 16:45:00 GMT')),
        saveSize: file1ArrayBuffer.byteLength,
        rawData: file1ArrayBuffer,
      },
    ];

    const segaSaturnSaveData = MednafenSegaSaturnSaveData.createFromSaveFiles(saveFiles, 0x200);

    expect(segaSaturnSaveData.getVolumeInfo().blockSize).to.equal(0x200);
    expect(segaSaturnSaveData.getVolumeInfo().totalBytes).to.equal(524288);
    expect(segaSaturnSaveData.getVolumeInfo().totalBlocks).to.equal(1022);
    expect(segaSaturnSaveData.getVolumeInfo().usedBlocks).to.equal(49);
    expect(segaSaturnSaveData.getVolumeInfo().freeBlocks).to.equal(973);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(1);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getArrayBuffer(), segaSaturnArrayBuffer)).to.equal(true);
  });
});
