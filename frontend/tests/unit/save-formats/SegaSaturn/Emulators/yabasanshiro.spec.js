import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import YabaSanshiroSegaSaturnSaveData from '@/save-formats/SegaSaturn/Emulators/yabasanshiro';

const DIR = './tests/data/save-formats/segasaturn/yabasanshiro';

const INTERNAL_MEMORY_FILE_FILENAME = `${DIR}/backup.bin`;
const EMPTY_INTERNAL_MEMORY_FILE_FILENAME = `${DIR}/empty-backup.bin`;

describe('Sega Saturn - yaba sanshiro', () => {
  it('should parse an internal memory file containing 25 save', async () => {
    const segaSaturnArrayBuffer = await ArrayBufferUtil.readArrayBuffer(INTERNAL_MEMORY_FILE_FILENAME);

    const segaSaturnSaveData = YabaSanshiroSegaSaturnSaveData.createFromSegaSaturnData(segaSaturnArrayBuffer);

    expect(segaSaturnSaveData.getVolumeInfo().blockSize).to.equal(0x40);
    expect(segaSaturnSaveData.getVolumeInfo().totalBytes).to.equal(4194304);
    expect(segaSaturnSaveData.getVolumeInfo().totalBlocks).to.equal(65534);
    expect(segaSaturnSaveData.getVolumeInfo().usedBlocks).to.equal(877);
    expect(segaSaturnSaveData.getVolumeInfo().freeBlocks).to.equal(64657);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(25);

    // Ugh, 25 saves in our example file. It seems to parse fine: I can't be bothered to list them all out in this test
  });

  it('should create an empty internal memory file', async () => {
    // const segaSaturnArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMPTY_INTERNAL_MEMORY_FILE_FILENAME);

    const segaSaturnSaveData = YabaSanshiroSegaSaturnSaveData.createFromSaveFiles([]);

    expect(segaSaturnSaveData.getVolumeInfo().blockSize).to.equal(0x40);
    expect(segaSaturnSaveData.getVolumeInfo().totalBytes).to.equal(4194304);
    expect(segaSaturnSaveData.getVolumeInfo().totalBlocks).to.equal(65534);
    expect(segaSaturnSaveData.getVolumeInfo().usedBlocks).to.equal(0);
    expect(segaSaturnSaveData.getVolumeInfo().freeBlocks).to.equal(65534);

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(0);

    // expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getArrayBuffer(), segaSaturnArrayBuffer)).to.equal(true);

    ArrayBufferUtil.writeArrayBuffer(EMPTY_INTERNAL_MEMORY_FILE_FILENAME, segaSaturnSaveData.getArrayBuffer());
  });
});
