import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';
import HexUtil from '#/util/Hex';

import GameCubeSaveData from '@/save-formats/GameCube/GameCube';
import GameCubeUtil from '@/save-formats/GameCube/Util';
import GameCubeHeader from '@/save-formats/GameCube/Components/Header';
import GameCubeDirectoryEntry from '@/save-formats/GameCube/Components/DirectoryEntry';

const DIR = './tests/data/save-formats/gamecube';

const EMPTY_ASCII_FILENAME = `${DIR}/usa-empty-0251b-16mb.raw`;
const EMPTY_SHIFT_JIS_FILENAME = `${DIR}/jpn-empty-0251b-16mb.raw`;
const EMPTY_CARDS_FLASH_ID = HexUtil.hexToArrayBuffer('000000000000000000000000');

const MEMCARD_IMAGE = `${DIR}/0251b_2025_04Apr_30_13-22-17.raw`;
const MEMCARD_FLASH_ID = HexUtil.hexToArrayBuffer('ddc9f91faad6bb8dfe35f8c5');

const NEW_MEMCARD_IMAGE_SAME_FLASH_ID = `${DIR}/mine-same-flash-id.raw`;
const NEW_MEMCARD_IMAGE_SAME_FLASH_ID_DIFFERENT_DATE = `${DIR}/mine-same-flash-id-different-date.raw`;
const NEW_MEMCARD_IMAGE_DIFFERENT_FLASH_ID = `${DIR}/mine-different-flash-id.raw`;
const NEW_MEMCARD_IMAGE_DIFFERENT_FLASH_ID_DIFFERENT_DATE = `${DIR}/mine-different-flash-id-different-date.raw`;
const DIFFERENT_MEMCARD_FLASH_ID = HexUtil.hexToArrayBuffer('ddc9f91faad6bb8dfe35f8c6');

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
    expect(gameCubeSaveData.getVolumeInfo().numFreeBlocks).to.equal(251);
    expect(gameCubeSaveData.getVolumeInfo().lastAllocatedBlock).to.equal(4);
  });

  it('should correctly a GameCube file with 10 saves', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEMCARD_IMAGE);

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
    expect(gameCubeSaveData.getVolumeInfo().numFreeBlocks).to.equal(191);
    expect(gameCubeSaveData.getVolumeInfo().lastAllocatedBlock).to.equal(130);

    expect(gameCubeSaveData.getSaveFiles().length).to.equal(10);

    expect(gameCubeSaveData.getSaveFiles()[0].gameCode).to.equal('GMSE'); // Super Mario Sunshine
    expect(gameCubeSaveData.getSaveFiles()[0].region).to.equal('North America');
    expect(gameCubeSaveData.getSaveFiles()[0].publisherCode).to.equal('01');
    expect(gameCubeSaveData.getSaveFiles()[0].bannerAndIconFlags).to.equal(0x01);
    expect(gameCubeSaveData.getSaveFiles()[0].fileName).to.equal('super_mario_sunshine');
    expect(gameCubeSaveData.getSaveFiles()[0].dateLastModified.toUTCString()).to.equal('Sun, 23 May 2004 22:38:54 GMT');
    expect(gameCubeSaveData.getSaveFiles()[0].iconOffset).to.equal(116);
    expect(gameCubeSaveData.getSaveFiles()[0].iconFormatCode).to.equal(0x05);
    expect(gameCubeSaveData.getSaveFiles()[0].iconSpeedCode).to.equal(0xF);
    expect(gameCubeSaveData.getSaveFiles()[0].permissionAttributeBitfield).to.equal(GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveData.getSaveFiles()[0].copyCounter).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[0].saveStartBlock).to.equal(5);
    expect(gameCubeSaveData.getSaveFiles()[0].saveSizeBlocks).to.equal(7);
    expect(gameCubeSaveData.getSaveFiles()[0].commentStart).to.equal(4);
    expect(gameCubeSaveData.getSaveFiles()[0].comments[0]).to.equal('');
    expect(gameCubeSaveData.getSaveFiles()[0].comments[1]).to.equal('');

    expect(gameCubeSaveData.getSaveFiles()[1].gameCode).to.equal('GN3E'); // NHL Hitz 20-03
    expect(gameCubeSaveData.getSaveFiles()[1].region).to.equal('North America');
    expect(gameCubeSaveData.getSaveFiles()[1].publisherCode).to.equal('5D');
    expect(gameCubeSaveData.getSaveFiles()[1].bannerAndIconFlags).to.equal(0x00);
    expect(gameCubeSaveData.getSaveFiles()[1].fileName).to.equal('hitz20-03.db');
    expect(gameCubeSaveData.getSaveFiles()[1].dateLastModified.toUTCString()).to.equal('Sat, 27 Sep 2003 21:13:16 GMT');
    expect(gameCubeSaveData.getSaveFiles()[1].iconOffset).to.equal(112);
    expect(gameCubeSaveData.getSaveFiles()[1].iconFormatCode).to.equal(0x02);
    expect(gameCubeSaveData.getSaveFiles()[1].iconSpeedCode).to.equal(GameCubeDirectoryEntry.ICON_SPEED_SLOW);
    expect(gameCubeSaveData.getSaveFiles()[1].permissionAttributeBitfield).to.equal(GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveData.getSaveFiles()[1].copyCounter).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[1].saveStartBlock).to.equal(12);
    expect(gameCubeSaveData.getSaveFiles()[1].saveSizeBlocks).to.equal(8);
    expect(gameCubeSaveData.getSaveFiles()[1].commentStart).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[1].comments[0]).to.equal('');
    expect(gameCubeSaveData.getSaveFiles()[1].comments[1]).to.equal('');

    expect(gameCubeSaveData.getSaveFiles()[2].gameCode).to.equal('GIKE'); // Ikaruga
    expect(gameCubeSaveData.getSaveFiles()[2].region).to.equal('North America');
    expect(gameCubeSaveData.getSaveFiles()[2].publisherCode).to.equal('70');
    expect(gameCubeSaveData.getSaveFiles()[2].bannerAndIconFlags).to.equal(0x06);
    expect(gameCubeSaveData.getSaveFiles()[2].fileName).to.equal('ikaruga_save_data');
    expect(gameCubeSaveData.getSaveFiles()[2].dateLastModified.toUTCString()).to.equal('Wed, 01 Oct 2003 21:22:40 GMT');
    expect(gameCubeSaveData.getSaveFiles()[2].iconOffset).to.equal(112);
    expect(gameCubeSaveData.getSaveFiles()[2].iconFormatCode).to.equal(0xAA);
    expect(gameCubeSaveData.getSaveFiles()[2].iconSpeedCode).to.equal(0xFF);
    expect(gameCubeSaveData.getSaveFiles()[2].permissionAttributeBitfield).to.equal(GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveData.getSaveFiles()[2].copyCounter).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[2].saveStartBlock).to.equal(20);
    expect(gameCubeSaveData.getSaveFiles()[2].saveSizeBlocks).to.equal(4);
    expect(gameCubeSaveData.getSaveFiles()[2].commentStart).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[2].comments[0]).to.equal('');
    expect(gameCubeSaveData.getSaveFiles()[2].comments[1]).to.equal('');

    expect(gameCubeSaveData.getSaveFiles()[3].gameCode).to.equal('GEDE'); // Eternal Darkness
    expect(gameCubeSaveData.getSaveFiles()[3].region).to.equal('North America');
    expect(gameCubeSaveData.getSaveFiles()[3].publisherCode).to.equal('01');
    expect(gameCubeSaveData.getSaveFiles()[3].bannerAndIconFlags).to.equal(0x01);
    expect(gameCubeSaveData.getSaveFiles()[3].fileName).to.equal('Eternal Darkness');
    expect(gameCubeSaveData.getSaveFiles()[3].dateLastModified.toUTCString()).to.equal('Mon, 26 Apr 2004 23:02:32 GMT');
    expect(gameCubeSaveData.getSaveFiles()[3].iconOffset).to.equal(112);
    expect(gameCubeSaveData.getSaveFiles()[3].iconFormatCode).to.equal(0x01);
    expect(gameCubeSaveData.getSaveFiles()[3].iconSpeedCode).to.equal(GameCubeDirectoryEntry.ICON_SPEED_SLOW);
    expect(gameCubeSaveData.getSaveFiles()[3].permissionAttributeBitfield).to.equal(GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveData.getSaveFiles()[3].copyCounter).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[3].saveStartBlock).to.equal(24);
    expect(gameCubeSaveData.getSaveFiles()[3].saveSizeBlocks).to.equal(15);
    expect(gameCubeSaveData.getSaveFiles()[3].commentStart).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[3].comments[0]).to.equal('');
    expect(gameCubeSaveData.getSaveFiles()[3].comments[1]).to.equal('');

    expect(gameCubeSaveData.getSaveFiles()[4].gameCode).to.equal('GRSE'); // Soul Calibur 2
    expect(gameCubeSaveData.getSaveFiles()[4].region).to.equal('North America');
    expect(gameCubeSaveData.getSaveFiles()[4].publisherCode).to.equal('AF');
    expect(gameCubeSaveData.getSaveFiles()[4].bannerAndIconFlags).to.equal(0x05);
    expect(gameCubeSaveData.getSaveFiles()[4].fileName).to.equal('sc2_0.dat');
    expect(gameCubeSaveData.getSaveFiles()[4].dateLastModified.toUTCString()).to.equal('Tue, 14 Dec 2004 23:09:17 GMT');
    expect(gameCubeSaveData.getSaveFiles()[4].iconOffset).to.equal(112);
    expect(gameCubeSaveData.getSaveFiles()[4].iconFormatCode).to.equal(0x5555);
    expect(gameCubeSaveData.getSaveFiles()[4].iconSpeedCode).to.equal(0xAAAF);
    expect(gameCubeSaveData.getSaveFiles()[4].permissionAttributeBitfield).to.equal(GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveData.getSaveFiles()[4].copyCounter).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[4].saveStartBlock).to.equal(39);
    expect(gameCubeSaveData.getSaveFiles()[4].saveSizeBlocks).to.equal(4);
    expect(gameCubeSaveData.getSaveFiles()[4].commentStart).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[4].comments[0]).to.equal('');
    expect(gameCubeSaveData.getSaveFiles()[4].comments[1]).to.equal('');

    expect(gameCubeSaveData.getSaveFiles()[5].gameCode).to.equal('GH2E'); // Need for Speed: Hot Pursuit 2
    expect(gameCubeSaveData.getSaveFiles()[5].region).to.equal('North America');
    expect(gameCubeSaveData.getSaveFiles()[5].publisherCode).to.equal('69');
    expect(gameCubeSaveData.getSaveFiles()[5].bannerAndIconFlags).to.equal(0x02);
    expect(gameCubeSaveData.getSaveFiles()[5].fileName).to.equal('Euan');
    expect(gameCubeSaveData.getSaveFiles()[5].dateLastModified.toUTCString()).to.equal('Sun, 12 Dec 2004 23:42:32 GMT');
    expect(gameCubeSaveData.getSaveFiles()[5].iconOffset).to.equal(112);
    expect(gameCubeSaveData.getSaveFiles()[5].iconFormatCode).to.equal(0xA);
    expect(gameCubeSaveData.getSaveFiles()[5].iconSpeedCode).to.equal(0xA);
    expect(gameCubeSaveData.getSaveFiles()[5].permissionAttributeBitfield).to.equal(GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveData.getSaveFiles()[5].copyCounter).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[5].saveStartBlock).to.equal(57);
    expect(gameCubeSaveData.getSaveFiles()[5].saveSizeBlocks).to.equal(7);
    expect(gameCubeSaveData.getSaveFiles()[5].commentStart).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[5].comments[0]).to.equal('');
    expect(gameCubeSaveData.getSaveFiles()[5].comments[1]).to.equal('');

    expect(gameCubeSaveData.getSaveFiles()[6].gameCode).to.equal('G4SE'); // The Legend of Zelda: Four Swords Adventures
    expect(gameCubeSaveData.getSaveFiles()[6].region).to.equal('North America');
    expect(gameCubeSaveData.getSaveFiles()[6].publisherCode).to.equal('01');
    expect(gameCubeSaveData.getSaveFiles()[6].bannerAndIconFlags).to.equal(0x01);
    expect(gameCubeSaveData.getSaveFiles()[6].fileName).to.equal('gc4sword');
    expect(gameCubeSaveData.getSaveFiles()[6].dateLastModified.toUTCString()).to.equal('Tue, 28 Dec 2049 20:38:08 GMT');
    expect(gameCubeSaveData.getSaveFiles()[6].iconOffset).to.equal(48);
    expect(gameCubeSaveData.getSaveFiles()[6].iconFormatCode).to.equal(0x1);
    expect(gameCubeSaveData.getSaveFiles()[6].iconSpeedCode).to.equal(GameCubeDirectoryEntry.ICON_SPEED_SLOW);
    expect(gameCubeSaveData.getSaveFiles()[6].permissionAttributeBitfield).to.equal(GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveData.getSaveFiles()[6].copyCounter).to.equal(0);
    expect(gameCubeSaveData.getSaveFiles()[6].saveStartBlock).to.equal(64);
    expect(gameCubeSaveData.getSaveFiles()[6].saveSizeBlocks).to.equal(3);
    expect(gameCubeSaveData.getSaveFiles()[6].commentStart).to.equal(7168);
    expect(gameCubeSaveData.getSaveFiles()[6].comments[0]).to.equal('');
    expect(gameCubeSaveData.getSaveFiles()[6].comments[1]).to.equal('');
  });

  // This image works on my physical gamecube memcard
  it('should create a GameCube file with the same flash ID', async () => {
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

    ArrayBufferUtil.writeArrayBuffer(NEW_MEMCARD_IMAGE_SAME_FLASH_ID, gameCubeSaveData.getArrayBuffer());
  });

  // This image works on my physical gamecube memcard
  it('should create a GameCube file with the same flash ID and different format time', async () => {
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

    ArrayBufferUtil.writeArrayBuffer(NEW_MEMCARD_IMAGE_SAME_FLASH_ID_DIFFERENT_DATE, gameCubeSaveData.getArrayBuffer());
  });

  // This image does not work on my physical gamecube memcard
  it('should create a GameCube file with a different flash ID', async () => {
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

    ArrayBufferUtil.writeArrayBuffer(NEW_MEMCARD_IMAGE_DIFFERENT_FLASH_ID, gameCubeSaveData.getArrayBuffer());
  });

  // This image does not work on my physical gamecube memcard
  it('should create a GameCube file with a different flash ID and different date', async () => {
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

    ArrayBufferUtil.writeArrayBuffer(NEW_MEMCARD_IMAGE_DIFFERENT_FLASH_ID_DIFFERENT_DATE, gameCubeSaveData.getArrayBuffer());
  });
});
