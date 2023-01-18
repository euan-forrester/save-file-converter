import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';
// import SegaCdUtil from '@/util/SegaCd';

import SegaCdSaveData from '@/save-formats/SegaCd/SegaCd';

const DIR = './tests/data/save-formats/segacd';

const INTERNAL_MEMORY_FILENAME = `${DIR}/Popful Mail (U)-internal-memory.brm`;

describe('Sega CD', () => {
  it('should extract all of the saves in a Sega CD file', async () => {
    const segaCdArrayBuffer = await ArrayBufferUtil.readArrayBuffer(INTERNAL_MEMORY_FILENAME);

    const segaCdSaveData = SegaCdSaveData.createFromSegaCdData(segaCdArrayBuffer);

    expect(segaCdSaveData.getNumFreeBlocks()).to.equal(112);
    expect(segaCdSaveData.getFormat()).to.equal('SEGA_CD_ROM');
    expect(segaCdSaveData.getVolume()).to.equal('');
    expect(segaCdSaveData.getMediaId()).to.equal('RAM_CARTRIDGE');

    expect(segaCdSaveData.getSaveFiles().length).to.equal(1);
    expect(segaCdSaveData.getSaveFiles()[0].filename).to.equal('POPFUL_MAIL');
    expect(segaCdSaveData.getSaveFiles()[0].dataIsEncoded).to.equal(false);
    expect(segaCdSaveData.getSaveFiles()[0].startBlockNumber).to.equal(1);
    expect(segaCdSaveData.getSaveFiles()[0].fileSize).to.equal(13);
  });
});
