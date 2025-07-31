import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import GameCubeGameSharkSaveData from '@/save-formats/GameCube/IndividualSaves/GameShark';
import GameCubeDirectoryEntry from '@/save-formats/GameCube/Components/DirectoryEntry';

const DIR = './tests/data/save-formats/gamecube/GameShark';

const GAMESHARK_FILENAME = `${DIR}/soulcalibur-ii.20766.gcs`;
const RAW_FILENAME = `${DIR}/soulcalibur-ii.20766.bin`;

const JAPANESE_GAMESHARK_FILENAME = `${DIR}/soulcalibur-ii.20763.gcs`;
const JAPANESE_RAW_FILENAME = `${DIR}/soulcalibur-ii.20763.bin`;

describe('GameCube - GameShark', () => {
  it('should correctly read a .GCS file', async () => {
    const gcsArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GAMESHARK_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    const gameCubeSaveFile = GameCubeGameSharkSaveData.convertIndividualSaveToSaveFile(gcsArrayBuffer);

    expect(gameCubeSaveFile.gameCode).to.equal('GRSE');
    expect(gameCubeSaveFile.region).to.equal('North America');
    expect(gameCubeSaveFile.publisherCode).to.equal('AF');
    expect(gameCubeSaveFile.bannerAndIconFlags).to.equal(0x05);
    expect(gameCubeSaveFile.fileName).to.equal('sc2_0.dat');
    expect(gameCubeSaveFile.dateLastModified.toUTCString()).to.equal('Fri, 29 Jul 2011 15:02:34 GMT');
    expect(gameCubeSaveFile.iconStartOffset).to.equal(64);
    expect(gameCubeSaveFile.iconFormatCode).to.equal(0x5555);
    expect(gameCubeSaveFile.iconSpeedCode).to.equal(0xAAAF);
    expect(gameCubeSaveFile.permissionAttributeBitfield).to.equal(GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveFile.copyCounter).to.equal(1);
    expect(gameCubeSaveFile.saveStartBlock).to.equal(30);
    expect(gameCubeSaveFile.saveSizeBlocks).to.equal(4);
    expect(gameCubeSaveFile.commentStart).to.equal(0);
    expect(gameCubeSaveFile.inferredCommentEncoding).to.equal('US-ASCII');
    expect(gameCubeSaveFile.comments[0]).to.equal('SOULCALIBUR2 game data');
    expect(gameCubeSaveFile.comments[1]).to.equal(' 2004.09.04 12:57:11');
    expect(gameCubeSaveFile.gameSharkComment).to.equal('SOULCALIBUR2 game data');

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveFile.rawData, rawArrayBuffer)).to.equal(true);
  });

  it('should correctly read a Japanese .GCS file', async () => {
    const gcsArrayBuffer = await ArrayBufferUtil.readArrayBuffer(JAPANESE_GAMESHARK_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(JAPANESE_RAW_FILENAME);

    const gameCubeSaveFile = GameCubeGameSharkSaveData.convertIndividualSaveToSaveFile(gcsArrayBuffer);

    expect(gameCubeSaveFile.gameCode).to.equal('GRSJ');
    expect(gameCubeSaveFile.region).to.equal('Japan');
    expect(gameCubeSaveFile.publisherCode).to.equal('AF');
    expect(gameCubeSaveFile.bannerAndIconFlags).to.equal(0x05);
    expect(gameCubeSaveFile.fileName).to.equal('sc2_0.dat');
    expect(gameCubeSaveFile.dateLastModified.toUTCString()).to.equal('Thu, 10 Apr 2003 00:34:56 GMT');
    expect(gameCubeSaveFile.iconStartOffset).to.equal(64);
    expect(gameCubeSaveFile.iconFormatCode).to.equal(0x5555);
    expect(gameCubeSaveFile.iconSpeedCode).to.equal(0xAAAF);
    expect(gameCubeSaveFile.permissionAttributeBitfield).to.equal(GameCubeDirectoryEntry.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveFile.copyCounter).to.equal(1);
    expect(gameCubeSaveFile.saveStartBlock).to.equal(5);
    expect(gameCubeSaveFile.saveSizeBlocks).to.equal(4);
    expect(gameCubeSaveFile.commentStart).to.equal(0);
    expect(gameCubeSaveFile.inferredCommentEncoding).to.equal('shift-jis');
    expect(gameCubeSaveFile.comments[0]).to.equal('ソウルキャリバーⅡゲームデータ'); // "Soul Calibur II Game Data"
    expect(gameCubeSaveFile.comments[1]).to.equal(' 2003.04.10 00:34:55');
    expect(gameCubeSaveFile.gameSharkComment).to.equal('ソウルキャリバーⅡゲームデータ'); // "Soul Calibur II Game Data"

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveFile.rawData, rawArrayBuffer)).to.equal(true);
  });
});
