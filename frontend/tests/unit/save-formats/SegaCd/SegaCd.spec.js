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
  `${DIR}/SHINING FORCE CD-0.srm`,
  `${DIR}/SHINING FORCE CD-1.srm`,
  `${DIR}/SHINING FORCE CD-2.srm`,
  `${DIR}/SHINING FORCE CD-3.srm`,
  `${DIR}/SHINING FORCE CD-4.srm`,
];

const CREATED_FILE_FILENAME = `${DIR}/Multiple titles - created by program.brm`;

const CORRUPTED_DATA_FILENAME = `${DIR}/Multiple titles - corrupted.brm`;

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

  it('should extract all of the saves from a concatenated internal memory + RAM cartridge file (which also contains encoded data)', async () => {
    const segaCdArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAM_CARTRIDGE_ENCODED_DATA_FILENAME);
    const rawArrayBuffers = await Promise.all(RAM_CARTRIDGE_ENCODED_DATA_FILES.map((n) => ArrayBufferUtil.readArrayBuffer(n)));

    const segaCdSaveData = SegaCdSaveData.createFromSegaCdData(segaCdArrayBuffer);

    expect(segaCdSaveData.getNumFreeBlocks()).to.equal(124); // This is the num free blocks in the internal memory portion of the save only. The RAM cart portion has 623 free blocks
    expect(segaCdSaveData.getFormat()).to.equal('SEGA_CD_ROM'); // These 3 are the names for the internal memory portion only
    expect(segaCdSaveData.getVolume()).to.equal('');
    expect(segaCdSaveData.getMediaId()).to.equal('RAM_CARTRIDGE');

    expect(segaCdSaveData.getSaveFiles().length).to.equal(5);

    // This file is in the internal memory

    expect(segaCdSaveData.getSaveFiles()[0].filename).to.equal('SFCD_DAT_09');
    expect(segaCdSaveData.getSaveFiles()[0].dataIsEncoded).to.equal(true);
    expect(segaCdSaveData.getSaveFiles()[0].startBlockNumber).to.equal(1);
    expect(segaCdSaveData.getSaveFiles()[0].fileSizeBlocks).to.equal(1);
    expect(ArrayBufferUtil.arrayBuffersEqual(segaCdSaveData.getSaveFiles()[0].fileData, rawArrayBuffers[0])).to.equal(true);

    // These files are in the RAM cart. Note that the starting block number starts over again

    expect(segaCdSaveData.getSaveFiles()[1].filename).to.equal('SFCD_DAT_01');
    expect(segaCdSaveData.getSaveFiles()[1].dataIsEncoded).to.equal(true);
    expect(segaCdSaveData.getSaveFiles()[1].startBlockNumber).to.equal(1);
    expect(segaCdSaveData.getSaveFiles()[1].fileSizeBlocks).to.equal(99);
    expect(ArrayBufferUtil.arrayBuffersEqual(segaCdSaveData.getSaveFiles()[1].fileData, rawArrayBuffers[1])).to.equal(true);

    expect(segaCdSaveData.getSaveFiles()[2].filename).to.equal('SFCD_DAT_02');
    expect(segaCdSaveData.getSaveFiles()[2].dataIsEncoded).to.equal(true);
    expect(segaCdSaveData.getSaveFiles()[2].startBlockNumber).to.equal(100);
    expect(segaCdSaveData.getSaveFiles()[2].fileSizeBlocks).to.equal(99);
    expect(ArrayBufferUtil.arrayBuffersEqual(segaCdSaveData.getSaveFiles()[2].fileData, rawArrayBuffers[2])).to.equal(true);

    expect(segaCdSaveData.getSaveFiles()[3].filename).to.equal('SFCD_DAT_03');
    expect(segaCdSaveData.getSaveFiles()[3].dataIsEncoded).to.equal(true);
    expect(segaCdSaveData.getSaveFiles()[3].startBlockNumber).to.equal(199);
    expect(segaCdSaveData.getSaveFiles()[3].fileSizeBlocks).to.equal(99);
    expect(ArrayBufferUtil.arrayBuffersEqual(segaCdSaveData.getSaveFiles()[3].fileData, rawArrayBuffers[3])).to.equal(true);

    expect(segaCdSaveData.getSaveFiles()[4].filename).to.equal('SFCD_DAT_04');
    expect(segaCdSaveData.getSaveFiles()[4].dataIsEncoded).to.equal(true);
    expect(segaCdSaveData.getSaveFiles()[4].startBlockNumber).to.equal(298);
    expect(segaCdSaveData.getSaveFiles()[4].fileSizeBlocks).to.equal(99);
    expect(ArrayBufferUtil.arrayBuffersEqual(segaCdSaveData.getSaveFiles()[4].fileData, rawArrayBuffers[4])).to.equal(true);
  });

  it('should be able to create a save file from individual files', async () => {
    const rawArrayBuffers = await Promise.all(INTERNAL_MEMORY_MULTIPLE_FILES_FILES.map((n) => ArrayBufferUtil.readArrayBuffer(n)));

    // This is identical to the data created by the reference tool https://github.com/superctr/buram for this data.
    // It's different from the file created by the BIOS though: the final block of directory information (i.e. closest to the top of the file)
    // is different for some reason.
    // Also, the BIOS fills in some data in the reserved block at the beginning of the file
    //
    // This file was tested as being able to be loaded by the BIOS
    const expectedCreatedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CREATED_FILE_FILENAME);

    const saveFiles = [
      {
        filename: 'POPFUL_MAIL',
        fileData: rawArrayBuffers[0],
        dataIsEncoded: false,
      },
      {
        filename: 'DW__DATA_00',
        fileData: rawArrayBuffers[1],
        dataIsEncoded: false,
      },
      {
        filename: 'SFCD_DAT_09',
        fileData: rawArrayBuffers[2],
        dataIsEncoded: true,
      },
      {
        filename: 'SONICCD__01',
        fileData: rawArrayBuffers[3],
        dataIsEncoded: false,
      },
      {
        filename: 'SONICCD__02',
        fileData: rawArrayBuffers[4],
        dataIsEncoded: false,
      },
      {
        filename: 'SONICCD',
        fileData: rawArrayBuffers[5],
        dataIsEncoded: false,
      },
      {
        filename: 'SONICCD__03',
        fileData: rawArrayBuffers[6],
        dataIsEncoded: false,
      },
    ];

    const createdSegaCdSaveData = SegaCdSaveData.createFromSaveFiles(saveFiles, 8192);

    expect(ArrayBufferUtil.arrayBuffersEqual(expectedCreatedArrayBuffer, createdSegaCdSaveData.getArrayBuffer())).to.equal(true);

    const segaCdSaveData = SegaCdSaveData.createFromSegaCdData(createdSegaCdSaveData.getArrayBuffer());

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

  it('should correctly set the number of free blocks when the number of files is even', async () => {
    const rawArrayBuffers = await Promise.all(INTERNAL_MEMORY_MULTIPLE_FILES_FILES.map((n) => ArrayBufferUtil.readArrayBuffer(n)));

    const saveFiles = [
      {
        filename: 'POPFUL_MAIL',
        fileData: rawArrayBuffers[0],
        dataIsEncoded: false,
      },
      {
        filename: 'DW__DATA_00',
        fileData: rawArrayBuffers[1],
        dataIsEncoded: false,
      },
    ];

    const createdSegaCdSaveData = SegaCdSaveData.createFromSaveFiles(saveFiles, 8192);

    // 8192 bytes = 128 blocks
    // 2 reserved blocks
    // 13 blocks in first file
    // 40 blocks in second file
    // 1 block for the 2 directory entries
    // 1 more block reserved for the next future directory entry
    //
    // Result is 71 free blocks

    expect(createdSegaCdSaveData.getNumFreeBlocks()).to.equal(71);
  });

  it('should correctly set the number of free blocks when the number of files is odd', async () => {
    const rawArrayBuffers = await Promise.all(INTERNAL_MEMORY_MULTIPLE_FILES_FILES.map((n) => ArrayBufferUtil.readArrayBuffer(n)));

    const saveFiles = [
      {
        filename: 'DW__DATA_00',
        fileData: rawArrayBuffers[1],
        dataIsEncoded: false,
      },
    ];

    const createdSegaCdSaveData = SegaCdSaveData.createFromSaveFiles(saveFiles, 8192);

    // 8192 bytes = 128 blocks
    // 2 reserved blocks
    // 40 blocks in first file
    // 1 block for the 1 directory entry and next future directory entry
    //
    // Result is 85 free blocks

    expect(createdSegaCdSaveData.getNumFreeBlocks()).to.equal(85);
  });

  it('should extract all of the saves from an internal memory file containing corrupted data', async () => {
    const segaCdArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CORRUPTED_DATA_FILENAME);
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
});
