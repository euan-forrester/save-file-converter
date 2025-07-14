/* eslint-disable no-bitwise */

import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';
import ArrayUtil from '@/util/Array';

import GameCubeSaveData from '@/save-formats/GameCube/GameCube';
import GameCubeUtil from '@/save-formats/GameCube/Util';
import GameCubeHeader from '@/save-formats/GameCube/Components/Header';
import GameCubeDirectoryEntry from '@/save-formats/GameCube/Components/DirectoryEntry';

const DIR = './tests/data/save-formats/gamecube';

const EMPTY_ASCII_FILENAME = `${DIR}/usa-empty-0251b-16mb.raw`;
const EMPTY_SHIFT_JIS_FILENAME = `${DIR}/jpn-empty-0251b-16mb.raw`;
const EMPTY_CARDS_FLASH_ID = Buffer.from('000000000000000000000000', 'hex');

const MEMCARD_FLASH_ID = Buffer.from('ddc9f91faad6bb8dfe35f8c5', 'hex');
const MEMCARD_IMAGE_FILENAME = `${DIR}/memcard-image.raw`;
const MEMCARD_IMAGE_RECREATED_FILENAME = `${DIR}/memcard-image-recreated.raw`;
const MEMCARD_IMAGE_RECREATED_RESIZED_FILENAME = `${DIR}/memcard-image-recreated-resized.raw`;
const MEMCARD_IMAGE_RECREATED_FZERO_FILENAME = `${DIR}/memcard-image-recreated-fzero.raw`;
const MEMCARD_IMAGE_RECREATED_FZERO_NO_SERIAL_FILENAME = `${DIR}/memcard-image-recreated-fzero-no-serial.raw`;
const NEW_MEMCARD_IMAGE_NO_SERIAL_FILENAME = `${DIR}/memcard-image-empty-no-serial.raw`;
const MEMCARD_SAVE_FILENAME = [
  `${DIR}/memcard-image-0.bin`,
  `${DIR}/memcard-image-1.bin`,
  `${DIR}/memcard-image-2.bin`,
  `${DIR}/memcard-image-3.bin`,
  `${DIR}/memcard-image-4.bin`,
  `${DIR}/memcard-image-5.bin`,
  `${DIR}/memcard-image-6.bin`,
  `${DIR}/memcard-image-7.bin`,
  `${DIR}/memcard-image-8.bin`,
  `${DIR}/memcard-image-9.bin`,
];

const DIFFERENT_MEMCARD_FLASH_ID = Buffer.from('ddc9f91faad6bb8dfe35f8c6', 'hex'); // Just different from MEMCARD_FLASH_ID by a single digit
const NEW_MEMCARD_IMAGE_SAME_FLASH_ID = `${DIR}/mine-same-flash-id.raw`;
const NEW_MEMCARD_IMAGE_SAME_FLASH_ID_DIFFERENT_DATE = `${DIR}/mine-same-flash-id-different-date.raw`;
const NEW_MEMCARD_IMAGE_DIFFERENT_FLASH_ID = `${DIR}/mine-different-flash-id.raw`;
const NEW_MEMCARD_IMAGE_DIFFERENT_FLASH_ID_DIFFERENT_DATE = `${DIR}/mine-different-flash-id-different-date.raw`;

const NINTENDONT_JAPANESE_MEMCARD = `${DIR}/memcard-image-japan-nintendont.raw`;

describe('GameCube', () => {
  it('should correctly read an empty ASCII GameCube file', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMPTY_ASCII_FILENAME);

    const gameCubeSaveData = GameCubeSaveData.createFromGameCubeData(arrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getVolumeInfo().cardFlashId, EMPTY_CARDS_FLASH_ID)).to.equal(true);
    expect(gameCubeSaveData.getVolumeInfo().formatTime.toUTCString()).to.equal('Tue, 25 Aug 2020 17:46:54 GMT');
    expect(gameCubeSaveData.getVolumeInfo().formatOsTimeCode).to.equal(26393558999715977n);
    expect(gameCubeSaveData.getVolumeInfo().rtcBias).to.equal(0xFD39262); // This appears to be 6 seconds
    expect(gameCubeSaveData.getVolumeInfo().language).to.equal('English');
    expect(gameCubeSaveData.getVolumeInfo().viDtvStatus).to.equal(0);
    expect(gameCubeSaveData.getVolumeInfo().memcardSlot).to.equal(GameCubeHeader.MEMCARD_SLOT_A);
    expect(gameCubeSaveData.getVolumeInfo().memcardSizeMegabits).to.equal(16);
    expect(gameCubeSaveData.getVolumeInfo().encodingString).to.equal('US-ASCII');
    expect(gameCubeSaveData.getVolumeInfo().numTotalBlocks).to.equal(251);
    expect(gameCubeSaveData.getVolumeInfo().numUsedBlocks).to.equal(0);
    expect(gameCubeSaveData.getVolumeInfo().numFreeBlocks).to.equal(251);
    expect(gameCubeSaveData.getVolumeInfo().lastAllocatedBlock).to.equal(6);

    expect(gameCubeSaveData.getSaveFiles().length).to.equal(0); // Note that there is an entry in the main directory, but the backup directory is empty and has a higher update counter
  });

  it('should correctly read an empty shift-jis GameCube file', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMPTY_SHIFT_JIS_FILENAME);

    const gameCubeSaveData = GameCubeSaveData.createFromGameCubeData(arrayBuffer);

    expect(gameCubeSaveData.getSaveFiles().length).to.equal(0);

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getVolumeInfo().cardFlashId, EMPTY_CARDS_FLASH_ID)).to.equal(true);
    expect(gameCubeSaveData.getVolumeInfo().formatTime.toUTCString()).to.equal('Tue, 07 Sep 2021 20:52:11 GMT');
    expect(gameCubeSaveData.getVolumeInfo().formatOsTimeCode).to.equal(27716706806048775n);
    expect(gameCubeSaveData.getVolumeInfo().rtcBias).to.equal(0xE8D9F980); // This appears to be 96 seconds
    expect(gameCubeSaveData.getVolumeInfo().language).to.equal('English');
    expect(gameCubeSaveData.getVolumeInfo().viDtvStatus).to.equal(3);
    expect(gameCubeSaveData.getVolumeInfo().memcardSlot).to.equal(GameCubeHeader.MEMCARD_SLOT_A);
    expect(gameCubeSaveData.getVolumeInfo().memcardSizeMegabits).to.equal(16);
    expect(gameCubeSaveData.getVolumeInfo().encodingString).to.equal('shift-jis');
    expect(gameCubeSaveData.getVolumeInfo().numTotalBlocks).to.equal(251);
    expect(gameCubeSaveData.getVolumeInfo().numUsedBlocks).to.equal(0);
    expect(gameCubeSaveData.getVolumeInfo().numFreeBlocks).to.equal(251);
    expect(gameCubeSaveData.getVolumeInfo().lastAllocatedBlock).to.equal(4);
  });

  it('should correctly read a GameCube file with 10 saves', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEMCARD_IMAGE_FILENAME);
    const rawArrayBuffers = await Promise.all(MEMCARD_SAVE_FILENAME.map((n) => ArrayBufferUtil.readArrayBuffer(n)));

    const gameCubeSaveData = GameCubeSaveData.createFromGameCubeData(arrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getVolumeInfo().cardFlashId, MEMCARD_FLASH_ID)).to.equal(true);
    expect(gameCubeSaveData.getVolumeInfo().formatTime.toUTCString()).to.equal('Thu, 15 Feb 2001 00:48:05 GMT');
    expect(gameCubeSaveData.getVolumeInfo().formatOsTimeCode).to.equal(1438288056135933n);
    expect(gameCubeSaveData.getVolumeInfo().rtcBias).to.equal(0);
    expect(gameCubeSaveData.getVolumeInfo().language).to.equal('English');
    expect(gameCubeSaveData.getVolumeInfo().viDtvStatus).to.equal(0);
    expect(gameCubeSaveData.getVolumeInfo().memcardSlot).to.equal(GameCubeHeader.MEMCARD_SLOT_A);
    expect(gameCubeSaveData.getVolumeInfo().memcardSizeMegabits).to.equal(16);
    expect(gameCubeSaveData.getVolumeInfo().encodingString).to.equal('US-ASCII');
    expect(gameCubeSaveData.getVolumeInfo().numTotalBlocks).to.equal(251);
    expect(gameCubeSaveData.getVolumeInfo().numUsedBlocks).to.equal(60);
    expect(gameCubeSaveData.getVolumeInfo().numFreeBlocks).to.equal(191);
    expect(gameCubeSaveData.getVolumeInfo().lastAllocatedBlock).to.equal(130);

    expect(gameCubeSaveData.getSaveFiles().length).to.equal(10);

    expect(gameCubeSaveData.getSaveFiles()[0].gameCode).to.equal('GMSE'); // Super Mario Sunshine
    expect(gameCubeSaveData.getSaveFiles()[0].region).to.equal('North America');
    expect(gameCubeSaveData.getSaveFiles()[0].publisherCode).to.equal('01');
    expect(gameCubeSaveData.getSaveFiles()[0].bannerAndIconFlags).to.equal(0x01);
    expect(gameCubeSaveData.getSaveFiles()[0].fileName).to.equal('super_mario_sunshine');
    expect(gameCubeSaveData.getSaveFiles()[0].dateLastModified.toUTCString()).to.equal('Sun, 23 May 2004 22:38:54 GMT');
    expect(gameCubeSaveData.getSaveFiles()[0].iconStartOffset).to.equal(68);
    expect(gameCubeSaveData.getSaveFiles()[0].iconFormatCode).to.equal(0x05);
    expect(gameCubeSaveData.getSaveFiles()[0].iconSpeedCode).to.equal(0xF);
    expect(gameCubeSaveData.getSaveFiles()[0].permissionAttributeBitfield).to.equal(GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveData.getSaveFiles()[0].copyCounter).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[0].saveStartBlock).to.equal(5);
    expect(gameCubeSaveData.getSaveFiles()[0].saveSizeBlocks).to.equal(7);
    expect(ArrayUtil.arraysEqual(gameCubeSaveData.getSaveFiles()[0].blockNumberList, ArrayUtil.createSequentialArray(5, 7))).to.equal(true);
    expect(gameCubeSaveData.getSaveFiles()[0].commentStart).to.equal(4);
    expect(gameCubeSaveData.getSaveFiles()[0].comments[0]).to.equal('Super Mario Sunshine');
    expect(gameCubeSaveData.getSaveFiles()[0].comments[1]).to.equal('5/23 Save Data');
    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getSaveFiles()[0].rawData, rawArrayBuffers[0])).to.equal(true);

    expect(gameCubeSaveData.getSaveFiles()[1].gameCode).to.equal('GN3E'); // NHL Hitz 20-03
    expect(gameCubeSaveData.getSaveFiles()[1].region).to.equal('North America');
    expect(gameCubeSaveData.getSaveFiles()[1].publisherCode).to.equal('5D');
    expect(gameCubeSaveData.getSaveFiles()[1].bannerAndIconFlags).to.equal(0x00);
    expect(gameCubeSaveData.getSaveFiles()[1].fileName).to.equal('hitz20-03.db');
    expect(gameCubeSaveData.getSaveFiles()[1].dateLastModified.toUTCString()).to.equal('Sat, 27 Sep 2003 21:13:16 GMT');
    expect(gameCubeSaveData.getSaveFiles()[1].iconStartOffset).to.equal(64);
    expect(gameCubeSaveData.getSaveFiles()[1].iconFormatCode).to.equal(0x02);
    expect(gameCubeSaveData.getSaveFiles()[1].iconSpeedCode).to.equal(GameCubeDirectoryEntry.ICON_SPEED_SLOW);
    expect(gameCubeSaveData.getSaveFiles()[1].permissionAttributeBitfield).to.equal(GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveData.getSaveFiles()[1].copyCounter).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[1].saveStartBlock).to.equal(12);
    expect(gameCubeSaveData.getSaveFiles()[1].saveSizeBlocks).to.equal(8);
    expect(ArrayUtil.arraysEqual(gameCubeSaveData.getSaveFiles()[1].blockNumberList, ArrayUtil.createSequentialArray(12, 8))).to.equal(true);
    expect(gameCubeSaveData.getSaveFiles()[1].commentStart).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[1].comments[0]).to.equal('Hitz 2003');
    expect(gameCubeSaveData.getSaveFiles()[1].comments[1]).to.equal('Settings and User File');
    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getSaveFiles()[1].rawData, rawArrayBuffers[1])).to.equal(true);

    expect(gameCubeSaveData.getSaveFiles()[2].gameCode).to.equal('GIKE'); // Ikaruga
    expect(gameCubeSaveData.getSaveFiles()[2].region).to.equal('North America');
    expect(gameCubeSaveData.getSaveFiles()[2].publisherCode).to.equal('70');
    expect(gameCubeSaveData.getSaveFiles()[2].bannerAndIconFlags).to.equal(0x06);
    expect(gameCubeSaveData.getSaveFiles()[2].fileName).to.equal('ikaruga_save_data');
    expect(gameCubeSaveData.getSaveFiles()[2].dateLastModified.toUTCString()).to.equal('Wed, 01 Oct 2003 21:22:40 GMT');
    expect(gameCubeSaveData.getSaveFiles()[2].iconStartOffset).to.equal(64);
    expect(gameCubeSaveData.getSaveFiles()[2].iconFormatCode).to.equal(0xAA);
    expect(gameCubeSaveData.getSaveFiles()[2].iconSpeedCode).to.equal(0xFF);
    expect(gameCubeSaveData.getSaveFiles()[2].permissionAttributeBitfield).to.equal(GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveData.getSaveFiles()[2].copyCounter).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[2].saveStartBlock).to.equal(20);
    expect(gameCubeSaveData.getSaveFiles()[2].saveSizeBlocks).to.equal(4);
    expect(ArrayUtil.arraysEqual(gameCubeSaveData.getSaveFiles()[2].blockNumberList, ArrayUtil.createSequentialArray(20, 4))).to.equal(true);
    expect(gameCubeSaveData.getSaveFiles()[2].commentStart).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[2].comments[0]).to.equal('IKARUGA\n');
    expect(gameCubeSaveData.getSaveFiles()[2].comments[1]).to.equal('10/01/2003 21:22:38');
    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getSaveFiles()[2].rawData, rawArrayBuffers[2])).to.equal(true);

    expect(gameCubeSaveData.getSaveFiles()[3].gameCode).to.equal('GEDE'); // Eternal Darkness
    expect(gameCubeSaveData.getSaveFiles()[3].region).to.equal('North America');
    expect(gameCubeSaveData.getSaveFiles()[3].publisherCode).to.equal('01');
    expect(gameCubeSaveData.getSaveFiles()[3].bannerAndIconFlags).to.equal(0x01);
    expect(gameCubeSaveData.getSaveFiles()[3].fileName).to.equal('Eternal Darkness');
    expect(gameCubeSaveData.getSaveFiles()[3].dateLastModified.toUTCString()).to.equal('Mon, 26 Apr 2004 23:02:32 GMT');
    expect(gameCubeSaveData.getSaveFiles()[3].iconStartOffset).to.equal(64);
    expect(gameCubeSaveData.getSaveFiles()[3].iconFormatCode).to.equal(0x01);
    expect(gameCubeSaveData.getSaveFiles()[3].iconSpeedCode).to.equal(GameCubeDirectoryEntry.ICON_SPEED_SLOW);
    expect(gameCubeSaveData.getSaveFiles()[3].permissionAttributeBitfield).to.equal(GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveData.getSaveFiles()[3].copyCounter).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[3].saveStartBlock).to.equal(24);
    expect(gameCubeSaveData.getSaveFiles()[3].saveSizeBlocks).to.equal(15);
    expect(ArrayUtil.arraysEqual(gameCubeSaveData.getSaveFiles()[3].blockNumberList, ArrayUtil.createSequentialArray(24, 15))).to.equal(true);
    expect(gameCubeSaveData.getSaveFiles()[3].commentStart).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[3].comments[0]).to.equal('Eternal Darkness');
    expect(gameCubeSaveData.getSaveFiles()[3].comments[1]).to.equal('Game file');
    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getSaveFiles()[3].rawData, rawArrayBuffers[3])).to.equal(true);

    expect(gameCubeSaveData.getSaveFiles()[4].gameCode).to.equal('GRSE'); // Soul Calibur 2
    expect(gameCubeSaveData.getSaveFiles()[4].region).to.equal('North America');
    expect(gameCubeSaveData.getSaveFiles()[4].publisherCode).to.equal('AF');
    expect(gameCubeSaveData.getSaveFiles()[4].bannerAndIconFlags).to.equal(0x05);
    expect(gameCubeSaveData.getSaveFiles()[4].fileName).to.equal('sc2_0.dat');
    expect(gameCubeSaveData.getSaveFiles()[4].dateLastModified.toUTCString()).to.equal('Tue, 14 Dec 2004 23:09:17 GMT');
    expect(gameCubeSaveData.getSaveFiles()[4].iconStartOffset).to.equal(64);
    expect(gameCubeSaveData.getSaveFiles()[4].iconFormatCode).to.equal(0x5555);
    expect(gameCubeSaveData.getSaveFiles()[4].iconSpeedCode).to.equal(0xAAAF);
    expect(gameCubeSaveData.getSaveFiles()[4].permissionAttributeBitfield).to.equal(GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveData.getSaveFiles()[4].copyCounter).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[4].saveStartBlock).to.equal(39);
    expect(gameCubeSaveData.getSaveFiles()[4].saveSizeBlocks).to.equal(4);
    expect(ArrayUtil.arraysEqual(gameCubeSaveData.getSaveFiles()[4].blockNumberList, ArrayUtil.createSequentialArray(39, 4))).to.equal(true);
    expect(gameCubeSaveData.getSaveFiles()[4].commentStart).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[4].comments[0]).to.equal('SOULCALIBUR2 game data');
    expect(gameCubeSaveData.getSaveFiles()[4].comments[1]).to.equal(' 2004.12.14 23:09:16');
    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getSaveFiles()[4].rawData, rawArrayBuffers[4])).to.equal(true);

    expect(gameCubeSaveData.getSaveFiles()[5].gameCode).to.equal('GH2E'); // Need for Speed: Hot Pursuit 2
    expect(gameCubeSaveData.getSaveFiles()[5].region).to.equal('North America');
    expect(gameCubeSaveData.getSaveFiles()[5].publisherCode).to.equal('69');
    expect(gameCubeSaveData.getSaveFiles()[5].bannerAndIconFlags).to.equal(0x02);
    expect(gameCubeSaveData.getSaveFiles()[5].fileName).to.equal('Euan');
    expect(gameCubeSaveData.getSaveFiles()[5].dateLastModified.toUTCString()).to.equal('Sun, 12 Dec 2004 23:42:32 GMT');
    expect(gameCubeSaveData.getSaveFiles()[5].iconStartOffset).to.equal(64);
    expect(gameCubeSaveData.getSaveFiles()[5].iconFormatCode).to.equal(0xA);
    expect(gameCubeSaveData.getSaveFiles()[5].iconSpeedCode).to.equal(0xA);
    expect(gameCubeSaveData.getSaveFiles()[5].permissionAttributeBitfield).to.equal(GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveData.getSaveFiles()[5].copyCounter).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[5].saveStartBlock).to.equal(57);
    expect(gameCubeSaveData.getSaveFiles()[5].saveSizeBlocks).to.equal(7);
    expect(ArrayUtil.arraysEqual(gameCubeSaveData.getSaveFiles()[5].blockNumberList, ArrayUtil.createSequentialArray(57, 7))).to.equal(true);
    expect(gameCubeSaveData.getSaveFiles()[5].commentStart).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[5].comments[0]).to.equal('NFS: HP2');
    expect(gameCubeSaveData.getSaveFiles()[5].comments[1]).to.equal('Euan');
    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getSaveFiles()[5].rawData, rawArrayBuffers[5])).to.equal(true);

    expect(gameCubeSaveData.getSaveFiles()[6].gameCode).to.equal('G4SE'); // The Legend of Zelda: Four Swords Adventures
    expect(gameCubeSaveData.getSaveFiles()[6].region).to.equal('North America');
    expect(gameCubeSaveData.getSaveFiles()[6].publisherCode).to.equal('01');
    expect(gameCubeSaveData.getSaveFiles()[6].bannerAndIconFlags).to.equal(0x01);
    expect(gameCubeSaveData.getSaveFiles()[6].fileName).to.equal('gc4sword');
    expect(gameCubeSaveData.getSaveFiles()[6].dateLastModified.toUTCString()).to.equal('Tue, 28 Dec 2049 20:38:08 GMT');
    expect(gameCubeSaveData.getSaveFiles()[6].iconStartOffset).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[6].iconFormatCode).to.equal(0x1);
    expect(gameCubeSaveData.getSaveFiles()[6].iconSpeedCode).to.equal(GameCubeDirectoryEntry.ICON_SPEED_SLOW);
    expect(gameCubeSaveData.getSaveFiles()[6].permissionAttributeBitfield).to.equal(GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveData.getSaveFiles()[6].copyCounter).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[6].saveStartBlock).to.equal(64);
    expect(gameCubeSaveData.getSaveFiles()[6].saveSizeBlocks).to.equal(3);
    expect(ArrayUtil.arraysEqual(gameCubeSaveData.getSaveFiles()[6].blockNumberList, ArrayUtil.createSequentialArray(64, 3))).to.equal(true);
    expect(gameCubeSaveData.getSaveFiles()[6].commentStart).to.equal(7168);
    expect(gameCubeSaveData.getSaveFiles()[6].comments[0]).to.equal('Four Swords Adventures');
    expect(gameCubeSaveData.getSaveFiles()[6].comments[1]).to.equal('12/28 Save Data');
    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getSaveFiles()[6].rawData, rawArrayBuffers[6])).to.equal(true);

    expect(gameCubeSaveData.getSaveFiles()[7].gameCode).to.equal('GF7E'); // Star Fox: Assault
    expect(gameCubeSaveData.getSaveFiles()[7].region).to.equal('North America');
    expect(gameCubeSaveData.getSaveFiles()[7].publisherCode).to.equal('01');
    expect(gameCubeSaveData.getSaveFiles()[7].bannerAndIconFlags).to.equal(0x05);
    expect(gameCubeSaveData.getSaveFiles()[7].fileName).to.equal('starfox.dat');
    expect(gameCubeSaveData.getSaveFiles()[7].dateLastModified.toUTCString()).to.equal('Tue, 28 Dec 2049 03:56:17 GMT');
    expect(gameCubeSaveData.getSaveFiles()[7].iconStartOffset).to.equal(64);
    expect(gameCubeSaveData.getSaveFiles()[7].iconFormatCode).to.equal(0x15);
    expect(gameCubeSaveData.getSaveFiles()[7].iconSpeedCode).to.equal(0x3F);
    expect(gameCubeSaveData.getSaveFiles()[7].permissionAttributeBitfield).to.equal(GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveData.getSaveFiles()[7].copyCounter).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[7].saveStartBlock).to.equal(123);
    expect(gameCubeSaveData.getSaveFiles()[7].saveSizeBlocks).to.equal(5);
    expect(ArrayUtil.arraysEqual(gameCubeSaveData.getSaveFiles()[7].blockNumberList, ArrayUtil.createSequentialArray(123, 5))).to.equal(true);
    expect(gameCubeSaveData.getSaveFiles()[7].commentStart).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[7].comments[0]).to.equal('STAR FOX: ASSAULT');
    expect(gameCubeSaveData.getSaveFiles()[7].comments[1]).to.equal('12/28/2049 03:56:16');
    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getSaveFiles()[7].rawData, rawArrayBuffers[7])).to.equal(true);

    expect(gameCubeSaveData.getSaveFiles()[8].gameCode).to.equal('GFZE'); // F-Zero GX
    expect(gameCubeSaveData.getSaveFiles()[8].region).to.equal('North America');
    expect(gameCubeSaveData.getSaveFiles()[8].publisherCode).to.equal('8P');
    expect(gameCubeSaveData.getSaveFiles()[8].bannerAndIconFlags).to.equal(0x02);
    expect(gameCubeSaveData.getSaveFiles()[8].fileName).to.equal('f_zero.dat');
    expect(gameCubeSaveData.getSaveFiles()[8].dateLastModified.toUTCString()).to.equal('Fri, 24 Dec 2049 11:20:49 GMT');
    expect(gameCubeSaveData.getSaveFiles()[8].iconStartOffset).to.equal(96);
    expect(gameCubeSaveData.getSaveFiles()[8].iconFormatCode).to.equal(0x02);
    expect(gameCubeSaveData.getSaveFiles()[8].iconSpeedCode).to.equal(GameCubeDirectoryEntry.ICON_SPEED_SLOW);
    expect(gameCubeSaveData.getSaveFiles()[8].permissionAttributeBitfield).to.equal(
      GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC
      | GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_NO_COPY
      | GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_NO_MOVE,
    );
    expect(gameCubeSaveData.getSaveFiles()[8].copyCounter).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[8].saveStartBlock).to.equal(119);
    expect(gameCubeSaveData.getSaveFiles()[8].saveSizeBlocks).to.equal(4);
    expect(ArrayUtil.arraysEqual(gameCubeSaveData.getSaveFiles()[8].blockNumberList, ArrayUtil.createSequentialArray(119, 4))).to.equal(true);
    expect(gameCubeSaveData.getSaveFiles()[8].commentStart).to.equal(4);
    expect(gameCubeSaveData.getSaveFiles()[8].comments[0]).to.equal('F-ZERO GX');
    expect(gameCubeSaveData.getSaveFiles()[8].comments[1]).to.equal('49/12/24 Euan');
    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getSaveFiles()[8].rawData, rawArrayBuffers[8])).to.equal(true);

    expect(gameCubeSaveData.getSaveFiles()[9].gameCode).to.equal('GSWE'); // Star Wars Rogue Squadron II: Rogue Leader
    expect(gameCubeSaveData.getSaveFiles()[9].region).to.equal('North America');
    expect(gameCubeSaveData.getSaveFiles()[9].publisherCode).to.equal('64');
    expect(gameCubeSaveData.getSaveFiles()[9].bannerAndIconFlags).to.equal(0x01);
    expect(gameCubeSaveData.getSaveFiles()[9].fileName).to.equal('RogueLeader');
    expect(gameCubeSaveData.getSaveFiles()[9].dateLastModified.toUTCString()).to.equal('Tue, 28 Dec 2049 22:44:54 GMT');
    expect(gameCubeSaveData.getSaveFiles()[9].iconStartOffset).to.equal(64);
    expect(gameCubeSaveData.getSaveFiles()[9].iconFormatCode).to.equal(0x5555);
    expect(gameCubeSaveData.getSaveFiles()[9].iconSpeedCode).to.equal(0x5555);
    expect(gameCubeSaveData.getSaveFiles()[9].permissionAttributeBitfield).to.equal(GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveData.getSaveFiles()[9].copyCounter).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[9].saveStartBlock).to.equal(128);
    expect(gameCubeSaveData.getSaveFiles()[9].saveSizeBlocks).to.equal(3);
    expect(ArrayUtil.arraysEqual(gameCubeSaveData.getSaveFiles()[9].blockNumberList, ArrayUtil.createSequentialArray(128, 3))).to.equal(true);
    expect(gameCubeSaveData.getSaveFiles()[9].commentStart).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[9].comments[0]).to.equal('Star Wars: Rogue Leader');
    expect(gameCubeSaveData.getSaveFiles()[9].comments[1]).to.equal('Save Data');
    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getSaveFiles()[9].rawData, rawArrayBuffers[9])).to.equal(true);
  });

  // This image works on my physical gamecube memcard
  it('should create a GameCube file with the same flash ID', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(NEW_MEMCARD_IMAGE_SAME_FLASH_ID);

    const volumeInfo = {
      cardFlashId: MEMCARD_FLASH_ID,
      formatOsTimeCode: 1438288056135933n,
      rtcBias: 0,
      languageCode: GameCubeUtil.getLanguageCode('English'),
      viDtvStatus: 0,
      memcardSlot: GameCubeHeader.MEMCARD_SLOT_A,
      memcardSizeMegabits: 16,
      encodingCode: GameCubeUtil.getEncodingCode('US-ASCII'),
    };

    const gameCubeSaveData = GameCubeSaveData.createFromSaveFiles([], volumeInfo);

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getArrayBuffer(), arrayBuffer)).to.equal(true);
  });

  // This image works on my physical gamecube memcard
  it('should create a GameCube file with the same flash ID and different format time', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(NEW_MEMCARD_IMAGE_SAME_FLASH_ID_DIFFERENT_DATE);

    const volumeInfo = {
      cardFlashId: MEMCARD_FLASH_ID,
      formatOsTimeCode: GameCubeUtil.getOsTimeFromDate(new Date('June 26, 2019 12:00:00 GMT')),
      rtcBias: 0,
      languageCode: GameCubeUtil.getLanguageCode('English'),
      viDtvStatus: 0,
      memcardSlot: GameCubeHeader.MEMCARD_SLOT_A,
      memcardSizeMegabits: 16,
      encodingCode: GameCubeUtil.getEncodingCode('US-ASCII'),
    };

    const gameCubeSaveData = GameCubeSaveData.createFromSaveFiles([], volumeInfo);

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getArrayBuffer(), arrayBuffer)).to.equal(true);
  });

  // This image does not work on my physical gamecube memcard
  it('should create a GameCube file with a different flash ID', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(NEW_MEMCARD_IMAGE_DIFFERENT_FLASH_ID);

    const volumeInfo = {
      cardFlashId: DIFFERENT_MEMCARD_FLASH_ID,
      formatOsTimeCode: 1438288056135933n,
      rtcBias: 0,
      languageCode: GameCubeUtil.getLanguageCode('English'),
      viDtvStatus: 0,
      memcardSlot: GameCubeHeader.MEMCARD_SLOT_A,
      memcardSizeMegabits: 16,
      encodingCode: GameCubeUtil.getEncodingCode('US-ASCII'),
    };

    const gameCubeSaveData = GameCubeSaveData.createFromSaveFiles([], volumeInfo);

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getArrayBuffer(), arrayBuffer)).to.equal(true);
  });

  // This image does not work on my physical gamecube memcard
  it('should create a GameCube file with a different flash ID and different date', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(NEW_MEMCARD_IMAGE_DIFFERENT_FLASH_ID_DIFFERENT_DATE);

    const volumeInfo = {
      cardFlashId: DIFFERENT_MEMCARD_FLASH_ID,
      formatOsTimeCode: GameCubeUtil.getOsTimeFromDate(new Date('June 26, 2019 12:00:00 GMT')),
      rtcBias: 0,
      languageCode: GameCubeUtil.getLanguageCode('English'),
      viDtvStatus: 0,
      memcardSlot: GameCubeHeader.MEMCARD_SLOT_A,
      memcardSizeMegabits: 16,
      encodingCode: GameCubeUtil.getEncodingCode('US-ASCII'),
    };

    const gameCubeSaveData = GameCubeSaveData.createFromSaveFiles([], volumeInfo);

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getArrayBuffer(), arrayBuffer)).to.equal(true);
  });

  // This should be an almost-indentical image to the one read from my physical memcard. However, there are
  // some gaps in the blocks from my original card that are't present here.
  // Note in particular that the F-Zero save doesn't need to be fixed because the card serial number (format time + flash ID)
  // is the same as the card it was copied from
  it('should create a GameCube file with 10 saves', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEMCARD_IMAGE_RECREATED_FILENAME);
    const rawArrayBuffers = await Promise.all(MEMCARD_SAVE_FILENAME.map((n) => ArrayBufferUtil.readArrayBuffer(n)));

    const volumeInfo = {
      cardFlashId: MEMCARD_FLASH_ID,
      formatOsTimeCode: 1438288056135933n,
      rtcBias: 0,
      languageCode: GameCubeUtil.getLanguageCode('English'),
      viDtvStatus: 0,
      memcardSlot: GameCubeHeader.MEMCARD_SLOT_A,
      memcardSizeMegabits: 16,
      encodingCode: GameCubeUtil.getEncodingCode('US-ASCII'),
    };

    const saveFiles = [
      {
        gameCode: 'GMSE', // Super Mario Sunshine
        regionCode: GameCubeUtil.getRegionCode('North America'),
        publisherCode: '01',
        bannerAndIconFlags: 0x01,
        fileName: 'super_mario_sunshine',
        dateLastModifiedCode: GameCubeUtil.getDateCode(new Date('Sun, 23 May 2004 22:38:54 GMT')),
        iconStartOffset: 68,
        iconFormatCode: 0x05,
        iconSpeedCode: 0xF,
        permissionAttributeBitfield: GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC,
        commentStart: 4,
        rawData: rawArrayBuffers[0],
      },
      {
        gameCode: 'GN3E', // NHL Hitz 20-03
        regionCode: GameCubeUtil.getRegionCode('North America'),
        publisherCode: '5D',
        bannerAndIconFlags: 0x00,
        fileName: 'hitz20-03.db',
        dateLastModifiedCode: GameCubeUtil.getDateCode(new Date('Sat, 27 Sep 2003 21:13:16 GMT')),
        iconStartOffset: 64,
        iconFormatCode: 0x02,
        iconSpeedCode: GameCubeDirectoryEntry.ICON_SPEED_SLOW,
        permissionAttributeBitfield: GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC,
        commentStart: 0,
        rawData: rawArrayBuffers[1],
      },
      {
        gameCode: 'GIKE', // Ikaruga
        regionCode: GameCubeUtil.getRegionCode('North America'),
        publisherCode: '70',
        bannerAndIconFlags: 0x06,
        fileName: 'ikaruga_save_data',
        dateLastModifiedCode: GameCubeUtil.getDateCode(new Date('Wed, 01 Oct 2003 21:22:40 GMT')),
        iconStartOffset: 64,
        iconFormatCode: 0xAA,
        iconSpeedCode: 0xFF,
        permissionAttributeBitfield: GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC,
        commentStart: 0,
        rawData: rawArrayBuffers[2],
      },
      {
        gameCode: 'GEDE', // Eternal Darkness
        regionCode: GameCubeUtil.getRegionCode('North America'),
        publisherCode: '01',
        bannerAndIconFlags: 0x01,
        fileName: 'Eternal Darkness',
        dateLastModifiedCode: GameCubeUtil.getDateCode(new Date('Mon, 26 Apr 2004 23:02:32 GMT')),
        iconStartOffset: 64,
        iconFormatCode: 0x01,
        iconSpeedCode: GameCubeDirectoryEntry.ICON_SPEED_SLOW,
        permissionAttributeBitfield: GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC,
        commentStart: 0,
        rawData: rawArrayBuffers[3],
      },
      {
        gameCode: 'GRSE', // Soul Calibur 2
        regionCode: GameCubeUtil.getRegionCode('North America'),
        publisherCode: 'AF',
        bannerAndIconFlags: 0x05,
        fileName: 'sc2_0.dat',
        dateLastModifiedCode: GameCubeUtil.getDateCode(new Date('Tue, 14 Dec 2004 23:09:17 GMT')),
        iconStartOffset: 64,
        iconFormatCode: 0x5555,
        iconSpeedCode: 0xAAAF,
        permissionAttributeBitfield: GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC,
        commentStart: 0,
        rawData: rawArrayBuffers[4],
      },
      {
        gameCode: 'GH2E', // Need for Speed: Hot Pursuit 2
        regionCode: GameCubeUtil.getRegionCode('North America'),
        publisherCode: '69',
        bannerAndIconFlags: 0x02,
        fileName: 'Euan',
        dateLastModifiedCode: GameCubeUtil.getDateCode(new Date('Sun, 12 Dec 2004 23:42:32 GMT')),
        iconStartOffset: 64,
        iconFormatCode: 0xA,
        iconSpeedCode: 0xA,
        permissionAttributeBitfield: GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC,
        commentStart: 0,
        rawData: rawArrayBuffers[5],
      },
      {
        gameCode: 'G4SE', // The Legend of Zelda: Four Swords Adventures
        regionCode: GameCubeUtil.getRegionCode('North America'),
        publisherCode: '01',
        bannerAndIconFlags: 0x01,
        fileName: 'gc4sword',
        dateLastModifiedCode: GameCubeUtil.getDateCode(new Date('Tue, 28 Dec 2049 20:38:08 GMT')),
        iconStartOffset: 0,
        iconFormatCode: 0x1,
        iconSpeedCode: GameCubeDirectoryEntry.ICON_SPEED_SLOW,
        permissionAttributeBitfield: GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC,
        commentStart: 7168,
        rawData: rawArrayBuffers[6],
      },
      {
        gameCode: 'GF7E', // Star Fox: Assault
        regionCode: GameCubeUtil.getRegionCode('North America'),
        publisherCode: '01',
        bannerAndIconFlags: 0x05,
        fileName: 'starfox.dat',
        dateLastModifiedCode: GameCubeUtil.getDateCode(new Date('Tue, 28 Dec 2049 03:56:17 GMT')),
        iconStartOffset: 64,
        iconFormatCode: 0x15,
        iconSpeedCode: 0x3F,
        permissionAttributeBitfield: GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC,
        commentStart: 0,
        rawData: rawArrayBuffers[7],
      },
      {
        gameCode: 'GFZE', // F-Zero GX
        regionCode: GameCubeUtil.getRegionCode('North America'),
        publisherCode: '8P',
        bannerAndIconFlags: 0x02,
        fileName: 'f_zero.dat',
        dateLastModifiedCode: GameCubeUtil.getDateCode(new Date('Fri, 24 Dec 2049 11:20:49 GMT')),
        iconStartOffset: 96,
        iconFormatCode: 0x02,
        iconSpeedCode: GameCubeDirectoryEntry.ICON_SPEED_SLOW,
        permissionAttributeBitfield: GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC | GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_NO_COPY | GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_NO_MOVE,
        commentStart: 4,
        rawData: rawArrayBuffers[8],
      },
      {
        gameCode: 'GSWE', // Star Wars Rogue Squadron II: Rogue Leader
        regionCode: GameCubeUtil.getRegionCode('North America'),
        publisherCode: '64',
        bannerAndIconFlags: 0x01,
        fileName: 'RogueLeader',
        dateLastModifiedCode: GameCubeUtil.getDateCode(new Date('Tue, 28 Dec 2049 22:44:54 GMT')),
        iconStartOffset: 64,
        iconFormatCode: 0x5555,
        iconSpeedCode: 0x5555,
        permissionAttributeBitfield: GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC,
        commentStart: 0,
        rawData: rawArrayBuffers[9],
      },
    ];

    const gameCubeSaveData = GameCubeSaveData.createFromSaveFiles(saveFiles, volumeInfo);

    expect(gameCubeSaveData.getSaveFiles().length).to.equal(10);

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getArrayBuffer(), arrayBuffer)).to.equal(true);
  });

  // This image just has my F-Zero save, but with a different format time (and thus a different serial).
  // With this game, it requires that the actual save data be updated to reflect the card's serial
  it('should create a GameCube file with F-Zero and a different serial', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEMCARD_IMAGE_RECREATED_FZERO_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEMCARD_SAVE_FILENAME[8]);

    const volumeInfo = {
      cardFlashId: MEMCARD_FLASH_ID,
      formatOsTimeCode: GameCubeUtil.getOsTimeFromDate(new Date('June 26, 2019 12:00:00 GMT')), // Different date, so we get a different serial
      rtcBias: 0,
      languageCode: GameCubeUtil.getLanguageCode('English'),
      viDtvStatus: 0,
      memcardSlot: GameCubeHeader.MEMCARD_SLOT_A,
      memcardSizeMegabits: 16,
      encodingCode: GameCubeUtil.getEncodingCode('US-ASCII'),
    };

    const saveFiles = [
      {
        gameCode: 'GFZE', // F-Zero GX
        regionCode: GameCubeUtil.getRegionCode('North America'),
        publisherCode: '8P',
        bannerAndIconFlags: 0x02,
        fileName: 'f_zero.dat',
        dateLastModifiedCode: GameCubeUtil.getDateCode(new Date('Fri, 24 Dec 2049 11:20:49 GMT')),
        iconStartOffset: 96,
        iconFormatCode: 0x02,
        iconSpeedCode: GameCubeDirectoryEntry.ICON_SPEED_SLOW,
        permissionAttributeBitfield: GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC | GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_NO_COPY | GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_NO_MOVE,
        commentStart: 4,
        rawData: rawArrayBuffer,
      },
    ];

    const gameCubeSaveData = GameCubeSaveData.createFromSaveFiles(saveFiles, volumeInfo);

    expect(gameCubeSaveData.getSaveFiles().length).to.equal(1);

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getArrayBuffer(), arrayBuffer)).to.equal(true);
  });

  it('should create a GameCube file with an empty serial for the Memcard Pro GC', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(NEW_MEMCARD_IMAGE_NO_SERIAL_FILENAME);

    const volumeInfo = {
      // No cardFlashId specified
      formatOsTimeCode: 0n,
      rtcBias: 0,
      languageCode: GameCubeUtil.getLanguageCode('English'),
      viDtvStatus: 0,
      memcardSlot: GameCubeHeader.MEMCARD_SLOT_A,
      memcardSizeMegabits: 16,
      encodingCode: GameCubeUtil.getEncodingCode('US-ASCII'),
    };

    const gameCubeSaveData = GameCubeSaveData.createFromSaveFiles([], volumeInfo);

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getArrayBuffer(), arrayBuffer)).to.equal(true);
  });

  // This image just has my F-Zero save, but with no serial number so that the Memcard Pro GC will accept it
  // With this game, it requires that the actual save data be updated to reflect the card's serial
  it('should create a GameCube file with F-Zero and an empty serial for the Memcard Pro GC', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEMCARD_IMAGE_RECREATED_FZERO_NO_SERIAL_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEMCARD_SAVE_FILENAME[8]);

    const volumeInfo = {
      // No cardFlashId specified
      formatOsTimeCode: GameCubeUtil.getOsTimeFromDate(new Date('July 14, 2025 12:00:00 GMT')),
      rtcBias: 0,
      languageCode: GameCubeUtil.getLanguageCode('English'),
      viDtvStatus: 0,
      memcardSlot: GameCubeHeader.MEMCARD_SLOT_A,
      memcardSizeMegabits: 16,
      encodingCode: GameCubeUtil.getEncodingCode('US-ASCII'),
    };

    const saveFiles = [
      {
        gameCode: 'GFZE', // F-Zero GX
        regionCode: GameCubeUtil.getRegionCode('North America'),
        publisherCode: '8P',
        bannerAndIconFlags: 0x02,
        fileName: 'f_zero.dat',
        dateLastModifiedCode: GameCubeUtil.getDateCode(new Date('Fri, 24 Dec 2049 11:20:49 GMT')),
        iconStartOffset: 96,
        iconFormatCode: 0x02,
        iconSpeedCode: GameCubeDirectoryEntry.ICON_SPEED_SLOW,
        permissionAttributeBitfield: GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC | GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_NO_COPY | GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_NO_MOVE,
        commentStart: 4,
        rawData: rawArrayBuffer,
      },
    ];

    const gameCubeSaveData = GameCubeSaveData.createFromSaveFiles(saveFiles, volumeInfo);

    expect(gameCubeSaveData.getSaveFiles().length).to.equal(1);

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getArrayBuffer(), arrayBuffer)).to.equal(true);
  });

  it('should resize a GameCube file with 10 saves', async () => {
    // There are a handful of differences between the 2 memcard images:
    // - Different size indicated in header
    // - Different checksums in header as result of different size
    // - Different num blocks remaining indicated in block allocation table (and the backup copy of this table)
    // - Different checksums in the block allocation table and backup as a result of different num blocks remaining
    // - Extra empty data at the end of the larger image

    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEMCARD_IMAGE_RECREATED_FILENAME);
    const arrayBufferResized = await ArrayBufferUtil.readArrayBuffer(MEMCARD_IMAGE_RECREATED_RESIZED_FILENAME);

    const gameCubeSaveData = GameCubeSaveData.createFromGameCubeData(arrayBuffer);

    const gameCubeDataResized = GameCubeSaveData.createWithNewSize(gameCubeSaveData, 8388608); // 64 megabits/1019 blocks

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeDataResized.getArrayBuffer(), arrayBufferResized)).to.equal(true);
  });

  it('should load a GameCube file that works for a Japanese game in Nintendont', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(NINTENDONT_JAPANESE_MEMCARD);

    const gameCubeSaveData = GameCubeSaveData.createFromGameCubeData(arrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getVolumeInfo().cardFlashId, EMPTY_CARDS_FLASH_ID)).to.equal(true);
    expect(gameCubeSaveData.getVolumeInfo().formatTime.toUTCString()).to.equal('Sat, 01 Jan 2000 00:00:19 GMT'); // 19 seconds after epoch
    expect(gameCubeSaveData.getVolumeInfo().formatOsTimeCode).to.equal(779957113n);
    expect(gameCubeSaveData.getVolumeInfo().rtcBias).to.equal(0);
    expect(gameCubeSaveData.getVolumeInfo().language).to.equal('English');
    expect(gameCubeSaveData.getVolumeInfo().viDtvStatus).to.equal(0);
    expect(gameCubeSaveData.getVolumeInfo().memcardSlot).to.equal(GameCubeHeader.MEMCARD_SLOT_A);
    expect(gameCubeSaveData.getVolumeInfo().memcardSizeMegabits).to.equal(16);
    expect(gameCubeSaveData.getVolumeInfo().encodingString).to.equal('shift-jis');
    expect(gameCubeSaveData.getVolumeInfo().numTotalBlocks).to.equal(251);
    expect(gameCubeSaveData.getVolumeInfo().numUsedBlocks).to.equal(2);
    expect(gameCubeSaveData.getVolumeInfo().numFreeBlocks).to.equal(249);
    expect(gameCubeSaveData.getVolumeInfo().lastAllocatedBlock).to.equal(6);

    expect(gameCubeSaveData.getSaveFiles().length).to.equal(1);
  });
});
