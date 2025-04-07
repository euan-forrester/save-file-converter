import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import GameCubeGciSaveData from '@/save-formats/GameCube/Gci';

const DIR = './tests/data/save-formats/gamecube';

const GCI_FILENAME = `${DIR}/need_for_speed_underground_2_usa.gci`; // I heard the AI in this game is pretty good
const RAW_FILENAME = `${DIR}/need_for_speed_underground_2_usa.bin`;

describe('GameCube - .GCI', () => {
  it('should correctly read a .GCI file', async () => {
    const gciArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GCI_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    const gameCubeSaveFiles = GameCubeGciSaveData.convertGcisToSaveFiles([gciArrayBuffer]);

    expect(gameCubeSaveFiles.length).to.equal(1);

    expect(gameCubeSaveFiles[0].gameCode).to.equal('GUG');
    expect(gameCubeSaveFiles[0].region).to.equal('North America');
    expect(gameCubeSaveFiles[0].publisherCode).to.equal('69');
    expect(gameCubeSaveFiles[0].bannerGraphicFormatCode).to.equal(GameCubeGciSaveData.GRAPHIC_FORMAT_RGB);
    expect(gameCubeSaveFiles[0].fileName).to.equal('NFSU2BUTCH');
    expect(gameCubeSaveFiles[0].dateLastModified.toUTCString()).to.equal('Sat, 27 Sep 2008 14:27:55 GMT');

    expect(gameCubeSaveFiles[0].iconOffset).to.equal(128);
    expect(gameCubeSaveFiles[0].iconFormatCode).to.equal(GameCubeGciSaveData.GRAPHIC_FORMAT_RGB);
    expect(gameCubeSaveFiles[0].iconSpeedCode).to.equal(GameCubeGciSaveData.ICON_SPEED_MIDDLE);

    expect(gameCubeSaveFiles[0].permissionAttributeBitfield).to.equal(GameCubeGciSaveData.PERMISSION_ATTRIBUTE_PUBLIC);
    expect(gameCubeSaveFiles[0].copyTimes).to.equal(0);
    expect(gameCubeSaveFiles[0].saveStartBlock).to.equal(146);
    expect(gameCubeSaveFiles[0].saveSizeBlocks).to.equal(7);
    expect(gameCubeSaveFiles[0].commentStart).to.equal(16);
    expect(gameCubeSaveFiles[0].comment).to.equal('NFS Underground 2');

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveFiles[0].rawData, rawArrayBuffer)).to.equal(true);
  });
});
