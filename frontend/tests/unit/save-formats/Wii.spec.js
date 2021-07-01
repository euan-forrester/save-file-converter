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

    expect(wiiSaveData.getRawSaveData()).to.not.equal(null);
  });
});
