import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';
// import SegaCdUtil from '@/util/SegaCd';

import SegaCdSaveData from '@/save-formats/SegaCd/SegaCd';

const DIR = './tests/data/save-formats/segacd';

const INTERNAL_MEMORY_1_FILE_FILENAME = `${DIR}/Popful Mail (U)-internal-memory.brm`;
const INTERNAL_MEMORY_1_FILE_FILENAME_FILE_1 = `${DIR}/Popful Mail (U)-internal-memory-1.srm`;

const INTERNAL_MEMORY_MULTIPLE_FILES_FILENAME = `${DIR}/Multiple titles.brm`;
const INTERNAL_MEMORY_MULTIPLE_FILES_FILES = [
  `${DIR}/Multiple titles-1.srm`,
  `${DIR}/Multiple titles-2.srm`,
  `${DIR}/Multiple titles-3.srm`,
  `${DIR}/Multiple titles-4.srm`,
  `${DIR}/Multiple titles-5.srm`,
  `${DIR}/Multiple titles-6.srm`,
  `${DIR}/Multiple titles-7.srm`,
];

const RAM_CARTRIDGE_ENCODED_DATA_FILENAME = `${DIR}/SHINING FORCE CD.brm`;
const RAM_CARTRIDGE_ENCODED_DATA_FILES = [
  `${DIR}/SHINING FORCE CD-1.srm`,
  `${DIR}/SHINING FORCE CD-2.srm`,
  `${DIR}/SHINING FORCE CD-3.srm`,
  `${DIR}/SHINING FORCE CD-4.srm`,
];

describe('Sega CD', () => {
  it('should extract a save from an internal memory file containing 1 save', async () => {
    const segaCdArrayBuffer = await ArrayBufferUtil.readArrayBuffer(INTERNAL_MEMORY_1_FILE_FILENAME);
    const file1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(INTERNAL_MEMORY_1_FILE_FILENAME_FILE_1);

    const segaCdSaveData = SegaCdSaveData.createFromSegaCdData(segaCdArrayBuffer);

    expect(segaCdSaveData.getNumFreeBlocks()).to.equal(112);
    expect(segaCdSaveData.getFormat()).to.equal('SEGA_CD_ROM');
    expect(segaCdSaveData.getVolume()).to.equal('');
    expect(segaCdSaveData.getMediaId()).to.equal('RAM_CARTRIDGE');

    expect(segaCdSaveData.getSaveFiles().length).to.equal(1);

    expect(segaCdSaveData.getSaveFiles()[0].filename).to.equal('POPFUL_MAIL');
    expect(segaCdSaveData.getSaveFiles()[0].dataIsEncoded).to.equal(false);
    expect(segaCdSaveData.getSaveFiles()[0].startBlockNumber).to.equal(1);
    expect(segaCdSaveData.getSaveFiles()[0].fileSizeBlocks).to.equal(13);
    expect(ArrayBufferUtil.arrayBuffersEqual(segaCdSaveData.getSaveFiles()[0].fileData, file1ArrayBuffer)).to.equal(true);
  });

  it('should extract all of the saves from an internal memory file containing multiple saves', async () => {
    const segaCdArrayBuffer = await ArrayBufferUtil.readArrayBuffer(INTERNAL_MEMORY_MULTIPLE_FILES_FILENAME);
    const rawArrayBuffers = await Promise.all(INTERNAL_MEMORY_MULTIPLE_FILES_FILES.map((n) => ArrayBufferUtil.readArrayBuffer(n)));

    const segaCdSaveData = SegaCdSaveData.createFromSegaCdData(segaCdArrayBuffer);

    expect(segaCdSaveData.getNumFreeBlocks()).to.equal(24);
    expect(segaCdSaveData.getFormat()).to.equal('SEGA_CD_ROM');
    expect(segaCdSaveData.getVolume()).to.equal('');
    expect(segaCdSaveData.getMediaId()).to.equal('RAM_CARTRIDGE');

    expect(segaCdSaveData.getSaveFiles().length).to.equal(7);

    expect(segaCdSaveData.getSaveFiles()[0].filename).to.equal('POPFUL_MAIL');
    expect(segaCdSaveData.getSaveFiles()[0].dataIsEncoded).to.equal(false);
    expect(segaCdSaveData.getSaveFiles()[0].startBlockNumber).to.equal(1);
    expect(segaCdSaveData.getSaveFiles()[0].fileSizeBlocks).to.equal(13);
    expect(ArrayBufferUtil.arrayBuffersEqual(segaCdSaveData.getSaveFiles()[0].fileData, rawArrayBuffers[0])).to.equal(true);

    expect(segaCdSaveData.getSaveFiles()[1].filename).to.equal('DW__DATA_00');
    expect(segaCdSaveData.getSaveFiles()[1].dataIsEncoded).to.equal(false);
    expect(segaCdSaveData.getSaveFiles()[1].startBlockNumber).to.equal(14);
    expect(segaCdSaveData.getSaveFiles()[1].fileSizeBlocks).to.equal(40);
    expect(ArrayBufferUtil.arrayBuffersEqual(segaCdSaveData.getSaveFiles()[1].fileData, rawArrayBuffers[1])).to.equal(true);

    expect(segaCdSaveData.getSaveFiles()[2].filename).to.equal('SFCD_DAT_09');
    expect(segaCdSaveData.getSaveFiles()[2].dataIsEncoded).to.equal(true);
    expect(segaCdSaveData.getSaveFiles()[2].startBlockNumber).to.equal(54);
    expect(segaCdSaveData.getSaveFiles()[2].fileSizeBlocks).to.equal(1);
    expect(ArrayBufferUtil.arrayBuffersEqual(segaCdSaveData.getSaveFiles()[2].fileData, rawArrayBuffers[2])).to.equal(true);

    expect(segaCdSaveData.getSaveFiles()[3].filename).to.equal('SONICCD__01');
    expect(segaCdSaveData.getSaveFiles()[3].dataIsEncoded).to.equal(false);
    expect(segaCdSaveData.getSaveFiles()[3].startBlockNumber).to.equal(55);
    expect(segaCdSaveData.getSaveFiles()[3].fileSizeBlocks).to.equal(11);
    expect(ArrayBufferUtil.arrayBuffersEqual(segaCdSaveData.getSaveFiles()[3].fileData, rawArrayBuffers[3])).to.equal(true);

    expect(segaCdSaveData.getSaveFiles()[4].filename).to.equal('SONICCD__02');
    expect(segaCdSaveData.getSaveFiles()[4].dataIsEncoded).to.equal(false);
    expect(segaCdSaveData.getSaveFiles()[4].startBlockNumber).to.equal(66);
    expect(segaCdSaveData.getSaveFiles()[4].fileSizeBlocks).to.equal(11);
    expect(ArrayBufferUtil.arrayBuffersEqual(segaCdSaveData.getSaveFiles()[4].fileData, rawArrayBuffers[4])).to.equal(true);

    expect(segaCdSaveData.getSaveFiles()[5].filename).to.equal('SONICCD');
    expect(segaCdSaveData.getSaveFiles()[5].dataIsEncoded).to.equal(false);
    expect(segaCdSaveData.getSaveFiles()[5].startBlockNumber).to.equal(77);
    expect(segaCdSaveData.getSaveFiles()[5].fileSizeBlocks).to.equal(11);
    expect(ArrayBufferUtil.arrayBuffersEqual(segaCdSaveData.getSaveFiles()[5].fileData, rawArrayBuffers[5])).to.equal(true);

    expect(segaCdSaveData.getSaveFiles()[6].filename).to.equal('SONICCD__03');
    expect(segaCdSaveData.getSaveFiles()[6].dataIsEncoded).to.equal(false);
    expect(segaCdSaveData.getSaveFiles()[6].startBlockNumber).to.equal(88);
    expect(segaCdSaveData.getSaveFiles()[6].fileSizeBlocks).to.equal(11);
    expect(ArrayBufferUtil.arrayBuffersEqual(segaCdSaveData.getSaveFiles()[6].fileData, rawArrayBuffers[6])).to.equal(true);
  });

  it('should extract all of the saves from a RAM cartridge file containing encoded data', async () => {
    const segaCdArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAM_CARTRIDGE_ENCODED_DATA_FILENAME);
    const rawArrayBuffers = await Promise.all(RAM_CARTRIDGE_ENCODED_DATA_FILES.map((n) => ArrayBufferUtil.readArrayBuffer(n)));

    const segaCdSaveData = SegaCdSaveData.createFromSegaCdData(segaCdArrayBuffer);

    expect(segaCdSaveData.getNumFreeBlocks()).to.equal(623);
    expect(segaCdSaveData.getFormat()).to.equal('SEGA_CD_ROM');
    expect(segaCdSaveData.getVolume()).to.equal('');
    expect(segaCdSaveData.getMediaId()).to.equal('RAM_CARTRIDGE');

    expect(segaCdSaveData.getSaveFiles().length).to.equal(4);

    expect(segaCdSaveData.getSaveFiles()[0].filename).to.equal('SFCD_DAT_01');
    expect(segaCdSaveData.getSaveFiles()[0].dataIsEncoded).to.equal(true);
    expect(segaCdSaveData.getSaveFiles()[0].startBlockNumber).to.equal(1);
    expect(segaCdSaveData.getSaveFiles()[0].fileSizeBlocks).to.equal(99);
    expect(ArrayBufferUtil.arrayBuffersEqual(segaCdSaveData.getSaveFiles()[0].fileData, rawArrayBuffers[0])).to.equal(true);

    expect(segaCdSaveData.getSaveFiles()[1].filename).to.equal('SFCD_DAT_02');
    expect(segaCdSaveData.getSaveFiles()[1].dataIsEncoded).to.equal(true);
    expect(segaCdSaveData.getSaveFiles()[1].startBlockNumber).to.equal(100);
    expect(segaCdSaveData.getSaveFiles()[1].fileSizeBlocks).to.equal(99);
    expect(ArrayBufferUtil.arrayBuffersEqual(segaCdSaveData.getSaveFiles()[1].fileData, rawArrayBuffers[1])).to.equal(true);

    expect(segaCdSaveData.getSaveFiles()[2].filename).to.equal('SFCD_DAT_03');
    expect(segaCdSaveData.getSaveFiles()[2].dataIsEncoded).to.equal(true);
    expect(segaCdSaveData.getSaveFiles()[2].startBlockNumber).to.equal(199);
    expect(segaCdSaveData.getSaveFiles()[2].fileSizeBlocks).to.equal(99);
    expect(ArrayBufferUtil.arrayBuffersEqual(segaCdSaveData.getSaveFiles()[2].fileData, rawArrayBuffers[2])).to.equal(true);

    expect(segaCdSaveData.getSaveFiles()[3].filename).to.equal('SFCD_DAT_04');
    expect(segaCdSaveData.getSaveFiles()[3].dataIsEncoded).to.equal(true);
    expect(segaCdSaveData.getSaveFiles()[3].startBlockNumber).to.equal(298);
    expect(segaCdSaveData.getSaveFiles()[3].fileSizeBlocks).to.equal(99);
    expect(ArrayBufferUtil.arrayBuffersEqual(segaCdSaveData.getSaveFiles()[3].fileData, rawArrayBuffers[3])).to.equal(true);
  });
});
