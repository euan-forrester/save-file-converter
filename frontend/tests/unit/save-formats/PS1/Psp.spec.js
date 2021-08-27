import { expect } from 'chai';
import PspSaveData from '@/save-formats/PS1/Psp';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/ps1/psp';

const PSP_SEVEN_FILES_FILENAME = `${DIR}/Suikoden 2.VMP`;
const RAW_SEVEN_FILES_FILENAMES = [
  `${DIR}/Suikoden 2-BASLUS-00958GS2-1.srm`,
  `${DIR}/Suikoden 2-BASLUS-00958GS2-2.srm`,
  `${DIR}/Suikoden 2-BASLUS-00958GS2-3.srm`,
  `${DIR}/Suikoden 2-BASLUS-00958GS2-4.srm`,
  `${DIR}/Suikoden 2-BASLUS-00958GS2-5.srm`,
  `${DIR}/Suikoden 2-BASLUS-00958GS2-6.srm`,
  `${DIR}/Suikoden 2-BASLUS-00958GS2-7.srm`,
];

describe('PSP PS1 save format', () => {
  it('should convert a file containing seven saves that are each two blocks', async () => {
    const pspArrayBuffer = await ArrayBufferUtil.readArrayBuffer(PSP_SEVEN_FILES_FILENAME);
    const rawArrayBuffers = await Promise.all(RAW_SEVEN_FILES_FILENAMES.map((n) => ArrayBufferUtil.readArrayBuffer(n)));

    const pspSaveData = PspSaveData.createFromPspData(pspArrayBuffer);

    expect(pspSaveData.getSaveFiles().length).to.equal(7);

    expect(pspSaveData.getSaveFiles()[0].startingBlock).to.equal(0);
    expect(pspSaveData.getSaveFiles()[0].filename).to.equal('BASLUS-00958GS2-1');
    expect(pspSaveData.getSaveFiles()[0].description).to.equal('ＳＵＩＫＯＤＥＮ２－（１）　ＬＶ５７　　３１：１１：３３');
    expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getSaveFiles()[0].rawData, rawArrayBuffers[0])).to.equal(true);

    expect(pspSaveData.getSaveFiles()[1].startingBlock).to.equal(2);
    expect(pspSaveData.getSaveFiles()[1].filename).to.equal('BASLUS-00958GS2-2');
    expect(pspSaveData.getSaveFiles()[1].description).to.equal('ＳＵＩＫＯＤＥＮ２－（２）　ＬＶ５７　　３１：１６：３５');
    expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getSaveFiles()[1].rawData, rawArrayBuffers[1])).to.equal(true);

    expect(pspSaveData.getSaveFiles()[2].startingBlock).to.equal(4);
    expect(pspSaveData.getSaveFiles()[2].filename).to.equal('BASLUS-00958GS2-3');
    expect(pspSaveData.getSaveFiles()[2].description).to.equal('ＳＵＩＫＯＤＥＮ２－（３）　ＬＶ５７　　３１：２５：１４');
    expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getSaveFiles()[2].rawData, rawArrayBuffers[2])).to.equal(true);

    expect(pspSaveData.getSaveFiles()[3].startingBlock).to.equal(6);
    expect(pspSaveData.getSaveFiles()[3].filename).to.equal('BASLUS-00958GS2-4');
    expect(pspSaveData.getSaveFiles()[3].description).to.equal('ＳＵＩＫＯＤＥＮ２－（４）　ＬＶ５４　　３０：３１：１２');
    expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getSaveFiles()[3].rawData, rawArrayBuffers[3])).to.equal(true);

    expect(pspSaveData.getSaveFiles()[4].startingBlock).to.equal(8);
    expect(pspSaveData.getSaveFiles()[4].filename).to.equal('BASLUS-00958GS2-5');
    expect(pspSaveData.getSaveFiles()[4].description).to.equal('ＳＵＩＫＯＤＥＮ２－（５）　ＬＶ５９　　３２：３０：２２');
    expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getSaveFiles()[4].rawData, rawArrayBuffers[4])).to.equal(true);

    expect(pspSaveData.getSaveFiles()[5].startingBlock).to.equal(10);
    expect(pspSaveData.getSaveFiles()[5].filename).to.equal('BASLUS-00958GS2-6');
    expect(pspSaveData.getSaveFiles()[5].description).to.equal('ＳＵＩＫＯＤＥＮ２－（６）　ＬＶ６０　　３２：３９：３９');
    expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getSaveFiles()[5].rawData, rawArrayBuffers[5])).to.equal(true);

    expect(pspSaveData.getSaveFiles()[6].startingBlock).to.equal(12);
    expect(pspSaveData.getSaveFiles()[6].filename).to.equal('BASLUS-00958GS2-7');
    expect(pspSaveData.getSaveFiles()[6].description).to.equal('ＳＵＩＫＯＤＥＮ２－（７）　ＬＶ６０　　３２：５４：４２');
    expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getSaveFiles()[6].rawData, rawArrayBuffers[6])).to.equal(true);
  });
});
