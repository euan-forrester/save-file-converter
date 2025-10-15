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
const RECREATED_DREAMCAST_FILENAME = `${DIR}/vmu_save_A1-created.bin`; // Contains the same data as DREAMCAST_FILENAME, but 2 of 10 dates in the above file contain inconsistent day-of-week numbers, so they differ when we re-create the file. Also sets the size of the extra area to 41 instead of 31
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

const DREAMCAST_EXTRA_SAVE_BLOCKS_FILENAME = `${DIR}/need_defrag_chao_adv2.bin`;
const DREAMCAST_EXTRA_SAVE_BLOCKS_SAVE_FILENAME = [
  `${DIR}/need_defrag_chao_adv2-0.bin`,
  `${DIR}/need_defrag_chao_adv2-1.bin`,
  `${DIR}/need_defrag_chao_adv2-2.bin`,
  `${DIR}/need_defrag_chao_adv2-3.bin`,
  `${DIR}/need_defrag_chao_adv2-4.bin`,
];

const DREAMCAST_EMPTY_COMMENTS_FILENAME = `${DIR}/vmu_extended_blocks_2.bin`;
const DREAMCAST_EMPTY_COMMENTS_SAVE_FILENAME = [
  `${DIR}/vmu_extended_blocks_2-0.bin`,
];

const DREAMCAST_GAME_FILENAME = `${DIR}/chao_adv2_mod.bin`;
const RECREATED_DREAMCAST_GAME_FILENAME = `${DIR}/chao_adv2_mod-created.bin`; // The original file contains data from a deleted save for Jet Set Radio, which is in the user area and the file allocation table. Also there's a day-of-week difference, and the original file contains a few nonstandard values in the system info block
const DREAMCAST_GAME_SAVE_FILENAME = [
  `${DIR}/chao_adv2_mod-0.bin`,
];

const DREAMCAST_INCORRECT_LARGEST_BLOCK_NUMBER_FILENAME = `${DIR}/vmoooo.bin`;
const DREAMCAST_INCORRECT_LARGEST_BLOCK_NUMBER_SAVE_FILENAME = [
  `${DIR}/vmoooo.bin-0`,
];

const DREAMCAST_INCORRECT_SIZE_FILENAME = `${DIR}/vmu5_FUCKED.vmu`;

const DREAMCAST_GAME_AND_DATA_FILENAME = `${DIR}/PACit.bin`;
const RECREATED_DREAMCAST_GAME_AND_DATA_FILENAME = `${DIR}/PACit-created.bin`; // The recreated file reverses the order of the directory, has differences in how it specifies the extra area in the FAT, and has day-of-week differences. It also has a different size for the extra area
const DREAMCAST_GAME_AND_DATA_SAVE_FILENAME = [
  `${DIR}/PACit-0.bin`,
  `${DIR}/PACit-1.bin`,
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
    expect(dreamcastSaveData.getVolumeInfo().extraArea.blockNumber).to.equal(DreamcastBasics.EXTRA_AREA_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().extraArea.sizeInBlocks).to.equal(31); // flycast writes 31 to this field instead of 41. maybe that's where this file is from? https://github.com/flyinghead/flycast/blob/33833cfd1ed2d94d907223442fdb8cdafd8d5d80/core/hw/maple/maple_devs.cpp#L532
    expect(dreamcastSaveData.getVolumeInfo().saveArea.blockNumber).to.equal(DreamcastBasics.SAVE_AREA_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().saveArea.sizeInBlocks).to.equal(DreamcastBasics.SAVE_AREA_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().gameBlock).to.equal(DreamcastBasics.DEFAULT_GAME_BLOCK);
    expect(dreamcastSaveData.getVolumeInfo().maxGameSize).to.equal(DreamcastBasics.DEFAULT_MAX_GAME_SIZE);

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
    expect(dreamcastSaveData.getVolumeInfo().extraArea.blockNumber).to.equal(DreamcastBasics.EXTRA_AREA_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().extraArea.sizeInBlocks).to.equal(DreamcastBasics.EXTRA_AREA_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().saveArea.blockNumber).to.equal(DreamcastBasics.SAVE_AREA_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().saveArea.sizeInBlocks).to.equal(DreamcastBasics.SAVE_AREA_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().gameBlock).to.equal(DreamcastBasics.DEFAULT_GAME_BLOCK);
    expect(dreamcastSaveData.getVolumeInfo().maxGameSize).to.equal(DreamcastBasics.DEFAULT_MAX_GAME_SIZE);
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

  it('should correctly read a Dreamcast VMU image with an expanded save area', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(DREAMCAST_EXTRA_SAVE_BLOCKS_FILENAME);
    const rawArrayBuffers = await Promise.all(DREAMCAST_EXTRA_SAVE_BLOCKS_SAVE_FILENAME.map((n) => ArrayBufferUtil.readArrayBuffer(n)));

    const dreamcastSaveData = DreamcastSaveData.createFromDreamcastData(arrayBuffer);

    expect(dreamcastSaveData.getVolumeInfo().useCustomColor).to.equal(false);
    expect(dreamcastSaveData.getVolumeInfo().customColor.blue).to.equal(255);
    expect(dreamcastSaveData.getVolumeInfo().customColor.green).to.equal(255);
    expect(dreamcastSaveData.getVolumeInfo().customColor.red).to.equal(255);
    expect(dreamcastSaveData.getVolumeInfo().customColor.alpha).to.equal(255);
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getVolumeInfo().timestamp)).to.equal('1812-02-03 04:56:45');
    expect(dreamcastSaveData.getVolumeInfo().largestBlockNumber).to.equal(DreamcastBasics.NUM_BLOCKS - 1);
    expect(dreamcastSaveData.getVolumeInfo().partitionNumber).to.equal(0);
    expect(dreamcastSaveData.getVolumeInfo().systemInfo.blockNumber).to.equal(DreamcastBasics.SYSTEM_INFO_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().systemInfo.sizeInBlocks).to.equal(DreamcastBasics.SYSTEM_INFO_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().fileAllocationTable.blockNumber).to.equal(DreamcastBasics.FILE_ALLOCATION_TABLE_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().fileAllocationTable.sizeInBlocks).to.equal(DreamcastBasics.FILE_ALLOCATION_TABLE_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().directory.blockNumber).to.equal(DreamcastBasics.DIRECTORY_END_BLOCK_NUMBER); // This file is laid out incorrectly and specifies its blocks from the side closest to the beginning of the file
    expect(dreamcastSaveData.getVolumeInfo().directory.sizeInBlocks).to.equal(DreamcastBasics.DIRECTORY_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().iconShape).to.equal(0);
    expect(dreamcastSaveData.getVolumeInfo().extraArea.blockNumber).to.equal(DreamcastBasics.EXTRA_AREA_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().extraArea.sizeInBlocks).to.equal(0); // Not the usual DreamcastBasics.EXTRA_AREA_SIZE_IN_BLOCKS (41)
    expect(dreamcastSaveData.getVolumeInfo().saveArea.blockNumber).to.equal(DreamcastBasics.SAVE_AREA_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().saveArea.sizeInBlocks).to.equal(240); // Not the usual DreamcastBasics.SAVE_AREA_SIZE_IN_BLOCKS (200)
    expect(dreamcastSaveData.getVolumeInfo().gameBlock).to.equal(DreamcastBasics.DEFAULT_GAME_BLOCK);
    expect(dreamcastSaveData.getVolumeInfo().maxGameSize).to.equal(0); // Not the usual DreamcastBasics.DEFAULT_MAX_GAME_SIZE (128)

    expect(dreamcastSaveData.getSaveFiles().length).to.equal(5);

    expect(dreamcastSaveData.getSaveFiles()[0].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[0].copyProtected).to.equal(true);
    expect(dreamcastSaveData.getSaveFiles()[0].firstBlockNumber).to.equal(235);
    expect(dreamcastSaveData.getSaveFiles()[0].filename).to.equal('JETSET___XLA');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[0].fileCreationTime)).to.equal('2018-10-26 01:53:41');
    expect(dreamcastSaveData.getSaveFiles()[0].fileSizeInBlocks).to.equal(61);
    expect(dreamcastSaveData.getSaveFiles()[0].fileHeaderBlockNumber).to.equal(0);
    expect(dreamcastSaveData.getSaveFiles()[0].storageComment).to.equal('JET_GRAFFITI_X  ');
    expect(dreamcastSaveData.getSaveFiles()[0].fileComment).to.equal('JETSETRADIO XLARGE              ');
    expect(ArrayUtil.arraysEqual(dreamcastSaveData.getSaveFiles()[0].blockNumberList, ArrayUtil.createReverseSequentialArray(235, 61))).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveData.getSaveFiles()[0].rawData, rawArrayBuffers[0])).to.equal(true);

    expect(dreamcastSaveData.getSaveFiles()[1].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[1].copyProtected).to.equal(true);
    expect(dreamcastSaveData.getSaveFiles()[1].firstBlockNumber).to.equal(174);
    expect(dreamcastSaveData.getSaveFiles()[1].filename).to.equal('SHENMUE2_002');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[1].fileCreationTime)).to.equal('2018-10-26 01:53:52');
    expect(dreamcastSaveData.getSaveFiles()[1].fileSizeInBlocks).to.equal(18);
    expect(dreamcastSaveData.getSaveFiles()[1].fileHeaderBlockNumber).to.equal(0);
    expect(dreamcastSaveData.getSaveFiles()[1].storageComment).to.equal('SHENMUE2        ');
    expect(dreamcastSaveData.getSaveFiles()[1].fileComment).to.equal('シェンムー　２                  '); // "Shenmue 2"
    expect(ArrayUtil.arraysEqual(dreamcastSaveData.getSaveFiles()[1].blockNumberList, ArrayUtil.createReverseSequentialArray(174, 18))).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveData.getSaveFiles()[1].rawData, rawArrayBuffers[1])).to.equal(true);

    expect(dreamcastSaveData.getSaveFiles()[2].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[2].copyProtected).to.equal(true);
    expect(dreamcastSaveData.getSaveFiles()[2].firstBlockNumber).to.equal(152);
    expect(dreamcastSaveData.getSaveFiles()[2].filename).to.equal('AQUAGTRACING');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[2].fileCreationTime)).to.equal('2018-10-26 01:54:00');
    expect(dreamcastSaveData.getSaveFiles()[2].fileSizeInBlocks).to.equal(8);
    expect(dreamcastSaveData.getSaveFiles()[2].fileHeaderBlockNumber).to.equal(0);
    expect(dreamcastSaveData.getSaveFiles()[2].storageComment).to.equal('GAME SETTINGS   ');
    expect(dreamcastSaveData.getSaveFiles()[2].fileComment).to.equal('AQUA GT RACING                  ');
    expect(ArrayUtil.arraysEqual(dreamcastSaveData.getSaveFiles()[2].blockNumberList, ArrayUtil.createReverseSequentialArray(152, 8))).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveData.getSaveFiles()[2].rawData, rawArrayBuffers[2])).to.equal(true);

    expect(dreamcastSaveData.getSaveFiles()[3].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[3].copyProtected).to.equal(true);
    expect(dreamcastSaveData.getSaveFiles()[3].firstBlockNumber).to.equal(144);
    expect(dreamcastSaveData.getSaveFiles()[3].filename).to.equal('SAMBAUS1.SYS');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[3].fileCreationTime)).to.equal('2018-10-26 01:54:03');
    expect(dreamcastSaveData.getSaveFiles()[3].fileSizeInBlocks).to.equal(6);
    expect(dreamcastSaveData.getSaveFiles()[3].fileHeaderBlockNumber).to.equal(0);
    expect(dreamcastSaveData.getSaveFiles()[3].storageComment).to.equal('Main Backup Data');
    expect(dreamcastSaveData.getSaveFiles()[3].fileComment).to.equal('SAMBA MAIN                      ');
    expect(ArrayUtil.arraysEqual(dreamcastSaveData.getSaveFiles()[3].blockNumberList, ArrayUtil.createReverseSequentialArray(144, 6))).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveData.getSaveFiles()[3].rawData, rawArrayBuffers[3])).to.equal(true);

    expect(dreamcastSaveData.getSaveFiles()[4].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[4].copyProtected).to.equal(true);
    expect(dreamcastSaveData.getSaveFiles()[4].firstBlockNumber).to.equal(138);
    expect(dreamcastSaveData.getSaveFiles()[4].filename).to.equal('SAMBAV2K.SYS');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[4].fileCreationTime)).to.equal('2018-10-26 01:55:00');
    expect(dreamcastSaveData.getSaveFiles()[4].fileSizeInBlocks).to.equal(17);
    expect(dreamcastSaveData.getSaveFiles()[4].fileHeaderBlockNumber).to.equal(0);
    expect(dreamcastSaveData.getSaveFiles()[4].storageComment).to.equal('ﾒｲﾝﾊﾞｯｸｱｯﾌﾟﾃﾞｰﾀ '); // "Main backup data"
    expect(dreamcastSaveData.getSaveFiles()[4].fileComment).to.equal('サンバＤＥアミーゴVer2000 メイン'); // "Samba DE Amigo Ver. 2000 Main"
    expect(ArrayUtil.arraysEqual(dreamcastSaveData.getSaveFiles()[4].blockNumberList, ArrayUtil.createReverseSequentialArray(138, 17))).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveData.getSaveFiles()[4].rawData, rawArrayBuffers[4])).to.equal(true);
  });

  it('should correctly read a Dreamcast VMU image containing a file with empty comments', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(DREAMCAST_EMPTY_COMMENTS_FILENAME);
    const rawArrayBuffers = await Promise.all(DREAMCAST_EMPTY_COMMENTS_SAVE_FILENAME.map((n) => ArrayBufferUtil.readArrayBuffer(n)));

    const dreamcastSaveData = DreamcastSaveData.createFromDreamcastData(arrayBuffer);

    expect(dreamcastSaveData.getVolumeInfo().useCustomColor).to.equal(true);
    expect(dreamcastSaveData.getVolumeInfo().customColor.blue).to.equal(255);
    expect(dreamcastSaveData.getVolumeInfo().customColor.green).to.equal(255);
    expect(dreamcastSaveData.getVolumeInfo().customColor.red).to.equal(255);
    expect(dreamcastSaveData.getVolumeInfo().customColor.alpha).to.equal(255);
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getVolumeInfo().timestamp)).to.equal('1998-11-27 00:00:58');
    expect(dreamcastSaveData.getVolumeInfo().largestBlockNumber).to.equal(DreamcastBasics.NUM_BLOCKS - 1);
    expect(dreamcastSaveData.getVolumeInfo().partitionNumber).to.equal(0);
    expect(dreamcastSaveData.getVolumeInfo().systemInfo.blockNumber).to.equal(DreamcastBasics.SYSTEM_INFO_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().systemInfo.sizeInBlocks).to.equal(DreamcastBasics.SYSTEM_INFO_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().fileAllocationTable.blockNumber).to.equal(DreamcastBasics.FILE_ALLOCATION_TABLE_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().fileAllocationTable.sizeInBlocks).to.equal(DreamcastBasics.FILE_ALLOCATION_TABLE_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().directory.blockNumber).to.equal(DreamcastBasics.DIRECTORY_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().directory.sizeInBlocks).to.equal(DreamcastBasics.DIRECTORY_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().iconShape).to.equal(0);
    expect(dreamcastSaveData.getVolumeInfo().extraArea.blockNumber).to.equal(DreamcastBasics.EXTRA_AREA_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().extraArea.sizeInBlocks).to.equal(31); // Not the usual DreamcastBasics.EXTRA_AREA_SIZE_IN_BLOCKS (41)
    expect(dreamcastSaveData.getVolumeInfo().saveArea.blockNumber).to.equal(DreamcastBasics.SAVE_AREA_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().saveArea.sizeInBlocks).to.equal(241); // Not the usual DreamcastBasics.SAVE_AREA_SIZE_IN_BLOCKS (200)
    expect(dreamcastSaveData.getVolumeInfo().gameBlock).to.equal(DreamcastBasics.DEFAULT_GAME_BLOCK);
    expect(dreamcastSaveData.getVolumeInfo().maxGameSize).to.equal(DreamcastBasics.DEFAULT_MAX_GAME_SIZE);

    expect(dreamcastSaveData.getSaveFiles().length).to.equal(1);

    expect(dreamcastSaveData.getSaveFiles()[0].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[0].copyProtected).to.equal(true);
    expect(dreamcastSaveData.getSaveFiles()[0].firstBlockNumber).to.equal(240);
    expect(dreamcastSaveData.getSaveFiles()[0].filename).to.equal('VMUTOOL__OPT');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[0].fileCreationTime)).to.equal('2018-10-26 01:00:24');
    expect(dreamcastSaveData.getSaveFiles()[0].fileSizeInBlocks).to.equal(8);
    expect(dreamcastSaveData.getSaveFiles()[0].fileHeaderBlockNumber).to.equal(0);
    expect(dreamcastSaveData.getSaveFiles()[0].storageComment).to.equal('');
    expect(dreamcastSaveData.getSaveFiles()[0].fileComment).to.equal('');
    expect(ArrayUtil.arraysEqual(dreamcastSaveData.getSaveFiles()[0].blockNumberList, ArrayUtil.createReverseSequentialArray(240, 8))).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveData.getSaveFiles()[0].rawData, rawArrayBuffers[0])).to.equal(true);
  });

  it('should correctly read a Dreamcast VMU image containing a game', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(DREAMCAST_GAME_FILENAME);
    const rawArrayBuffers = await Promise.all(DREAMCAST_GAME_SAVE_FILENAME.map((n) => ArrayBufferUtil.readArrayBuffer(n)));

    const dreamcastSaveData = DreamcastSaveData.createFromDreamcastData(arrayBuffer);

    expect(dreamcastSaveData.getVolumeInfo().useCustomColor).to.equal(true);
    expect(dreamcastSaveData.getVolumeInfo().customColor.blue).to.equal(47);
    expect(dreamcastSaveData.getVolumeInfo().customColor.green).to.equal(79);
    expect(dreamcastSaveData.getVolumeInfo().customColor.red).to.equal(31);
    expect(dreamcastSaveData.getVolumeInfo().customColor.alpha).to.equal(255);
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getVolumeInfo().timestamp)).to.equal('2018-11-17 20:06:34');
    expect(dreamcastSaveData.getVolumeInfo().largestBlockNumber).to.equal(DreamcastBasics.NUM_BLOCKS - 1);
    expect(dreamcastSaveData.getVolumeInfo().partitionNumber).to.equal(0);
    expect(dreamcastSaveData.getVolumeInfo().systemInfo.blockNumber).to.equal(DreamcastBasics.SYSTEM_INFO_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().systemInfo.sizeInBlocks).to.equal(DreamcastBasics.SYSTEM_INFO_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().fileAllocationTable.blockNumber).to.equal(DreamcastBasics.FILE_ALLOCATION_TABLE_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().fileAllocationTable.sizeInBlocks).to.equal(DreamcastBasics.FILE_ALLOCATION_TABLE_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().directory.blockNumber).to.equal(DreamcastBasics.DIRECTORY_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().directory.sizeInBlocks).to.equal(DreamcastBasics.DIRECTORY_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().iconShape).to.equal(8); // Not the usual 0
    expect(dreamcastSaveData.getVolumeInfo().extraArea.blockNumber).to.equal(DreamcastBasics.EXTRA_AREA_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().extraArea.sizeInBlocks).to.equal(0); // Not the usual DreamcastBasics.EXTRA_AREA_SIZE_IN_BLOCKS (41)
    expect(dreamcastSaveData.getVolumeInfo().saveArea.blockNumber).to.equal(DreamcastBasics.SAVE_AREA_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().saveArea.sizeInBlocks).to.equal(240); // Not the usual DreamcastBasics.SAVE_AREA_SIZE_IN_BLOCKS (200)
    expect(dreamcastSaveData.getVolumeInfo().gameBlock).to.equal(DreamcastBasics.DEFAULT_GAME_BLOCK);
    expect(dreamcastSaveData.getVolumeInfo().maxGameSize).to.equal(0); // Not the usual DreamcastBasics.DEFAULT_MAX_GAME_SIZE

    expect(dreamcastSaveData.getSaveFiles().length).to.equal(1);

    expect(dreamcastSaveData.getSaveFiles()[0].fileType).to.equal('Game');
    expect(dreamcastSaveData.getSaveFiles()[0].copyProtected).to.equal(true);
    expect(dreamcastSaveData.getSaveFiles()[0].firstBlockNumber).to.equal(0);
    expect(dreamcastSaveData.getSaveFiles()[0].filename).to.equal('SONIC2____VM');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[0].fileCreationTime)).to.equal('2018-11-17 20:50:26');
    expect(dreamcastSaveData.getSaveFiles()[0].fileSizeInBlocks).to.equal(128);
    expect(dreamcastSaveData.getSaveFiles()[0].fileHeaderBlockNumber).to.equal(1);
    expect(dreamcastSaveData.getSaveFiles()[0].storageComment).to.equal('CHAO ADV 2      ');
    expect(dreamcastSaveData.getSaveFiles()[0].fileComment).to.equal('SONIC ADVENTURE 2 / CHAO ADV 2  ');
    expect(ArrayUtil.arraysEqual(dreamcastSaveData.getSaveFiles()[0].blockNumberList, ArrayUtil.createSequentialArray(0, 128))).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveData.getSaveFiles()[0].rawData, rawArrayBuffers[0])).to.equal(true);
  });

  it('should correctly create a Dreamcast VMU image containing a game', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(RECREATED_DREAMCAST_GAME_FILENAME);
    const rawArrayBuffers = await Promise.all(DREAMCAST_GAME_SAVE_FILENAME.map((n) => ArrayBufferUtil.readArrayBuffer(n)));

    const volumeInfo = {
      useCustomColor: true,
      customColor: {
        blue: 47,
        green: 79,
        red: 31,
        alpha: 255,
      },
      timestamp: new Date('2018-11-17 20:06:34'),
      iconShape: 8,
    };

    const saveFiles = [
      {
        fileType: 'Game',
        copyProtected: true,
        filename: 'SONIC2____VM',
        fileCreationTime: new Date('2018-11-17 20:50:26'),
        fileHeaderBlockNumber: 1,
        rawData: rawArrayBuffers[0],
      },
    ];

    const dreamcastSaveData = DreamcastSaveData.createFromSaveFiles(saveFiles, volumeInfo);

    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveData.getArrayBuffer(), arrayBuffer)).to.equal(true);
  });

  it('should correctly read a Dreamcast VMU image with an incorrect largest block number', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(DREAMCAST_INCORRECT_LARGEST_BLOCK_NUMBER_FILENAME);
    const rawArrayBuffers = await Promise.all(DREAMCAST_INCORRECT_LARGEST_BLOCK_NUMBER_SAVE_FILENAME.map((n) => ArrayBufferUtil.readArrayBuffer(n)));

    const dreamcastSaveData = DreamcastSaveData.createFromDreamcastData(arrayBuffer);

    expect(dreamcastSaveData.getVolumeInfo().useCustomColor).to.equal(false);
    expect(dreamcastSaveData.getVolumeInfo().customColor.blue).to.equal(255);
    expect(dreamcastSaveData.getVolumeInfo().customColor.green).to.equal(255);
    expect(dreamcastSaveData.getVolumeInfo().customColor.red).to.equal(255);
    expect(dreamcastSaveData.getVolumeInfo().customColor.alpha).to.equal(255);
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getVolumeInfo().timestamp)).to.equal('2022-11-01 23:05:05');
    expect(dreamcastSaveData.getVolumeInfo().largestBlockNumber).to.equal(256); // Not the usual DreamcastBasics.NUM_BLOCKS - 1
    expect(dreamcastSaveData.getVolumeInfo().partitionNumber).to.equal(0);
    expect(dreamcastSaveData.getVolumeInfo().systemInfo.blockNumber).to.equal(DreamcastBasics.SYSTEM_INFO_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().systemInfo.sizeInBlocks).to.equal(DreamcastBasics.SYSTEM_INFO_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().fileAllocationTable.blockNumber).to.equal(DreamcastBasics.FILE_ALLOCATION_TABLE_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().fileAllocationTable.sizeInBlocks).to.equal(DreamcastBasics.FILE_ALLOCATION_TABLE_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().directory.blockNumber).to.equal(DreamcastBasics.DIRECTORY_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().directory.sizeInBlocks).to.equal(DreamcastBasics.DIRECTORY_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().iconShape).to.equal(0);
    expect(dreamcastSaveData.getVolumeInfo().extraArea.blockNumber).to.equal(DreamcastBasics.EXTRA_AREA_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().extraArea.sizeInBlocks).to.equal(31); // Not the usual DreamcastBasics.EXTRA_AREA_SIZE_IN_BLOCKS (41)
    expect(dreamcastSaveData.getVolumeInfo().saveArea.blockNumber).to.equal(DreamcastBasics.SAVE_AREA_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().saveArea.sizeInBlocks).to.equal(DreamcastBasics.SAVE_AREA_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().gameBlock).to.equal(DreamcastBasics.DEFAULT_GAME_BLOCK);
    expect(dreamcastSaveData.getVolumeInfo().maxGameSize).to.equal(0); // Not the usual DreamcastBasics.DEFAULT_MAX_GAME_SIZE

    expect(dreamcastSaveData.getSaveFiles().length).to.equal(1);

    expect(dreamcastSaveData.getSaveFiles()[0].fileType).to.equal('Game');
    expect(dreamcastSaveData.getSaveFiles()[0].copyProtected).to.equal(true);
    expect(dreamcastSaveData.getSaveFiles()[0].firstBlockNumber).to.equal(0);
    expect(dreamcastSaveData.getSaveFiles()[0].filename).to.equal('SONICADV__VM');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[0].fileCreationTime)).to.equal('2022-11-01 23:31:14');
    expect(dreamcastSaveData.getSaveFiles()[0].fileSizeInBlocks).to.equal(128);
    expect(dreamcastSaveData.getSaveFiles()[0].fileHeaderBlockNumber).to.equal(1);
    expect(dreamcastSaveData.getSaveFiles()[0].storageComment).to.equal('CHAO_ADVENTURE  ');
    expect(dreamcastSaveData.getSaveFiles()[0].fileComment).to.equal('SONIC ADVENTURE / CHAO Adventure');
    expect(ArrayUtil.arraysEqual(dreamcastSaveData.getSaveFiles()[0].blockNumberList, ArrayUtil.createSequentialArray(0, 128))).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveData.getSaveFiles()[0].rawData, rawArrayBuffers[0])).to.equal(true);
  });

  it('should throw an error when reading a Dreamcast VMU image with an incorrect size', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(DREAMCAST_INCORRECT_SIZE_FILENAME);

    expect(() => DreamcastSaveData.createFromDreamcastData(arrayBuffer).to.throw(
      Error,
      'This does not appear to be a Dreamcast VMU image',
    ));
  });

  it('should correctly read a Dreamcast VMU image with a game and a data file', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(DREAMCAST_GAME_AND_DATA_FILENAME);
    const rawArrayBuffers = await Promise.all(DREAMCAST_GAME_AND_DATA_SAVE_FILENAME.map((n) => ArrayBufferUtil.readArrayBuffer(n)));

    const dreamcastSaveData = DreamcastSaveData.createFromDreamcastData(arrayBuffer);

    expect(dreamcastSaveData.getVolumeInfo().useCustomColor).to.equal(true);
    expect(dreamcastSaveData.getVolumeInfo().customColor.blue).to.equal(255);
    expect(dreamcastSaveData.getVolumeInfo().customColor.green).to.equal(255);
    expect(dreamcastSaveData.getVolumeInfo().customColor.red).to.equal(255);
    expect(dreamcastSaveData.getVolumeInfo().customColor.alpha).to.equal(255);
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getVolumeInfo().timestamp)).to.equal('1998-11-27 00:00:58');
    expect(dreamcastSaveData.getVolumeInfo().largestBlockNumber).to.equal(DreamcastBasics.NUM_BLOCKS - 1);
    expect(dreamcastSaveData.getVolumeInfo().partitionNumber).to.equal(0);
    expect(dreamcastSaveData.getVolumeInfo().systemInfo.blockNumber).to.equal(DreamcastBasics.SYSTEM_INFO_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().systemInfo.sizeInBlocks).to.equal(DreamcastBasics.SYSTEM_INFO_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().fileAllocationTable.blockNumber).to.equal(DreamcastBasics.FILE_ALLOCATION_TABLE_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().fileAllocationTable.sizeInBlocks).to.equal(DreamcastBasics.FILE_ALLOCATION_TABLE_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().directory.blockNumber).to.equal(DreamcastBasics.DIRECTORY_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().directory.sizeInBlocks).to.equal(DreamcastBasics.DIRECTORY_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().iconShape).to.equal(0);
    expect(dreamcastSaveData.getVolumeInfo().extraArea.blockNumber).to.equal(DreamcastBasics.EXTRA_AREA_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().extraArea.sizeInBlocks).to.equal(31); // Not the usual DreamcastBasics.EXTRA_AREA_SIZE_IN_BLOCKS (41)
    expect(dreamcastSaveData.getVolumeInfo().saveArea.blockNumber).to.equal(DreamcastBasics.SAVE_AREA_BLOCK_NUMBER);
    expect(dreamcastSaveData.getVolumeInfo().saveArea.sizeInBlocks).to.equal(DreamcastBasics.SAVE_AREA_SIZE_IN_BLOCKS);
    expect(dreamcastSaveData.getVolumeInfo().gameBlock).to.equal(DreamcastBasics.DEFAULT_GAME_BLOCK);
    expect(dreamcastSaveData.getVolumeInfo().maxGameSize).to.equal(DreamcastBasics.DEFAULT_MAX_GAME_SIZE);

    expect(dreamcastSaveData.getSaveFiles().length).to.equal(2);

    expect(dreamcastSaveData.getSaveFiles()[0].fileType).to.equal('Data');
    expect(dreamcastSaveData.getSaveFiles()[0].copyProtected).to.equal(false);
    expect(dreamcastSaveData.getSaveFiles()[0].firstBlockNumber).to.equal(199);
    expect(dreamcastSaveData.getSaveFiles()[0].filename).to.equal('NAMCOMUS.SYS');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[0].fileCreationTime)).to.equal('2019-04-16 18:19:32');
    expect(dreamcastSaveData.getSaveFiles()[0].fileSizeInBlocks).to.equal(8);
    expect(dreamcastSaveData.getSaveFiles()[0].fileHeaderBlockNumber).to.equal(0);
    expect(dreamcastSaveData.getSaveFiles()[0].storageComment).to.equal('Namco Museum    ');
    expect(dreamcastSaveData.getSaveFiles()[0].fileComment).to.equal('Namco Museum High-Scores        NAMCOMUS.SYS');
    expect(ArrayUtil.arraysEqual(dreamcastSaveData.getSaveFiles()[0].blockNumberList, ArrayUtil.createReverseSequentialArray(199, 8))).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveData.getSaveFiles()[0].rawData, rawArrayBuffers[0])).to.equal(true);

    expect(dreamcastSaveData.getSaveFiles()[1].fileType).to.equal('Game');
    expect(dreamcastSaveData.getSaveFiles()[1].copyProtected).to.equal(true);
    expect(dreamcastSaveData.getSaveFiles()[1].firstBlockNumber).to.equal(0);
    expect(dreamcastSaveData.getSaveFiles()[1].filename).to.equal('PACIT_NM.VMU');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveData.getSaveFiles()[1].fileCreationTime)).to.equal('2019-04-16 18:19:41');
    expect(dreamcastSaveData.getSaveFiles()[1].fileSizeInBlocks).to.equal(9);
    expect(dreamcastSaveData.getSaveFiles()[1].fileHeaderBlockNumber).to.equal(1);
    expect(dreamcastSaveData.getSaveFiles()[1].storageComment).to.equal('PACit           ');
    expect(dreamcastSaveData.getSaveFiles()[1].fileComment).to.equal('(c) Copyright 2000 NAMCO Ltd.   ');
    expect(ArrayUtil.arraysEqual(dreamcastSaveData.getSaveFiles()[1].blockNumberList, ArrayUtil.createSequentialArray(0, 9))).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveData.getSaveFiles()[1].rawData, rawArrayBuffers[1])).to.equal(true);
  });

  it('should correctly create a Dreamcast VMU image containing a game and a data file', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(RECREATED_DREAMCAST_GAME_AND_DATA_FILENAME);
    const rawArrayBuffers = await Promise.all(DREAMCAST_GAME_AND_DATA_SAVE_FILENAME.map((n) => ArrayBufferUtil.readArrayBuffer(n)));

    const volumeInfo = {
      useCustomColor: true,
      customColor: {
        blue: 255,
        green: 255,
        red: 255,
        alpha: 255,
      },
      timestamp: new Date('1998-11-27 00:00:58'),
      iconShape: 0,
    };

    // Note that these files get reordered in the directory of the outputted file since we always put games first
    const saveFiles = [
      {
        fileType: 'Data',
        copyProtected: false,
        filename: 'NAMCOMUS.SYS',
        fileCreationTime: new Date('2019-04-16 18:19:32'),
        fileHeaderBlockNumber: 0,
        rawData: rawArrayBuffers[0],
      },
      {
        fileType: 'Game',
        copyProtected: true,
        filename: 'PACIT_NM.VMU',
        fileCreationTime: new Date('2019-04-16 18:19:41'),
        fileHeaderBlockNumber: 1,
        rawData: rawArrayBuffers[1],
      },
    ];

    const dreamcastSaveData = DreamcastSaveData.createFromSaveFiles(saveFiles, volumeInfo);

    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveData.getArrayBuffer(), arrayBuffer)).to.equal(true);
  });
});
