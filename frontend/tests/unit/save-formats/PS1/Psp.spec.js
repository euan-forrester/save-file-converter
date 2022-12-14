import { expect } from 'chai';
import PspSaveData from '@/save-formats/PS1/Psp';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/data/save-formats/ps1/psp';

const PSP_SIGNATURE_FILENAME = `${DIR}/Suikoden 2-psp-signature.VMP`;
const PROGRAM_SIGNATURE_FILENAME = `${DIR}/Suikoden 2-vita-mcr2vmp-signature.VMP`;
const WEB_SIGNATURE_FILENAME = `${DIR}/Suikoden 1-save-editor-signature.VMP`;
const NO_SIGNATURE_FILENAME = `${DIR}/Suikoden 2-no-signature.VMP`;

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

const RAW_FIVE_BLOCK_PLUS_OTHER_STUFF_FILENAME = [`${DIR}/gran-turismo.26537-BASCUS-94194GT.srm`, `${DIR}/gran-turismo.26537-BASCUS-94194RT.srm`];
const OUTPUT_PSP_FIVE_BLOCK_PLUS_OTHER_STUFF_FILENAME = `${DIR}/gran-turismo.26537-output.vmp`;

describe('PS1 - PSP save format', () => {
  it('should correctly verify the signature of a file written by a PSP', async () => {
    const pspArrayBuffer = await ArrayBufferUtil.readArrayBuffer(PSP_SIGNATURE_FILENAME);

    PspSaveData.createFromPspData(pspArrayBuffer);
  });

  it('should correctly verify the signature of a file written by vita-mcr2vmp', async () => {
    const pspArrayBuffer = await ArrayBufferUtil.readArrayBuffer(PROGRAM_SIGNATURE_FILENAME);

    PspSaveData.createFromPspData(pspArrayBuffer);
  });

  it('should correctly verify the signature of a file written by save-editor.com', async () => {
    const pspArrayBuffer = await ArrayBufferUtil.readArrayBuffer(WEB_SIGNATURE_FILENAME);

    PspSaveData.createFromPspData(pspArrayBuffer);
  });

  it('should correctly reject a file with an incorrect signature', async () => {
    const pspArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NO_SIGNATURE_FILENAME);

    expect(() => PspSaveData.createFromPspData(pspArrayBuffer)).to.throw(
      // Passing in a specific instance of an Error triggers a comparison of the references: https://github.com/chaijs/chai/issues/430
      Error,
      'Save appears to be corrupted: expected signature 0000000000000000000000000000000000000000 but calculated signature 93a06a162ae1808643027aeb2c95d80bbee92a39',
    );
  });

  it('should convert a file containing seven saves that are each two blocks', async () => {
    const pspArrayBuffer = await ArrayBufferUtil.readArrayBuffer(PSP_SEVEN_FILES_FILENAME);
    const rawArrayBuffers = await Promise.all(RAW_SEVEN_FILES_FILENAMES.map((n) => ArrayBufferUtil.readArrayBuffer(n)));

    const pspSaveData = PspSaveData.createFromPspData(pspArrayBuffer);

    expect(pspSaveData.getSaveFiles().length).to.equal(7);

    expect(pspSaveData.getSaveFiles()[0].startingBlock).to.equal(0);
    expect(pspSaveData.getSaveFiles()[0].filename).to.equal('BASLUS-00958GS2-1');
    expect(pspSaveData.getSaveFiles()[0].regionName).to.equal('North America');
    expect(pspSaveData.getSaveFiles()[0].description).to.equal('SUIKODEN2-(1) LV57  31:11:33');
    expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getSaveFiles()[0].rawData, rawArrayBuffers[0])).to.equal(true);

    expect(pspSaveData.getSaveFiles()[1].startingBlock).to.equal(2);
    expect(pspSaveData.getSaveFiles()[1].filename).to.equal('BASLUS-00958GS2-2');
    expect(pspSaveData.getSaveFiles()[1].regionName).to.equal('North America');
    expect(pspSaveData.getSaveFiles()[1].description).to.equal('SUIKODEN2-(2) LV57  31:16:35');
    expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getSaveFiles()[1].rawData, rawArrayBuffers[1])).to.equal(true);

    expect(pspSaveData.getSaveFiles()[2].startingBlock).to.equal(4);
    expect(pspSaveData.getSaveFiles()[2].filename).to.equal('BASLUS-00958GS2-3');
    expect(pspSaveData.getSaveFiles()[2].regionName).to.equal('North America');
    expect(pspSaveData.getSaveFiles()[2].description).to.equal('SUIKODEN2-(3) LV57  31:25:14');
    expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getSaveFiles()[2].rawData, rawArrayBuffers[2])).to.equal(true);

    expect(pspSaveData.getSaveFiles()[3].startingBlock).to.equal(6);
    expect(pspSaveData.getSaveFiles()[3].filename).to.equal('BASLUS-00958GS2-4');
    expect(pspSaveData.getSaveFiles()[3].regionName).to.equal('North America');
    expect(pspSaveData.getSaveFiles()[3].description).to.equal('SUIKODEN2-(4) LV54  30:31:12');
    expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getSaveFiles()[3].rawData, rawArrayBuffers[3])).to.equal(true);

    expect(pspSaveData.getSaveFiles()[4].startingBlock).to.equal(8);
    expect(pspSaveData.getSaveFiles()[4].filename).to.equal('BASLUS-00958GS2-5');
    expect(pspSaveData.getSaveFiles()[4].regionName).to.equal('North America');
    expect(pspSaveData.getSaveFiles()[4].description).to.equal('SUIKODEN2-(5) LV59  32:30:22');
    expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getSaveFiles()[4].rawData, rawArrayBuffers[4])).to.equal(true);

    expect(pspSaveData.getSaveFiles()[5].startingBlock).to.equal(10);
    expect(pspSaveData.getSaveFiles()[5].filename).to.equal('BASLUS-00958GS2-6');
    expect(pspSaveData.getSaveFiles()[5].regionName).to.equal('North America');
    expect(pspSaveData.getSaveFiles()[5].description).to.equal('SUIKODEN2-(6) LV60  32:39:39');
    expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getSaveFiles()[5].rawData, rawArrayBuffers[5])).to.equal(true);

    expect(pspSaveData.getSaveFiles()[6].startingBlock).to.equal(12);
    expect(pspSaveData.getSaveFiles()[6].filename).to.equal('BASLUS-00958GS2-7');
    expect(pspSaveData.getSaveFiles()[6].regionName).to.equal('North America');
    expect(pspSaveData.getSaveFiles()[6].description).to.equal('SUIKODEN2-(7) LV60  32:54:42');
    expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getSaveFiles()[6].rawData, rawArrayBuffers[6])).to.equal(true);
  });

  it('should correctly create a file that has two saves of 3 and 5 blocks respectively', async () => {
    const pspArrayBuffer = await ArrayBufferUtil.readArrayBuffer(OUTPUT_PSP_FIVE_BLOCK_PLUS_OTHER_STUFF_FILENAME);
    const saveFilesArrayBuffers = await Promise.all(RAW_FIVE_BLOCK_PLUS_OTHER_STUFF_FILENAME.map((n) => ArrayBufferUtil.readArrayBuffer(n)));
    const saveFilenames = RAW_FIVE_BLOCK_PLUS_OTHER_STUFF_FILENAME.map((n) => n.substr(-18, 14));
    const saveFiles = RAW_FIVE_BLOCK_PLUS_OTHER_STUFF_FILENAME.map((n, i) => ({ filename: saveFilenames[i], rawData: saveFilesArrayBuffers[i] }));

    const pspSaveData = PspSaveData.createFromSaveFiles(saveFiles);

    expect(pspSaveData.getSaveFiles().length).to.equal(RAW_FIVE_BLOCK_PLUS_OTHER_STUFF_FILENAME.length);

    expect(pspSaveData.getSaveFiles()[0].startingBlock).to.equal(0);
    expect(pspSaveData.getSaveFiles()[0].filename).to.equal('BASCUS-94194GT');
    expect(pspSaveData.getSaveFiles()[0].regionName).to.equal('North America');
    expect(pspSaveData.getSaveFiles()[0].description).to.equal('GT game data');
    expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getSaveFiles()[0].rawData, saveFilesArrayBuffers[0])).to.equal(true);

    expect(pspSaveData.getSaveFiles()[1].startingBlock).to.equal(5);
    expect(pspSaveData.getSaveFiles()[1].filename).to.equal('BASCUS-94194RT');
    expect(pspSaveData.getSaveFiles()[1].regionName).to.equal('North America');
    expect(pspSaveData.getSaveFiles()[1].description).to.equal('GT replay data');
    expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getSaveFiles()[1].rawData, saveFilesArrayBuffers[1])).to.equal(true);

    expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getArrayBuffer(), pspArrayBuffer)).to.equal(true);
  });
});
