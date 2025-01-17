import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import SarooSegaSaturnSystemSaveData from '@/save-formats/SegaSaturn/Saroo/System';

const DIR = './tests/data/save-formats/segasaturn/saroo';

const SAROO_FILENAME_EMPTY = `${DIR}/SS_BUP_empty.BIN`; // I've only ever seen an empty file here. Not a strong need to test others though because it's essentially just a regular Saturn save and we have more robust testing for that class

describe('Sega Saturn - Saroo system', () => {
  it('should parse an empty file', async () => {
    const sarooArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_FILENAME_EMPTY);

    const segaSaturnSaveData = SarooSegaSaturnSystemSaveData.createFromSarooData(sarooArrayBuffer);

    expect(segaSaturnSaveData.getVolumeInfo().blockSize).to.equal(0x40);
    expect(segaSaturnSaveData.getVolumeInfo().totalBytes).to.equal(32768);
    expect(segaSaturnSaveData.getVolumeInfo().totalBlocks).to.equal(510);
    expect(segaSaturnSaveData.getVolumeInfo().usedBlocks).to.equal(0);
    expect(segaSaturnSaveData.getVolumeInfo().freeBlocks).to.equal(510); // A real saturn will report 461 blocks free when the internal memory is empty. This is because it's estimating the amount of space that the various file headers will take: https://www.reddit.com/r/SegaSaturn/comments/y1rsaf/comment/ismy6wt/

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(0);
  });

  it('should create an empty file', async () => {
    const sarooArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SAROO_FILENAME_EMPTY);

    const segaSaturnSaveData = SarooSegaSaturnSystemSaveData.createFromSaveFiles([]);

    expect(segaSaturnSaveData.getVolumeInfo().blockSize).to.equal(0x40);
    expect(segaSaturnSaveData.getVolumeInfo().totalBytes).to.equal(32768);
    expect(segaSaturnSaveData.getVolumeInfo().totalBlocks).to.equal(510);
    expect(segaSaturnSaveData.getVolumeInfo().usedBlocks).to.equal(0);
    expect(segaSaturnSaveData.getVolumeInfo().freeBlocks).to.equal(510); // A real saturn will report 461 blocks free when the internal memory is empty. This is because it's estimating the amount of space that the various file headers will take: https://www.reddit.com/r/SegaSaturn/comments/y1rsaf/comment/ismy6wt/

    expect(segaSaturnSaveData.getSaveFiles().length).to.equal(0);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveData.getArrayBuffer(), sarooArrayBuffer)).to.equal(true);
  });
});
