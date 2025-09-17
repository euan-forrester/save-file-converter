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

    expect(dreamcastSaveData.getSaveFiles().length).to.equal(9);

    expect(dreamcastSaveData.getSaveFiles()[0].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[0].copyProtected).to.equal(false);
    expect(dreamcastSaveData.getSaveFiles()[0].firstBlockNumber).to.equal(199);
    expect(dreamcastSaveData.getSaveFiles()[0].filename).to.equal('MVLVSCP2_SYS');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[0].fileCreationTime)).to.equal('1999-11-27 07:37:16');
    expect(dreamcastSaveData.getSaveFiles()[0].fileSizeInBlocks).to.equal(5);
    expect(dreamcastSaveData.getSaveFiles()[0].fileHeaderOffsetInBlocks).to.equal(0);

    expect(dreamcastSaveData.getSaveFiles()[1].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[1].copyProtected).to.equal(false);
    expect(dreamcastSaveData.getSaveFiles()[1].firstBlockNumber).to.equal(194);
    expect(dreamcastSaveData.getSaveFiles()[1].filename).to.equal('CVS.S2___SYS');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[1].fileCreationTime)).to.equal('2001-09-13 11:42:43');
    expect(dreamcastSaveData.getSaveFiles()[1].fileSizeInBlocks).to.equal(12);
    expect(dreamcastSaveData.getSaveFiles()[1].fileHeaderOffsetInBlocks).to.equal(0);

    expect(dreamcastSaveData.getSaveFiles()[2].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[2].copyProtected).to.equal(false);
    expect(dreamcastSaveData.getSaveFiles()[2].firstBlockNumber).to.equal(182);
    expect(dreamcastSaveData.getSaveFiles()[2].filename).to.equal('18WHDATA.SYS');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[2].fileCreationTime)).to.equal('2001-05-27 17:01:06');
    expect(dreamcastSaveData.getSaveFiles()[2].fileSizeInBlocks).to.equal(5);
    expect(dreamcastSaveData.getSaveFiles()[2].fileHeaderOffsetInBlocks).to.equal(0);

    expect(dreamcastSaveData.getSaveFiles()[3].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[3].copyProtected).to.equal(false);
    expect(dreamcastSaveData.getSaveFiles()[3].firstBlockNumber).to.equal(177);
    expect(dreamcastSaveData.getSaveFiles()[3].filename).to.equal('SPAWNTDH.SYS');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[3].fileCreationTime)).to.equal('2000-11-05 18:44:10');
    expect(dreamcastSaveData.getSaveFiles()[3].fileSizeInBlocks).to.equal(2);
    expect(dreamcastSaveData.getSaveFiles()[3].fileHeaderOffsetInBlocks).to.equal(0);

    expect(dreamcastSaveData.getSaveFiles()[4].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[4].copyProtected).to.equal(true); // The only save in this image that is copy protected
    expect(dreamcastSaveData.getSaveFiles()[4].firstBlockNumber).to.equal(175);
    expect(dreamcastSaveData.getSaveFiles()[4].filename).to.equal('PJUSTICE_SYS');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[4].fileCreationTime)).to.equal('2001-05-21 22:04:08');
    expect(dreamcastSaveData.getSaveFiles()[4].fileSizeInBlocks).to.equal(2);
    expect(dreamcastSaveData.getSaveFiles()[4].fileHeaderOffsetInBlocks).to.equal(0);

    expect(dreamcastSaveData.getSaveFiles()[5].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[5].copyProtected).to.equal(false);
    expect(dreamcastSaveData.getSaveFiles()[5].firstBlockNumber).to.equal(173);
    expect(dreamcastSaveData.getSaveFiles()[5].filename).to.equal('POWSTONE_DAT');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[5].fileCreationTime)).to.equal('2000-03-27 12:46:29');
    expect(dreamcastSaveData.getSaveFiles()[5].fileSizeInBlocks).to.equal(4);
    expect(dreamcastSaveData.getSaveFiles()[5].fileHeaderOffsetInBlocks).to.equal(0);

    expect(dreamcastSaveData.getSaveFiles()[6].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[6].copyProtected).to.equal(false);
    expect(dreamcastSaveData.getSaveFiles()[6].firstBlockNumber).to.equal(169);
    expect(dreamcastSaveData.getSaveFiles()[6].filename).to.equal('P_STONE2_DAT');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[6].fileCreationTime)).to.equal('2000-09-13 22:49:56');
    expect(dreamcastSaveData.getSaveFiles()[6].fileSizeInBlocks).to.equal(5);
    expect(dreamcastSaveData.getSaveFiles()[6].fileHeaderOffsetInBlocks).to.equal(0);

    expect(dreamcastSaveData.getSaveFiles()[7].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[7].copyProtected).to.equal(false);
    expect(dreamcastSaveData.getSaveFiles()[7].firstBlockNumber).to.equal(164);
    expect(dreamcastSaveData.getSaveFiles()[7].filename).to.equal('ROMANCER_DAT');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[7].fileCreationTime)).to.equal('2000-06-18 01:18:59');
    expect(dreamcastSaveData.getSaveFiles()[7].fileSizeInBlocks).to.equal(3);
    expect(dreamcastSaveData.getSaveFiles()[7].fileHeaderOffsetInBlocks).to.equal(0);

    expect(dreamcastSaveData.getSaveFiles()[8].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[8].copyProtected).to.equal(false);
    expect(dreamcastSaveData.getSaveFiles()[8].firstBlockNumber).to.equal(161);
    expect(dreamcastSaveData.getSaveFiles()[8].filename).to.equal('R2RUMBLE.001');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[8].fileCreationTime)).to.equal('2025-07-20 15:15:35');
    expect(dreamcastSaveData.getSaveFiles()[8].fileSizeInBlocks).to.equal(6);
    expect(dreamcastSaveData.getSaveFiles()[8].fileHeaderOffsetInBlocks).to.equal(0);
  });
});
