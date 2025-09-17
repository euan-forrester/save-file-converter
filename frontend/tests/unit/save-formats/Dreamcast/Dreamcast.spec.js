/* eslint-disable no-bitwise */

import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import DreamcastBasics from '@/save-formats/Dreamcast/Components/Basics';
import DreamcastSaveData from '@/save-formats/Dreamcast/Dreamcast';
import DreamcastUtil from '@/save-formats/Dreamcast/Util';

const DIR = './tests/data/save-formats/dreamcast';

const DREAMCAST_FILENAME = `${DIR}/vmu_save_A1.bin`;

describe('Dreamcast', () => {
  it('should correctly read a Dreamcast VMU image', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(DREAMCAST_FILENAME);

    const dreamcastSaveData = DreamcastSaveData.createFromDreamcastData(arrayBuffer);

    expect(dreamcastSaveData.getVolumeInfo().useCustomColor).to.equal(true);
    expect(dreamcastSaveData.getVolumeInfo().customColor.blue).to.equal(255);
    expect(dreamcastSaveData.getVolumeInfo().customColor.green).to.equal(255);
    expect(dreamcastSaveData.getVolumeInfo().customColor.red).to.equal(255);
    expect(dreamcastSaveData.getVolumeInfo().customColor.alpha).to.equal(255);
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getVolumeInfo().timestamp)).to.equal('2024-10-12 19:56:48');
    expect(dreamcastSaveData.getVolumeInfo().largestBlockNumber).to.equal(DreamcastBasics.NUM_BLOCKS - 1);
    expect(dreamcastSaveData.getVolumeInfo().partitionNumber).to.equal(0);
    expect(dreamcastSaveData.getVolumeInfo().systemInfo.blockNumber).to.equal(DreamcastBasics.SYSTEM_INFO_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().systemInfo.sizeInBlocks).to.equal(DreamcastBasics.SYSTEM_INFO_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().fileAllocationTable.blockNumber).to.equal(DreamcastBasics.FILE_ALLOCATION_TABLE_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().fileAllocationTable.sizeInBlocks).to.equal(DreamcastBasics.FILE_ALLOCATION_TABLE_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().directory.blockNumber).to.equal(DreamcastBasics.DIRECTORY_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().directory.sizeInBlocks).to.equal(DreamcastBasics.DIRECTORY_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().iconShape).to.equal(0);
    expect(dreamcastSaveData.getVolumeInfo().saveArea.blockNumber).to.equal(DreamcastBasics.SAVE_AREA_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().saveArea.sizeInBlocks).to.equal(DreamcastBasics.SAVE_AREA_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().saveArea.numberOfSaveBlocks).to.equal(DreamcastBasics.NUMBER_OF_SAVE_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().reserved).to.equal(0);

    expect(dreamcastSaveData.getSaveFiles().length).to.equal(0);
  });
});
