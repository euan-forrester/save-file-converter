import { expect } from 'chai';
import WiiSaveData from '@/save-formats/Wii';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const FILENAME = './tests/unit/save-formats/data/zelda-ii-the-adventure-of-link.15037.bin';

describe('Wii save format', () => {
  it('should decrypt and parse a sample save file', async () => {
    const arrayBuffer = await ArrayBufferUtil.readArrayBuffer(FILENAME);
    const wiiSaveData = new WiiSaveData(arrayBuffer);

    expect(wiiSaveData.getGameTitle()).to.equal('Zelda Ⅱ');
    expect(wiiSaveData.getGameSubtitle()).to.equal('The Adv. of Link');
    expect(wiiSaveData.getGameId()).to.equal('FA9E');
    expect(wiiSaveData.getNumberOfFiles()).to.equal(1);
    expect(wiiSaveData.getSizeOfFiles()).to.equal(8384);
    expect(wiiSaveData.getTotalSize()).to.equal(9344);

    const fileList = wiiSaveData.getFiles();

    expect(fileList.length).to.equal(1);

    const file = fileList[0];

    expect(file.size).to.equal(8256);
    expect(file.name).to.equal('savedata.bin');
  });
});
