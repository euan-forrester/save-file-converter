import { expect } from 'chai';
import seedrandom from 'seedrandom';
import N64DexDriveSaveData from '@/save-formats/N64/DexDrive';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/n64/dexdrive';

const DEXDRIVE_ONE_FILE_FILENAME = `${DIR}/mario-kart-64.1116.n64`;
const RAW_ONE_FILE_FILENAME = `${DIR}/mario-kart-64.1116.mpk`;
const RAW_ONE_FILE_NOTE_FILENAME = `${DIR}/mario-kart-64.1116-1`;

const DEXDRIVE_TWO_FILES_FILENAME = `${DIR}/tony-hawks-pro-skater-2.1077.n64`;
const RAW_TWO_FILES_FILENAME = `${DIR}/tony-hawks-pro-skater-2.1077.mpk`;
const RAW_TWO_FILES_NOTE_1_FILENAME = `${DIR}/tony-hawks-pro-skater-2.1077-1`;
const RAW_TWO_FILES_NOTE_2_FILENAME = `${DIR}/tony-hawks-pro-skater-2.1077-2`;

const DEXDRIVE_TWO_FILES_OUTPUT_FILENAME = `${DIR}/tony-hawks-pro-skater-2.1077-output.n64`;

describe('N64 - DexDrive save format', () => {
  before(() => {
    seedrandom('Happy day = when I realized collectathons were no longer a genre', { global: true }); // Overwrite Math.random() so that it's predictable
  });

  it('should convert a file containing a single save that is 121 pages', async () => {
    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DEXDRIVE_ONE_FILE_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_ONE_FILE_FILENAME);
    const rawNoteArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_ONE_FILE_NOTE_FILENAME);

    const dexDriveSaveData = N64DexDriveSaveData.createFromDexDriveData(dexDriveArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getMempack().getArrayBuffer(), rawArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles().length).to.equal(1);

    expect(dexDriveSaveData.getSaveFiles()[0].startingPage).to.equal(5);
    expect(dexDriveSaveData.getSaveFiles()[0].pageNumbers.length).to.equal(121);
    expect(dexDriveSaveData.getSaveFiles()[0].noteName).to.equal('MARIOKART64');
    expect(dexDriveSaveData.getSaveFiles()[0].comment).to.equal('');
    expect(dexDriveSaveData.getSaveFiles()[0].gameSerialCode).to.equal('NKTJ');
    expect(dexDriveSaveData.getSaveFiles()[0].publisherCode).to.equal('01');
    expect(dexDriveSaveData.getSaveFiles()[0].region).to.equal('J');
    expect(dexDriveSaveData.getSaveFiles()[0].media).to.equal('N');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[0].rawData, rawNoteArrayBuffer)).to.equal(true);
  });

  it('should convert a file containing two saves that are 27 and 20 pages', async () => {
    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DEXDRIVE_TWO_FILES_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_TWO_FILES_FILENAME);
    const rawNote1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_TWO_FILES_NOTE_1_FILENAME);
    const rawNote2ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_TWO_FILES_NOTE_2_FILENAME);

    const dexDriveSaveData = N64DexDriveSaveData.createFromDexDriveData(dexDriveArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getMempack().getArrayBuffer(), rawArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles().length).to.equal(2);

    expect(dexDriveSaveData.getSaveFiles()[0].startingPage).to.equal(5);
    expect(dexDriveSaveData.getSaveFiles()[0].pageNumbers.length).to.equal(27);
    expect(dexDriveSaveData.getSaveFiles()[0].noteName).to.equal('T2-\'.G');
    expect(dexDriveSaveData.getSaveFiles()[0].comment).to.equal('');
    expect(dexDriveSaveData.getSaveFiles()[0].gameSerialCode).to.equal('NTQE');
    expect(dexDriveSaveData.getSaveFiles()[0].publisherCode).to.equal('52');
    expect(dexDriveSaveData.getSaveFiles()[0].region).to.equal('E');
    expect(dexDriveSaveData.getSaveFiles()[0].media).to.equal('N');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[0].rawData, rawNote1ArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles()[1].startingPage).to.equal(32);
    expect(dexDriveSaveData.getSaveFiles()[1].pageNumbers.length).to.equal(20);
    expect(dexDriveSaveData.getSaveFiles()[1].noteName).to.equal('T2-WAREHOUSE.P');
    expect(dexDriveSaveData.getSaveFiles()[1].comment).to.equal('');
    expect(dexDriveSaveData.getSaveFiles()[1].gameSerialCode).to.equal('NTQE');
    expect(dexDriveSaveData.getSaveFiles()[1].publisherCode).to.equal('52');
    expect(dexDriveSaveData.getSaveFiles()[1].region).to.equal('E');
    expect(dexDriveSaveData.getSaveFiles()[1].media).to.equal('N');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[1].rawData, rawNote2ArrayBuffer)).to.equal(true);
  });

  it('should create a file containing two saves that are 27 and 20 pages with comments', async () => {
    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DEXDRIVE_TWO_FILES_OUTPUT_FILENAME);
    const rawNote1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_TWO_FILES_NOTE_1_FILENAME);
    const rawNote2ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_TWO_FILES_NOTE_2_FILENAME);

    const saveFiles = [{
      noteName: 'T2-\'.G',
      gameSerialCode: 'NTQE',
      publisherCode: '52',
      comment: 'Comment 1',
      rawData: rawNote1ArrayBuffer,
    },
    {
      noteName: 'T2-WAREHOUSE.P',
      gameSerialCode: 'NTQE',
      publisherCode: '52',
      comment: 'Comment 2',
      rawData: rawNote2ArrayBuffer,
    }];

    const dexDriveSaveData = N64DexDriveSaveData.createFromSaveFiles(saveFiles);

    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getArrayBuffer(), dexDriveArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles().length).to.equal(2);

    expect(dexDriveSaveData.getSaveFiles()[0].startingPage).to.equal(5);
    expect(dexDriveSaveData.getSaveFiles()[0].pageNumbers.length).to.equal(27);
    expect(dexDriveSaveData.getSaveFiles()[0].noteName).to.equal('T2-\'.G');
    expect(dexDriveSaveData.getSaveFiles()[0].comment).to.equal('Comment 1');
    expect(dexDriveSaveData.getSaveFiles()[0].gameSerialCode).to.equal('NTQE');
    expect(dexDriveSaveData.getSaveFiles()[0].publisherCode).to.equal('52');
    expect(dexDriveSaveData.getSaveFiles()[0].region).to.equal('E');
    expect(dexDriveSaveData.getSaveFiles()[0].media).to.equal('N');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[0].rawData, rawNote1ArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles()[1].startingPage).to.equal(32);
    expect(dexDriveSaveData.getSaveFiles()[1].pageNumbers.length).to.equal(20);
    expect(dexDriveSaveData.getSaveFiles()[1].noteName).to.equal('T2-WAREHOUSE.P');
    expect(dexDriveSaveData.getSaveFiles()[1].comment).to.equal('Comment 2');
    expect(dexDriveSaveData.getSaveFiles()[1].gameSerialCode).to.equal('NTQE');
    expect(dexDriveSaveData.getSaveFiles()[1].publisherCode).to.equal('52');
    expect(dexDriveSaveData.getSaveFiles()[1].region).to.equal('E');
    expect(dexDriveSaveData.getSaveFiles()[1].media).to.equal('N');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[1].rawData, rawNote2ArrayBuffer)).to.equal(true);
  });
});

/*
    this.saveFiles.forEach((x) => {
      console.log(`For save ID '${x.id}':`);
      console.log(`  Starting page: '${x.startingPage}'`);
      console.log(`  Page numbers '${x.pageNumbers}'`);
      console.log(`  Note name '${x.noteName}'`);
      console.log(`  Game serial code '${x.gameSerialCode}'`);
      console.log(`  Publisher code '${x.publisherCode}'`);
      console.log(`  Region: '${x.region}'`);
      console.log(`  Media: '${x.media}'`);
      console.log(`  Raw save length: '${x.rawData.byteLength}'`);
    });
*/
