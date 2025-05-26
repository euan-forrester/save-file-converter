import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import GameCubeSaveData from '@/save-formats/GameCube/GameCube';
import PhantasyStarOnlineFixups from '@/save-formats/GameCube/GameSpecificFixups/PhantasyStarOnline';

const DIR = './tests/data/save-formats/gamecube/GameSpecificFixups';

// I would like to be able to find a PSO3 file as well, but even one for the original PSO was hard to find

const MEMCARD_FILENAME = `${DIR}/phantasy-star-online-SNUGGLES-WEAPONS.gcp`;

describe('GameCube - game-specific fixups - Phantasy Star Online', () => {
  it('should correctly fixup a Phantasy Star Online file', async () => {
    const memcardArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEMCARD_FILENAME);

    const gameCubeSaveFiles = GameCubeSaveData.createFromGameCubeData(memcardArrayBuffer);

    expect(gameCubeSaveFiles.saveFiles.length).to.equal(3);

    expect(gameCubeSaveFiles.saveFiles[0].fileName).to.equal('PSO_SYSTEM');

    // We set the header serials to what they already were when the save file was created.
    // So by checking that the data is unchanged it verifies that the serials are put into
    // the correct place and that the checksum is calculated correctly
    const headerSerials = {
      serial1: 0x2e7fbf36,
      serial2: 0x56d073df,
    };
    const fixedSaveFile = PhantasyStarOnlineFixups.fixupSaveFile(gameCubeSaveFiles.saveFiles[0], headerSerials);

    expect(ArrayBufferUtil.arrayBuffersEqual(gameCubeSaveFiles.saveFiles[0].rawData, fixedSaveFile.rawData)).to.equal(true);
  });
});
