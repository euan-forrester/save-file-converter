import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import GameCubeGciSaveData from '@/save-formats/GameCube/Gci';
import FZeroGxFixups from '@/save-formats/GameCube/GameSpecificFixups/FZeroGx';

const DIR = './tests/data/save-formats/gamecube/GameSpecificFixups';

const GCI_FILENAME = `${DIR}/f_zero_gx_usa.gci`;

describe('GameCube - game-specific fixups - F-Zero GX', () => {
  it('should change an F-Zero GX file when fixing it up', async () => {
    const gciArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GCI_FILENAME);

    const gameCubeSaveFiles = GameCubeGciSaveData.convertGcisToSaveFiles([gciArrayBuffer]);

    expect(gameCubeSaveFiles.length).to.equal(1);

    const headerSerials = {
      serial1: 0,
      serial2: 0,
    };
    const fixedSaveFile = FZeroGxFixups.fixupSaveFile(gameCubeSaveFiles[0], headerSerials);

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveFiles[0].rawData, fixedSaveFile.rawData)).to.equal(false);
  });

  it('should correctly fixup an F-Zero GX file', async () => {
    const gciArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GCI_FILENAME);

    const gameCubeSaveFiles = GameCubeGciSaveData.convertGcisToSaveFiles([gciArrayBuffer]);

    expect(gameCubeSaveFiles.length).to.equal(1);

    // We set the header serials to what they already were when the save file was created.
    // So by checking that the data is unchanged it verifies that the serials are put into
    // the correct place and that the checksum is calculated correctly
    const headerSerials = {
      serial1: 0x89166863,
      serial2: 0xc2ba136d,
    };
    const fixedSaveFile = FZeroGxFixups.fixupSaveFile(gameCubeSaveFiles[0], headerSerials);

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveFiles[0].rawData, fixedSaveFile.rawData)).to.equal(true);
  });
});
