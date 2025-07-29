import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import GameCubeGciSaveData from '@/save-formats/GameCube/IndividualSaves/Gci';
import GameCubeDirectoryEntry from '@/save-formats/GameCube/Components/DirectoryEntry';
import GameCubeUtil from '@/save-formats/GameCube/Util';

const DIR = './tests/data/save-formats/gamecube/gci';

const GCI_FILENAME = `${DIR}/need_for_speed_underground_2_usa.gci`; // I heard the AI in this game is pretty good
const GCI_FILENAME_RECREATED = `${DIR}/need_for_speed_underground_2_usa-recreated.gci`;
const RAW_FILENAME = `${DIR}/need_for_speed_underground_2_usa.bin`;

// The goal with having multiple Japanese saves is to attempt to determine whether fileName
// is encoded as US-ASCII or shift-jis

const JAPANESE_GCI_FILENAME = `${DIR}/bleach_gc_tasogare_ni_mamieru_shinigami_jp.gci`;
const JAPANESE_RAW_FILENAME = `${DIR}/bleach_gc_tasogare_ni_mamieru_shinigami_jp.bin`;

const JAPANESE_GCI_FILENAME_2 = `${DIR}/dokapon_dx_wataru_sekai_wa_oni_darake_jp_1.gci`;
const JAPANESE_RAW_FILENAME_2 = `${DIR}/dokapon_dx_wataru_sekai_wa_oni_darake_jp_1.bin`;

const JAPANESE_GCI_FILENAME_3 = `${DIR}/hikaru_no_go_3_jp.gci`;
const JAPANESE_RAW_FILENAME_3 = `${DIR}/hikaru_no_go_3_jp.bin`;

const JAPANESE_GCI_FILENAME_4 = `${DIR}/konjiki_no_gashbell__yuujou_no_tag_battle_jp.gci`;
const JAPANESE_RAW_FILENAME_4 = `${DIR}/konjiki_no_gashbell__yuujou_no_tag_battle_jp.bin`;

describe('GameCube - .GCI', () => {
  it('should correctly read a .GCI file', async () => {
    const gciArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GCI_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    const gameCubeSaveFile = GameCubeGciSaveData.convertIndividualSaveToSaveFile(gciArrayBuffer);

    expect(gameCubeSaveFile.gameCode).to.equal('GUGE');
    expect(gameCubeSaveFile.region).to.equal('North America');
    expect(gameCubeSaveFile.publisherCode).to.equal('69');
    expect(gameCubeSaveFile.bannerAndIconFlags).to.equal(0x02);
    expect(gameCubeSaveFile.fileName).to.equal('NFSU2BUTCH');
    expect(gameCubeSaveFile.dateLastModified.toUTCString()).to.equal('Sat, 27 Sep 2008 14:27:56 GMT');
    expect(gameCubeSaveFile.iconStartOffset).to.equal(80);
    expect(gameCubeSaveFile.iconFormatCode).to.equal(0x02);
    expect(gameCubeSaveFile.iconSpeedCode).to.equal(GameCubeDirectoryEntry.ICON_SPEED_MIDDLE);
    expect(gameCubeSaveFile.permissionAttributeBitfield).to.equal(GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveFile.copyCounter).to.equal(0);
    expect(gameCubeSaveFile.saveStartBlock).to.equal(146);
    expect(gameCubeSaveFile.saveSizeBlocks).to.equal(7);
    expect(gameCubeSaveFile.commentStart).to.equal(16);
    expect(gameCubeSaveFile.inferredCommentEncoding).to.equal('US-ASCII');
    expect(gameCubeSaveFile.comments[0]).to.equal('NFS Underground 2');
    expect(gameCubeSaveFile.comments[1]).to.equal('BUTCH');

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveFile.rawData, rawArrayBuffer)).to.equal(true);
  });

  it('should correctly write a .GCI file', async () => {
    // The only difference between the original file and the one we recreate is
    // that saveStartBlock is set to something in the original whereas we set it to 0

    const gciArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GCI_FILENAME_RECREATED);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    const saveFiles = [
      {
        gameCode: 'GUGE',
        publisherCode: '69',
        bannerAndIconFlags: 0x02,
        fileName: 'NFSU2BUTCH',
        dateLastModifiedCode: GameCubeUtil.getDateCode(new Date('Sat, 27 Sep 2008 14:27:56 GMT')),
        iconStartOffset: 80,
        iconFormatCode: 0x02,
        iconSpeedCode: GameCubeDirectoryEntry.ICON_SPEED_MIDDLE,
        permissionAttributeBitfield: GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC,
        commentStart: 16,
        rawData: rawArrayBuffer,
      },
    ];

    const gameCubeSaveFiles = GameCubeGciSaveData.convertSaveFilesToGcis(saveFiles);

    expect(gameCubeSaveFiles.length).to.equal(1);

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveFiles[0], gciArrayBuffer)).to.equal(true);
  });

  it('should correctly read a Japanese .GCI file', async () => {
    const gciArrayBuffer = await ArrayBufferUtil.readArrayBuffer(JAPANESE_GCI_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(JAPANESE_RAW_FILENAME);

    const gameCubeSaveFile = GameCubeGciSaveData.convertIndividualSaveToSaveFile(gciArrayBuffer);

    expect(gameCubeSaveFile.gameCode).to.equal('GIGJ');
    expect(gameCubeSaveFile.region).to.equal('Japan');
    expect(gameCubeSaveFile.publisherCode).to.equal('8P');
    expect(gameCubeSaveFile.bannerAndIconFlags).to.equal(0x01);
    expect(gameCubeSaveFile.fileName).to.equal('savedata');
    expect(gameCubeSaveFile.dateLastModified.toUTCString()).to.equal('Sun, 20 Apr 2025 02:37:09 GMT');
    expect(gameCubeSaveFile.iconStartOffset).to.equal(64);
    expect(gameCubeSaveFile.iconFormatCode).to.equal(0x05);
    expect(gameCubeSaveFile.iconSpeedCode).to.equal(0x0F);
    expect(gameCubeSaveFile.permissionAttributeBitfield).to.equal(GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveFile.copyCounter).to.equal(0);
    expect(gameCubeSaveFile.saveStartBlock).to.equal(5);
    expect(gameCubeSaveFile.saveSizeBlocks).to.equal(1);
    expect(gameCubeSaveFile.commentStart).to.equal(0);
    expect(gameCubeSaveFile.inferredCommentEncoding).to.equal('shift-jis');
    expect(gameCubeSaveFile.comments[0]).to.equal('BLEACH GC 黄昏にまみえる死神'); // "BLEACH GC The Grim Reaper in the Dusk"
    expect(gameCubeSaveFile.comments[1]).to.equal('セーブデータ'); // "Save Data"

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveFile.rawData, rawArrayBuffer)).to.equal(true);
  });

  it('should correctly read a second Japanese .GCI file', async () => {
    const gciArrayBuffer = await ArrayBufferUtil.readArrayBuffer(JAPANESE_GCI_FILENAME_2);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(JAPANESE_RAW_FILENAME_2);

    const gameCubeSaveFile = GameCubeGciSaveData.convertIndividualSaveToSaveFile(gciArrayBuffer);

    expect(gameCubeSaveFile.gameCode).to.equal('GDNJ');
    expect(gameCubeSaveFile.region).to.equal('Japan');
    expect(gameCubeSaveFile.publisherCode).to.equal('E8');
    expect(gameCubeSaveFile.bannerAndIconFlags).to.equal(0x06);
    expect(gameCubeSaveFile.fileName).to.equal('4:Dokapon Str'); // This looks a little weird, but comes out as the same whether we treat the encoding as US-ASCII or shift-jis
    expect(gameCubeSaveFile.dateLastModified.toUTCString()).to.equal('Wed, 10 Aug 2016 06:26:09 GMT');
    expect(gameCubeSaveFile.iconStartOffset).to.equal(64);
    expect(gameCubeSaveFile.iconFormatCode).to.equal(0x02);
    expect(gameCubeSaveFile.iconSpeedCode).to.equal(GameCubeDirectoryEntry.ICON_SPEED_SLOW);
    expect(gameCubeSaveFile.permissionAttributeBitfield).to.equal(GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveFile.copyCounter).to.equal(0);
    expect(gameCubeSaveFile.saveStartBlock).to.equal(170);
    expect(gameCubeSaveFile.saveSizeBlocks).to.equal(2);
    expect(gameCubeSaveFile.commentStart).to.equal(0);
    expect(gameCubeSaveFile.inferredCommentEncoding).to.equal('shift-jis');
    expect(gameCubeSaveFile.comments[0]).to.equal('ドカポンＤＸ　ストーリーモード'); // "Dokapon DX Story Mode"
    expect(gameCubeSaveFile.comments[1]).to.equal('8月10日 6時26分のデータ'); // "Data as of 6:26 on August 10th"

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveFile.rawData, rawArrayBuffer)).to.equal(true);
  });

  it('should correctly read a third Japanese .GCI file', async () => {
    const gciArrayBuffer = await ArrayBufferUtil.readArrayBuffer(JAPANESE_GCI_FILENAME_3);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(JAPANESE_RAW_FILENAME_3);

    const gameCubeSaveFile = GameCubeGciSaveData.convertIndividualSaveToSaveFile(gciArrayBuffer);

    expect(gameCubeSaveFile.gameCode).to.equal('GHTJ');
    expect(gameCubeSaveFile.region).to.equal('Japan');
    expect(gameCubeSaveFile.publisherCode).to.equal('A4');
    expect(gameCubeSaveFile.bannerAndIconFlags).to.equal(0x02);
    expect(gameCubeSaveFile.fileName).to.equal('hgsys');
    expect(gameCubeSaveFile.dateLastModified.toUTCString()).to.equal('Wed, 02 Jul 2014 21:57:03 GMT');
    expect(gameCubeSaveFile.iconStartOffset).to.equal(64);
    expect(gameCubeSaveFile.iconFormatCode).to.equal(0x01);
    expect(gameCubeSaveFile.iconSpeedCode).to.equal(GameCubeDirectoryEntry.ICON_SPEED_SLOW);
    expect(gameCubeSaveFile.permissionAttributeBitfield).to.equal(GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveFile.copyCounter).to.equal(0);
    expect(gameCubeSaveFile.saveStartBlock).to.equal(5);
    expect(gameCubeSaveFile.saveSizeBlocks).to.equal(2);
    expect(gameCubeSaveFile.commentStart).to.equal(0);
    expect(gameCubeSaveFile.inferredCommentEncoding).to.equal('shift-jis');
    expect(gameCubeSaveFile.comments[0]).to.equal('ヒカルの碁３　システムデータ\n'); // "Hikaru no Go 3 System Data"
    expect(gameCubeSaveFile.comments[1]).to.equal('2014年7月2日'); // "July 2, 2014"

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveFile.rawData, rawArrayBuffer)).to.equal(true);
  });

  it('should correctly read a fourth Japanese .GCI file', async () => {
    const gciArrayBuffer = await ArrayBufferUtil.readArrayBuffer(JAPANESE_GCI_FILENAME_4);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(JAPANESE_RAW_FILENAME_4);

    const gameCubeSaveFile = GameCubeGciSaveData.convertIndividualSaveToSaveFile(gciArrayBuffer);

    expect(gameCubeSaveFile.gameCode).to.equal('GGKJ');
    expect(gameCubeSaveFile.region).to.equal('Japan');
    expect(gameCubeSaveFile.publisherCode).to.equal('B2');
    expect(gameCubeSaveFile.bannerAndIconFlags).to.equal(0x02);
    expect(gameCubeSaveFile.fileName).to.equal('GASHBELL_FP');
    expect(gameCubeSaveFile.dateLastModified.toUTCString()).to.equal('Thu, 19 Aug 2004 04:35:22 GMT');
    expect(gameCubeSaveFile.iconStartOffset).to.equal(64);
    expect(gameCubeSaveFile.iconFormatCode).to.equal(0x02);
    expect(gameCubeSaveFile.iconSpeedCode).to.equal(GameCubeDirectoryEntry.ICON_SPEED_SLOW);
    expect(gameCubeSaveFile.permissionAttributeBitfield).to.equal(GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveFile.copyCounter).to.equal(0);
    expect(gameCubeSaveFile.saveStartBlock).to.equal(8);
    expect(gameCubeSaveFile.saveSizeBlocks).to.equal(2);
    expect(gameCubeSaveFile.commentStart).to.equal(0);
    expect(gameCubeSaveFile.inferredCommentEncoding).to.equal('shift-jis');
    expect(gameCubeSaveFile.comments[0]).to.equal('金色のガッシュベル！！          '); // "Zatch Bell!!"
    expect(gameCubeSaveFile.comments[1]).to.equal(' セーブデータ                  '); // "Save Data"

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveFile.rawData, rawArrayBuffer)).to.equal(true);
  });
});
