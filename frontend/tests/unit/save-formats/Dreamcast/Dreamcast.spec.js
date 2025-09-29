/* eslint-disable no-bitwise, no-multi-str */

import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';
import ArrayUtil from '@/util/Array';

import DreamcastBasics from '@/save-formats/Dreamcast/Components/Basics';
import DreamcastSaveData from '@/save-formats/Dreamcast/Dreamcast';
import DreamcastUtil from '@/save-formats/Dreamcast/Util';

const DIR = './tests/data/save-formats/dreamcast';

const EMPTY_DREAMCAST_FILENAME = `${DIR}/empty_vmu_image.bin`;
const DREAMCAST_FILENAME = `${DIR}/vmu_save_A1.bin`;
const RECREATED_DREAMCAST_FILENAME = `${DIR}/vmu_save_A1-created.bin`; // Contains the same data as DREAMCAST_FILENAME, but 2 of 10 dates in the above file contain inconsistent day-of-week numbers, so they differ when we re-create the file
const DREAMCAST_SAVE_FILENAME = [
  `${DIR}/vmu_save_A1-0.bin`,
  `${DIR}/vmu_save_A1-1.bin`,
  `${DIR}/vmu_save_A1-2.bin`,
  `${DIR}/vmu_save_A1-3.bin`,
  `${DIR}/vmu_save_A1-4.bin`,
  `${DIR}/vmu_save_A1-5.bin`,
  `${DIR}/vmu_save_A1-6.bin`,
  `${DIR}/vmu_save_A1-7.bin`,
  `${DIR}/vmu_save_A1-8.bin`,
];

describe('Dreamcast', () => {
  it('should correctly read a Dreamcast VMU image', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(DREAMCAST_FILENAME);
    const rawArrayBuffers = await Promise.all(DREAMCAST_SAVE_FILENAME.map((n) => ArrayBufferUtil.readArrayBuffer(n)));

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
    expect(dreamcastSaveData.getVolumeInfo().reserved).to.equal(0x800000);

    expect(dreamcastSaveData.getSaveFiles().length).to.equal(9);

    expect(dreamcastSaveData.getSaveFiles()[0].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[0].copyProtected).to.equal(false);
    expect(dreamcastSaveData.getSaveFiles()[0].firstBlockNumber).to.equal(199);
    expect(dreamcastSaveData.getSaveFiles()[0].filename).to.equal('MVLVSCP2_SYS');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[0].fileCreationTime)).to.equal('1999-11-27 07:37:16');
    expect(dreamcastSaveData.getSaveFiles()[0].fileSizeInBlocks).to.equal(5);
    expect(dreamcastSaveData.getSaveFiles()[0].fileHeaderBlockNumber).to.equal(0);
    expect(dreamcastSaveData.getSaveFiles()[0].storageComment).to.equal('MVS.C2_SYSTEM   ');
    expect(dreamcastSaveData.getSaveFiles()[0].fileComment).to.equal('MARVEL VS.CAPCOM 2_SYSTEM FILE  ');
    expect(ArrayUtil.arraysEqual(dreamcastSaveData.getSaveFiles()[0].blockNumberList, ArrayUtil.createReverseSequentialArray(199, 5))).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveData.getSaveFiles()[0].rawData, rawArrayBuffers[0])).to.equal(true);

    expect(dreamcastSaveData.getSaveFiles()[1].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[1].copyProtected).to.equal(false);
    expect(dreamcastSaveData.getSaveFiles()[1].firstBlockNumber).to.equal(194);
    expect(dreamcastSaveData.getSaveFiles()[1].filename).to.equal('CVS.S2___SYS');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[1].fileCreationTime)).to.equal('2001-09-13 11:42:43');
    expect(dreamcastSaveData.getSaveFiles()[1].fileSizeInBlocks).to.equal(12);
    expect(dreamcastSaveData.getSaveFiles()[1].fileHeaderBlockNumber).to.equal(0);
    expect(dreamcastSaveData.getSaveFiles()[1].storageComment).to.equal('CVS.S 2 ｼｽﾃﾑﾌｧｲﾙ'); // "CVS.S 2 system files"
    expect(dreamcastSaveData.getSaveFiles()[1].fileComment).to.equal('CAPCOM VS. SNK 2 ｼｽﾃﾑﾌｧｲﾙ       '); // "CAPCOM VS. SNK 2 System File"
    expect(ArrayUtil.arraysEqual(dreamcastSaveData.getSaveFiles()[1].blockNumberList, ArrayUtil.createReverseSequentialArray(194, 12))).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveData.getSaveFiles()[1].rawData, rawArrayBuffers[1])).to.equal(true);

    expect(dreamcastSaveData.getSaveFiles()[2].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[2].copyProtected).to.equal(false);
    expect(dreamcastSaveData.getSaveFiles()[2].firstBlockNumber).to.equal(182);
    expect(dreamcastSaveData.getSaveFiles()[2].filename).to.equal('18WHDATA.SYS');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[2].fileCreationTime)).to.equal('2001-05-27 17:01:06');
    expect(dreamcastSaveData.getSaveFiles()[2].fileSizeInBlocks).to.equal(5);
    expect(dreamcastSaveData.getSaveFiles()[2].fileHeaderBlockNumber).to.equal(0);
    expect(dreamcastSaveData.getSaveFiles()[2].storageComment).to.equal('18W SYS         ');
    expect(dreamcastSaveData.getSaveFiles()[2].fileComment).to.equal('18WHEELER AMERICAN_PRO_TRUCKER  ');
    expect(ArrayUtil.arraysEqual(dreamcastSaveData.getSaveFiles()[2].blockNumberList, ArrayUtil.createReverseSequentialArray(182, 5))).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveData.getSaveFiles()[2].rawData, rawArrayBuffers[2])).to.equal(true);

    expect(dreamcastSaveData.getSaveFiles()[3].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[3].copyProtected).to.equal(false);
    expect(dreamcastSaveData.getSaveFiles()[3].firstBlockNumber).to.equal(177);
    expect(dreamcastSaveData.getSaveFiles()[3].filename).to.equal('SPAWNTDH.SYS');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[3].fileCreationTime)).to.equal('2000-11-05 18:44:10');
    expect(dreamcastSaveData.getSaveFiles()[3].fileSizeInBlocks).to.equal(2);
    expect(dreamcastSaveData.getSaveFiles()[3].fileHeaderBlockNumber).to.equal(0);
    expect(dreamcastSaveData.getSaveFiles()[3].storageComment).to.equal('SPAWN SYSTEM    ');
    expect(dreamcastSaveData.getSaveFiles()[3].fileComment).to.equal('スポーンシステム                '); // "Spawning System"
    expect(ArrayUtil.arraysEqual(dreamcastSaveData.getSaveFiles()[3].blockNumberList, ArrayUtil.createReverseSequentialArray(177, 2))).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveData.getSaveFiles()[3].rawData, rawArrayBuffers[3])).to.equal(true);

    expect(dreamcastSaveData.getSaveFiles()[4].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[4].copyProtected).to.equal(true); // The only save in this image that is copy protected
    expect(dreamcastSaveData.getSaveFiles()[4].firstBlockNumber).to.equal(175);
    expect(dreamcastSaveData.getSaveFiles()[4].filename).to.equal('PJUSTICE_SYS');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[4].fileCreationTime)).to.equal('2001-05-21 22:04:08');
    expect(dreamcastSaveData.getSaveFiles()[4].fileSizeInBlocks).to.equal(2);
    expect(dreamcastSaveData.getSaveFiles()[4].fileHeaderBlockNumber).to.equal(0);
    expect(dreamcastSaveData.getSaveFiles()[4].storageComment).to.equal('SYSTEM FILE     ');
    expect(dreamcastSaveData.getSaveFiles()[4].fileComment).to.equal('PROJECT JUSTICE                 ');
    expect(ArrayUtil.arraysEqual(dreamcastSaveData.getSaveFiles()[4].blockNumberList, ArrayUtil.createReverseSequentialArray(175, 2))).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveData.getSaveFiles()[4].rawData, rawArrayBuffers[4])).to.equal(true);

    expect(dreamcastSaveData.getSaveFiles()[5].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[5].copyProtected).to.equal(false);
    expect(dreamcastSaveData.getSaveFiles()[5].firstBlockNumber).to.equal(173);
    expect(dreamcastSaveData.getSaveFiles()[5].filename).to.equal('POWSTONE_DAT');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[5].fileCreationTime)).to.equal('2000-03-27 12:46:29');
    expect(dreamcastSaveData.getSaveFiles()[5].fileSizeInBlocks).to.equal(4);
    expect(dreamcastSaveData.getSaveFiles()[5].fileHeaderBlockNumber).to.equal(0);
    expect(dreamcastSaveData.getSaveFiles()[5].storageComment).to.equal('ﾊﾟﾜｰｽﾄｰﾝｾｰﾌﾞﾃﾞｰﾀ'); // "Power Stone save data"
    expect(dreamcastSaveData.getSaveFiles()[5].fileComment).to.equal('パワーストーン　セーブデータ    2O'); // "Power Stone save data"
    expect(ArrayUtil.arraysEqual(dreamcastSaveData.getSaveFiles()[5].blockNumberList, ArrayUtil.createReverseSequentialArray(173, 4))).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveData.getSaveFiles()[5].rawData, rawArrayBuffers[5])).to.equal(true);

    expect(dreamcastSaveData.getSaveFiles()[6].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[6].copyProtected).to.equal(false);
    expect(dreamcastSaveData.getSaveFiles()[6].firstBlockNumber).to.equal(169);
    expect(dreamcastSaveData.getSaveFiles()[6].filename).to.equal('P_STONE2_DAT');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[6].fileCreationTime)).to.equal('2000-09-13 22:49:56');
    expect(dreamcastSaveData.getSaveFiles()[6].fileSizeInBlocks).to.equal(5);
    expect(dreamcastSaveData.getSaveFiles()[6].fileHeaderBlockNumber).to.equal(0);
    expect(dreamcastSaveData.getSaveFiles()[6].storageComment).to.equal('ﾊﾟﾜｰｽﾄｰﾝ2 ｾｰﾌﾞ  '); // "Power Stone 2 Save"
    expect(dreamcastSaveData.getSaveFiles()[6].fileComment).to.equal('パワーストーン２　セーブデータ　2O'); // "Power Stone 2 save data"
    expect(ArrayUtil.arraysEqual(dreamcastSaveData.getSaveFiles()[6].blockNumberList, ArrayUtil.createReverseSequentialArray(169, 5))).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveData.getSaveFiles()[6].rawData, rawArrayBuffers[6])).to.equal(true);

    expect(dreamcastSaveData.getSaveFiles()[7].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[7].copyProtected).to.equal(false);
    expect(dreamcastSaveData.getSaveFiles()[7].firstBlockNumber).to.equal(164);
    expect(dreamcastSaveData.getSaveFiles()[7].filename).to.equal('ROMANCER_DAT');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[7].fileCreationTime)).to.equal('2000-06-18 01:18:59');
    expect(dreamcastSaveData.getSaveFiles()[7].fileSizeInBlocks).to.equal(3);
    expect(dreamcastSaveData.getSaveFiles()[7].fileHeaderBlockNumber).to.equal(0);
    expect(dreamcastSaveData.getSaveFiles()[7].storageComment).to.equal('ｷｶｲｵｰ ｾｰﾌﾞﾃﾞｰﾀ  '); // "Machine save data"
    expect(dreamcastSaveData.getSaveFiles()[7].fileComment).to.equal('キカイオー　セーブデータ        '); // "Kikaioh save data"
    expect(ArrayUtil.arraysEqual(dreamcastSaveData.getSaveFiles()[7].blockNumberList, ArrayUtil.createReverseSequentialArray(164, 3))).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveData.getSaveFiles()[7].rawData, rawArrayBuffers[7])).to.equal(true);

    expect(dreamcastSaveData.getSaveFiles()[8].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[8].copyProtected).to.equal(false);
    expect(dreamcastSaveData.getSaveFiles()[8].firstBlockNumber).to.equal(161);
    expect(dreamcastSaveData.getSaveFiles()[8].filename).to.equal('R2RUMBLE.001');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[8].fileCreationTime)).to.equal('2025-07-20 15:15:35');
    expect(dreamcastSaveData.getSaveFiles()[8].fileSizeInBlocks).to.equal(6);
    expect(dreamcastSaveData.getSaveFiles()[8].fileHeaderBlockNumber).to.equal(0);
    expect(dreamcastSaveData.getSaveFiles()[8].storageComment).to.equal('POD 5!          ');
    expect(dreamcastSaveData.getSaveFiles()[8].fileComment).to.equal('Ready 2 Rumble Boxing           Ready 2 Rumble  ');
    expect(ArrayUtil.arraysEqual(dreamcastSaveData.getSaveFiles()[8].blockNumberList, ArrayUtil.createReverseSequentialArray(161, 6))).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveData.getSaveFiles()[8].rawData, rawArrayBuffers[8])).to.equal(true);
  });

  it('should correctly create an empty Dreamcast VMU image', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMPTY_DREAMCAST_FILENAME);

    const volumeInfo = {
      useCustomColor: true,
      customColor: {
        blue: 0xAB,
        green: 0xCD,
        red: 0xEF,
        alpha: 0x42,
      },
      timestamp: new Date('2025-10-18 13:42:00'),
      iconShape: 42,
    };

    const dreamcastSaveData = DreamcastSaveData.createFromSaveFiles([], volumeInfo);

    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveData.getArrayBuffer(), arrayBuffer)).to.equal(true);
  });

  it('should correctly read an empty Dreamcast VMU image', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMPTY_DREAMCAST_FILENAME);

    const dreamcastSaveData = DreamcastSaveData.createFromDreamcastData(arrayBuffer);

    expect(dreamcastSaveData.getVolumeInfo().useCustomColor).to.equal(true);
    expect(dreamcastSaveData.getVolumeInfo().customColor.blue).to.equal(0xAB);
    expect(dreamcastSaveData.getVolumeInfo().customColor.green).to.equal(0xCD);
    expect(dreamcastSaveData.getVolumeInfo().customColor.red).to.equal(0xEF);
    expect(dreamcastSaveData.getVolumeInfo().customColor.alpha).to.equal(0x42);
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getVolumeInfo().timestamp)).to.equal('2025-10-18 13:42:00');
    expect(dreamcastSaveData.getVolumeInfo().largestBlockNumber).to.equal(DreamcastBasics.NUM_BLOCKS - 1);
    expect(dreamcastSaveData.getVolumeInfo().partitionNumber).to.equal(0);
    expect(dreamcastSaveData.getVolumeInfo().systemInfo.blockNumber).to.equal(DreamcastBasics.SYSTEM_INFO_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().systemInfo.sizeInBlocks).to.equal(DreamcastBasics.SYSTEM_INFO_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().fileAllocationTable.blockNumber).to.equal(DreamcastBasics.FILE_ALLOCATION_TABLE_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().fileAllocationTable.sizeInBlocks).to.equal(DreamcastBasics.FILE_ALLOCATION_TABLE_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().directory.blockNumber).to.equal(DreamcastBasics.DIRECTORY_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().directory.sizeInBlocks).to.equal(DreamcastBasics.DIRECTORY_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().iconShape).to.equal(42);
    expect(dreamcastSaveData.getVolumeInfo().saveArea.blockNumber).to.equal(DreamcastBasics.SAVE_AREA_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().saveArea.sizeInBlocks).to.equal(DreamcastBasics.SAVE_AREA_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().saveArea.numberOfSaveBlocks).to.equal(DreamcastBasics.NUMBER_OF_SAVE_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().reserved).to.equal(0);
  });

  it('should correctly create a Dreamcast VMU image', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(RECREATED_DREAMCAST_FILENAME);
    const rawArrayBuffers = await Promise.all(DREAMCAST_SAVE_FILENAME.map((n) => ArrayBufferUtil.readArrayBuffer(n)));

    const volumeInfo = {
      useCustomColor: true,
      customColor: {
        blue: 255,
        green: 255,
        red: 255,
        alpha: 255,
      },
      timestamp: new Date('2024-10-12 19:56:48'),
      iconShape: 0,
      reserved: 0x800000,
    };

    const saveFiles = [
      {
        fileType: 'Data',
        copyProtected: false,
        filename: 'MVLVSCP2_SYS',
        fileCreationTime: new Date('1999-11-27 07:37:16'),
        fileHeaderBlockNumber: 0,
        rawData: rawArrayBuffers[0],
      },
      {
        fileType: 'Data',
        copyProtected: false,
        filename: 'CVS.S2___SYS',
        fileCreationTime: new Date('2001-09-13 11:42:43'),
        fileHeaderBlockNumber: 0,
        rawData: rawArrayBuffers[1],
      },
      {
        fileType: 'Data',
        copyProtected: false,
        filename: '18WHDATA.SYS',
        fileCreationTime: new Date('2001-05-27 17:01:06'),
        fileHeaderBlockNumber: 0,
        rawData: rawArrayBuffers[2],
      },
      {
        fileType: 'Data',
        copyProtected: false,
        filename: 'SPAWNTDH.SYS',
        fileCreationTime: new Date('2000-11-05 18:44:10'),
        fileHeaderBlockNumber: 0,
        rawData: rawArrayBuffers[3],
      },
      {
        fileType: 'Data',
        copyProtected: true, // The only save in this image that is copy protected
        filename: 'PJUSTICE_SYS',
        fileCreationTime: new Date('2001-05-21 22:04:08'),
        fileHeaderBlockNumber: 0,
        rawData: rawArrayBuffers[4],
      },
      {
        fileType: 'Data',
        copyProtected: false,
        filename: 'POWSTONE_DAT',
        fileCreationTime: new Date('2000-03-27 12:46:29'),
        fileHeaderBlockNumber: 0,
        rawData: rawArrayBuffers[5],
      },
      {
        fileType: 'Data',
        copyProtected: false,
        filename: 'P_STONE2_DAT',
        fileCreationTime: new Date('2000-09-13 22:49:56'),
        fileHeaderBlockNumber: 0,
        rawData: rawArrayBuffers[6],
      },
      {
        fileType: 'Data',
        copyProtected: false,
        filename: 'ROMANCER_DAT',
        fileCreationTime: new Date('2000-06-18 01:18:59'),
        fileHeaderBlockNumber: 0,
        rawData: rawArrayBuffers[7],
      },
      {
        fileType: 'Data',
        copyProtected: false,
        filename: 'R2RUMBLE.001',
        fileCreationTime: new Date('2025-07-20 15:15:35'),
        fileHeaderBlockNumber: 0,
        rawData: rawArrayBuffers[8],
      },
    ];

    const dreamcastSaveData = DreamcastSaveData.createFromSaveFiles(saveFiles, volumeInfo);

    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveData.getArrayBuffer(), arrayBuffer)).to.equal(true);
  });
});
