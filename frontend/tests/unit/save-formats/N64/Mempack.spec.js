import { expect } from 'chai';
import seedrandom from 'seedrandom';
import N64MempackSaveData from '@/save-formats/N64/Mempack';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/n64/mempack';

const RAW_ONE_FILE_FILENAME = `${DIR}/mario-kart-64.1116.mpk`;
const RAW_ONE_FILE_NOTE_FILENAME = `${DIR}/mario-kart-64.1116-1`;

describe('N64 - Mempack save format', () => {
  before(() => {
    seedrandom('Zelda 2D > Zelda 3D', { global: true }); // Overwrite Math.random() so that it's predictable
  });

  it('should create a file containing a single save that is 121 pages', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_ONE_FILE_FILENAME);
    const rawNoteArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_ONE_FILE_NOTE_FILENAME);

    const saveFiles = [{
      noteName: 'MARIOKART64',
      gameSerialCode: 'NKTJ',
      publisherCode: '01',
      rawData: rawNoteArrayBuffer,
    }];

    const mempackSaveData = N64MempackSaveData.createFromSaveFiles(saveFiles);

    expect(ArrayBufferUtil.arrayBuffersEqual(mempackSaveData.getArrayBuffer(), rawArrayBuffer)).to.equal(true);

    expect(mempackSaveData.getSaveFiles().length).to.equal(1);

    expect(mempackSaveData.getSaveFiles()[0].startingPage).to.equal(5);
    expect(mempackSaveData.getSaveFiles()[0].pageNumbers.length).to.equal(121);
    expect(mempackSaveData.getSaveFiles()[0].noteName).to.equal('MARIOKART64');
    expect(mempackSaveData.getSaveFiles()[0].gameSerialCode).to.equal('NKTJ');
    expect(mempackSaveData.getSaveFiles()[0].publisherCode).to.equal('01');
    expect(mempackSaveData.getSaveFiles()[0].region).to.equal('J');
    expect(mempackSaveData.getSaveFiles()[0].media).to.equal('N');
    expect(ArrayBufferUtil.arrayBuffersEqual(mempackSaveData.getSaveFiles()[0].rawData, rawNoteArrayBuffer)).to.equal(true);
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
