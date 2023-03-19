import { expect } from 'chai';
import seedrandom from 'seedrandom';
import N64MempackSaveData from '@/save-formats/N64/Mempack';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/data/save-formats/n64/mempack';

const RAW_ONE_FILE_FILENAME = `${DIR}/mario-kart-64.1116.mpk`;
const RAW_ONE_FILE_NOTE_FILENAME = `${DIR}/mario-kart-64.1116-1`;

const RAW_TWO_FILES_FILENAME = `${DIR}/tony-hawks-pro-skater-2.1077.mpk`;
const RAW_TWO_FILES_NOTE_1_FILENAME = `${DIR}/tony-hawks-pro-skater-2.1077-1`;
const RAW_TWO_FILES_NOTE_2_FILENAME = `${DIR}/tony-hawks-pro-skater-2.1077-2`;

const RAW_PERIODS_IN_NOTENAME_NOTE_FILENAME = `${DIR}/san-francisco-rush-extreme-racing.1103-1`;

describe('N64 - Mempack save format', () => {
  let randomNumberGenerator = null;

  before(() => {
    // Replace Math.random() so that the results are predictable
    // We can't just override the global Math.random() because these tests run concurrently with tests of the
    // N64 dexdrive format, which also depends on random numbers. When they execute concurrently, re-seeding
    // causes unpredictable results
    randomNumberGenerator = seedrandom('Zelda 2D > Zelda 3D');
  });

  it('should create a file containing a single save that is 121 pages', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_ONE_FILE_FILENAME);
    const rawNoteArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_ONE_FILE_NOTE_FILENAME);

    const saveFiles = [{
      noteName: 'MARIOKART64',
      noteNameExtension: '',
      gameSerialCode: 'NKTJ',
      publisherCode: '01',
      rawData: rawNoteArrayBuffer,
    }];

    const mempackSaveData = N64MempackSaveData.createFromSaveFiles(saveFiles, randomNumberGenerator);

    expect(ArrayBufferUtil.arrayBuffersEqual(mempackSaveData.getArrayBuffer(), rawArrayBuffer)).to.equal(true);

    expect(mempackSaveData.getSaveFiles().length).to.equal(1);

    expect(mempackSaveData.getSaveFiles()[0].startingPage).to.equal(5);
    expect(mempackSaveData.getSaveFiles()[0].pageNumbers.length).to.equal(121);
    expect(mempackSaveData.getSaveFiles()[0].noteName).to.equal('MARIOKART64');
    expect(mempackSaveData.getSaveFiles()[0].noteNameExtension).to.equal('');
    expect(mempackSaveData.getSaveFiles()[0].gameSerialCode).to.equal('NKTJ');
    expect(mempackSaveData.getSaveFiles()[0].publisherCode).to.equal('01');
    expect(mempackSaveData.getSaveFiles()[0].region).to.equal('J');
    expect(mempackSaveData.getSaveFiles()[0].regionName).to.equal('Japan');
    expect(mempackSaveData.getSaveFiles()[0].media).to.equal('N');
    expect(ArrayBufferUtil.arrayBuffersEqual(mempackSaveData.getSaveFiles()[0].rawData, rawNoteArrayBuffer)).to.equal(true);
  });

  it('should create a file containing two saves that are 27 and 20 pages', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_TWO_FILES_FILENAME);
    const rawNote1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_TWO_FILES_NOTE_1_FILENAME);
    const rawNote2ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_TWO_FILES_NOTE_2_FILENAME);

    const saveFiles = [{
      noteName: 'T2-\'',
      noteNameExtension: 'G',
      gameSerialCode: 'NTQE',
      publisherCode: '52',
      rawData: rawNote1ArrayBuffer,
    },
    {
      noteName: 'T2-WAREHOUSE',
      noteNameExtension: 'P',
      gameSerialCode: 'NTQE',
      publisherCode: '52',
      rawData: rawNote2ArrayBuffer,
    }];

    const mempackSaveData = N64MempackSaveData.createFromSaveFiles(saveFiles, randomNumberGenerator);

    expect(ArrayBufferUtil.arrayBuffersEqual(mempackSaveData.getArrayBuffer(), rawArrayBuffer)).to.equal(true);

    expect(mempackSaveData.getSaveFiles().length).to.equal(2);

    expect(mempackSaveData.getSaveFiles()[0].startingPage).to.equal(5);
    expect(mempackSaveData.getSaveFiles()[0].pageNumbers.length).to.equal(27);
    expect(mempackSaveData.getSaveFiles()[0].noteName).to.equal('T2-\'');
    expect(mempackSaveData.getSaveFiles()[0].noteNameExtension).to.equal('G');
    expect(mempackSaveData.getSaveFiles()[0].gameSerialCode).to.equal('NTQE');
    expect(mempackSaveData.getSaveFiles()[0].publisherCode).to.equal('52');
    expect(mempackSaveData.getSaveFiles()[0].region).to.equal('E');
    expect(mempackSaveData.getSaveFiles()[0].regionName).to.equal('North America');
    expect(mempackSaveData.getSaveFiles()[0].media).to.equal('N');
    expect(ArrayBufferUtil.arrayBuffersEqual(mempackSaveData.getSaveFiles()[0].rawData, rawNote1ArrayBuffer)).to.equal(true);

    expect(mempackSaveData.getSaveFiles()[1].startingPage).to.equal(32);
    expect(mempackSaveData.getSaveFiles()[1].pageNumbers.length).to.equal(20);
    expect(mempackSaveData.getSaveFiles()[1].noteName).to.equal('T2-WAREHOUSE');
    expect(mempackSaveData.getSaveFiles()[1].noteNameExtension).to.equal('P');
    expect(mempackSaveData.getSaveFiles()[1].gameSerialCode).to.equal('NTQE');
    expect(mempackSaveData.getSaveFiles()[1].publisherCode).to.equal('52');
    expect(mempackSaveData.getSaveFiles()[1].region).to.equal('E');
    expect(mempackSaveData.getSaveFiles()[1].regionName).to.equal('North America');
    expect(mempackSaveData.getSaveFiles()[1].media).to.equal('N');
    expect(ArrayBufferUtil.arrayBuffersEqual(mempackSaveData.getSaveFiles()[1].rawData, rawNote2ArrayBuffer)).to.equal(true);
  });

  it('should create a new-style filename for a game without a note name extension', async () => {
    const rawNoteArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_ONE_FILE_NOTE_FILENAME);

    const saveFile = {
      noteName: 'MARIOKART64',
      noteNameExtension: '',
      gameSerialCode: 'NKTJ',
      publisherCode: '01',
      rawData: rawNoteArrayBuffer,
    };

    expect(N64MempackSaveData.createFilename(saveFile)).to.equal('RAW-4d4152494f4b4152543634--4e4b544a-3031');
  });

  it('should parse a new-style filename for a game without a note name extension', async () => {
    const saveFile = N64MempackSaveData.parseFilename('RAW-4d4152494f4b4152543634--4e4b544a-3031');

    expect(saveFile.noteName).to.equal('MARIOKART64');
    expect(saveFile.noteNameExtension).to.equal('');
    expect(saveFile.gameSerialCode).to.equal('NKTJ');
    expect(saveFile.publisherCode).to.equal('01');
  });

  it('should parse an old-style filename for a game without a note name extension', async () => {
    const saveFile = N64MempackSaveData.parseFilename('RAW-4d4152494f4b4152543634-4e4b544a-3031');

    expect(saveFile.noteName).to.equal('MARIOKART64');
    expect(saveFile.noteNameExtension).to.equal('');
    expect(saveFile.gameSerialCode).to.equal('NKTJ');
    expect(saveFile.publisherCode).to.equal('01');
  });

  it('should create a new-style filename for a game with a note name extension', async () => {
    const rawNoteArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_TWO_FILES_NOTE_1_FILENAME);

    const saveFile = {
      noteName: 'T2-\'',
      noteNameExtension: 'G',
      gameSerialCode: 'NTQE',
      publisherCode: '52',
      rawData: rawNoteArrayBuffer,
    };

    expect(N64MempackSaveData.createFilename(saveFile)).to.equal('RAW-54322d27-47-4e545145-3532');
  });

  it('should parse a new-style filename for a game with a note name extension', async () => {
    const saveFile = N64MempackSaveData.parseFilename('RAW-54322d27-47-4e545145-3532');

    expect(saveFile.noteName).to.equal('T2-\'');
    expect(saveFile.noteNameExtension).to.equal('G');
    expect(saveFile.gameSerialCode).to.equal('NTQE');
    expect(saveFile.publisherCode).to.equal('52');
  });

  it('should parse an old-style filename for a game with a note name extension', async () => {
    const saveFile = N64MempackSaveData.parseFilename('RAW-54322d272e47-4e545145-3532');

    expect(saveFile.noteName).to.equal('T2-\'');
    expect(saveFile.noteNameExtension).to.equal('G');
    expect(saveFile.gameSerialCode).to.equal('NTQE');
    expect(saveFile.publisherCode).to.equal('52');
  });

  it('should create a new-style filename for a game with periods in its note name', async () => {
    const rawNoteArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_PERIODS_IN_NOTENAME_NOTE_FILENAME);

    const saveFile = {
      noteName: 'S.F. RUSH',
      noteNameExtension: '',
      gameSerialCode: 'NSFE',
      publisherCode: '5D',
      rawData: rawNoteArrayBuffer,
    };

    expect(N64MempackSaveData.createFilename(saveFile)).to.equal('RAW-532e462e2052555348--4e534645-3544');
  });

  it('should parse an new-style filename for a game with periods in its note name', async () => {
    const saveFile = N64MempackSaveData.parseFilename('RAW-532e462e2052555348--4e534645-3544');

    expect(saveFile.noteName).to.equal('S.F. RUSH');
    expect(saveFile.noteNameExtension).to.equal('');
    expect(saveFile.gameSerialCode).to.equal('NSFE');
    expect(saveFile.publisherCode).to.equal('5D');
  });

  it('should parse an old-style filename for a game with periods in its note name', async () => {
    const saveFile = N64MempackSaveData.parseFilename('RAW-532e462e2052555348-4e534645-3544');

    expect(saveFile.noteName).to.equal('S.F. RUSH');
    expect(saveFile.noteNameExtension).to.equal('');
    expect(saveFile.gameSerialCode).to.equal('NSFE');
    expect(saveFile.publisherCode).to.equal('5D');
  });

  it('should create a new-style filename for a game with periods in its note name', async () => {
    const rawNoteArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_PERIODS_IN_NOTENAME_NOTE_FILENAME);

    const saveFile = {
      noteName: 'S.F. RUSH',
      noteNameExtension: '',
      gameSerialCode: 'NSFE',
      publisherCode: '5D',
      rawData: rawNoteArrayBuffer,
    };

    expect(N64MempackSaveData.createFilename(saveFile)).to.equal('RAW-532e462e2052555348--4e534645-3544');
  });
});
