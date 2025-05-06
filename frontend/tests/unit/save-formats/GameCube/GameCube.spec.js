import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';
import HexUtil from '#/util/Hex';

import GameCubeSaveData from '@/save-formats/GameCube/GameCube';
import GameCubeUtil from '@/save-formats/GameCube/Util';
import GameCubeHeader from '@/save-formats/GameCube/Components/Header';

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

    expect(gameCubeSaveData.getSaveFiles().length).to.equal(0);

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getVolumeInfo().cardFlashId, EMPTY_CARDS_FLASH_ID)).to.equal(true);
    expect(gameCubeSaveData.getVolumeInfo().formatTime.toUTCString()).to.equal('Tue, 25 Aug 2020 17:46:54 GMT');
    expect(gameCubeSaveData.getVolumeInfo().formatOsTimeCode).to.equal(26393558999715977n);
    expect(gameCubeSaveData.getVolumeInfo().rtcBias).to.equal(0xFD39262); // This appears to be 6 seconds
    expect(gameCubeSaveData.getVolumeInfo().language).to.equal('English');
    expect(gameCubeSaveData.getVolumeInfo().viDtvStatus).to.equal(0);
    expect(gameCubeSaveData.getVolumeInfo().memcardSlot).to.equal(GameCubeHeader.MEMCARD_SLOT_A);
    expect(gameCubeSaveData.getVolumeInfo().memcardSizeMegabits).to.equal(16);
    expect(gameCubeSaveData.getVolumeInfo().encodingString).to.equal('US-ASCII');
    expect(gameCubeSaveData.getVolumeInfo().updateCounter).to.equal(0xFFFF);
    expect(gameCubeSaveData.getVolumeInfo().checksum).to.equal(0x07F9);
    expect(gameCubeSaveData.getVolumeInfo().checksumInverse).to.equal(0xF709);
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
    expect(gameCubeSaveData.getVolumeInfo().updateCounter).to.equal(0xFFFF);
    expect(gameCubeSaveData.getVolumeInfo().checksum).to.equal(0x354F);
    expect(gameCubeSaveData.getVolumeInfo().checksumInverse).to.equal(0xC9B3);
  });

  it('should correctly a GameCube file with 7 saves', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEMCARD_IMAGE);

    const gameCubeSaveData = GameCubeSaveData.createFromGameCubeData(arrayBuffer);

    expect(gameCubeSaveData.getSaveFiles().length).to.equal(0);

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveData.getVolumeInfo().cardFlashId, MEMCARD_FLASH_ID)).to.equal(true);
    expect(gameCubeSaveData.getVolumeInfo().formatTime.toUTCString()).to.equal('Thu, 15 Feb 2001 00:48:05 GMT');
    expect(gameCubeSaveData.getVolumeInfo().formatOsTimeCode).to.equal(1438288056135933n);
    expect(gameCubeSaveData.getVolumeInfo().rtcBias).to.equal(0);
    expect(gameCubeSaveData.getVolumeInfo().language).to.equal('English');
    expect(gameCubeSaveData.getVolumeInfo().viDtvStatus).to.equal(0);
    expect(gameCubeSaveData.getVolumeInfo().memcardSlot).to.equal(GameCubeHeader.MEMCARD_SLOT_A);
    expect(gameCubeSaveData.getVolumeInfo().memcardSizeMegabits).to.equal(16);
    expect(gameCubeSaveData.getVolumeInfo().encodingString).to.equal('US-ASCII');
    expect(gameCubeSaveData.getVolumeInfo().updateCounter).to.equal(0xFFFF);
    expect(gameCubeSaveData.getVolumeInfo().checksum).to.equal(0x2FD4);
    expect(gameCubeSaveData.getVolumeInfo().checksumInverse).to.equal(0xCF2E);
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
      updateCounter: 0xFFFF,
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
      updateCounter: 0xFFFF,
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
      updateCounter: 0xFFFF,
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
      updateCounter: 0xFFFF,
    };

    const gameCubeSaveData = GameCubeSaveData.createFromSaveFiles([], volumeInfo);

    ArrayBufferUtil.writeArrayBuffer(NEW_MEMCARD_IMAGE_DIFFERENT_FLASH_ID_DIFFERENT_DATE, gameCubeSaveData.getArrayBuffer());
  });
});
