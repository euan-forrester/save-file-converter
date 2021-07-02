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
    expect(file.data.byteLength).to.equal(file.size);
  });

  it('should correctly round up to the nearest 64 bytes', () => {
    expect(WiiSaveData.roundUpToNearest64Bytes(-1)).to.equal(0);
    expect(WiiSaveData.roundUpToNearest64Bytes(0)).to.equal(0);

    expect(WiiSaveData.roundUpToNearest64Bytes(1)).to.equal(64);
    expect(WiiSaveData.roundUpToNearest64Bytes(2)).to.equal(64);
    expect(WiiSaveData.roundUpToNearest64Bytes(63)).to.equal(64);
    expect(WiiSaveData.roundUpToNearest64Bytes(64)).to.equal(64);

    expect(WiiSaveData.roundUpToNearest64Bytes(65)).to.equal(128);
    expect(WiiSaveData.roundUpToNearest64Bytes(127)).to.equal(128);
    expect(WiiSaveData.roundUpToNearest64Bytes(128)).to.equal(128);

    expect(WiiSaveData.roundUpToNearest64Bytes(129)).to.equal(192);
    expect(WiiSaveData.roundUpToNearest64Bytes(191)).to.equal(192);
    expect(WiiSaveData.roundUpToNearest64Bytes(192)).to.equal(192);

    expect(WiiSaveData.roundUpToNearest64Bytes(193)).to.equal(256);
    expect(WiiSaveData.roundUpToNearest64Bytes(255)).to.equal(256);
    expect(WiiSaveData.roundUpToNearest64Bytes(256)).to.equal(256);

    expect(WiiSaveData.roundUpToNearest64Bytes(257)).to.equal(320);
    expect(WiiSaveData.roundUpToNearest64Bytes(319)).to.equal(320);
    expect(WiiSaveData.roundUpToNearest64Bytes(320)).to.equal(320);

    expect(WiiSaveData.roundUpToNearest64Bytes(321)).to.equal(384);
    expect(WiiSaveData.roundUpToNearest64Bytes(383)).to.equal(384);
    expect(WiiSaveData.roundUpToNearest64Bytes(384)).to.equal(384);

    expect(WiiSaveData.roundUpToNearest64Bytes(385)).to.equal(448);
    expect(WiiSaveData.roundUpToNearest64Bytes(447)).to.equal(448);
    expect(WiiSaveData.roundUpToNearest64Bytes(448)).to.equal(448);

    expect(WiiSaveData.roundUpToNearest64Bytes(449)).to.equal(512);
    expect(WiiSaveData.roundUpToNearest64Bytes(511)).to.equal(512);
    expect(WiiSaveData.roundUpToNearest64Bytes(512)).to.equal(512);
  });
});
