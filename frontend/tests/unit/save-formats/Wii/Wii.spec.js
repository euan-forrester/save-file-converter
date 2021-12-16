import { expect } from 'chai';
import WiiSaveData from '@/save-formats/Wii/Wii';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/wii';

const WII_FILENAME = `${DIR}/zelda-ii-the-adventure-of-link.15037.bin`;
const RAW_FILENAME = `${DIR}/zelda-ii-the-adventure-of-link.15037-extracted.bin`;

describe('Wii save format', () => {
  it('should decrypt and parse a sample save file', async () => {
    const wiiArrayBuffer = await ArrayBufferUtil.readArrayBuffer(WII_FILENAME);
    const wiiSaveData = new WiiSaveData(wiiArrayBuffer);

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
    expect(file.data.byteLength).to.equal(file.size);

    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    expect(ArrayBufferUtil.arrayBuffersEqual(file.data, rawArrayBuffer)).to.equal(true);
  });
});
