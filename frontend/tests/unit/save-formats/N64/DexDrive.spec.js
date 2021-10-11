import { expect } from 'chai';
import N64DexDriveSaveData from '@/save-formats/N64/DexDrive';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/n64/dexdrive';

const DEXDRIVE_ONE_FILE_FILENAME = `${DIR}/mario-kart-64.1116.n64`;
const RAW_ONE_FILE_FILENAME = `${DIR}/mario-kart-64.1116.mpk`;
const RAW_ONE_FILE_NOTE_FILENAME = `${DIR}/mario-kart-64.1116-1`;

describe('N64 - DexDrive save format', () => {
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
