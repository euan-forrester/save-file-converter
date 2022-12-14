import { expect } from 'chai';
import ConvertFromPcEngine from '@/save-formats/Wii/ConvertFromPcEngine';

import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/data/save-formats/wii/pcengine';

const CASTLEVANIA_MY_EXTRACTED_FILENAME = `${DIR}/Castlevania - Rondo of Blood (my save) - extracted.bup`;
const CASTLEVANIA_MY_RAW_FILENAME = `${DIR}/Castlevania - Rondo of Blood (my save) - raw.sav`;

const CASTLEVANIA_TEST_EXTRACTED_FILENAME = `${DIR}/Castlevania - Rondo of Blood (test save) - extracted.bup`;
const CASTLEVANIA_TEST_RAW_FILENAME = `${DIR}/Castlevania - Rondo of Blood (test save) - raw.sav`;

const BOMBERMAN_EXTRACTED_FILENAME = `${DIR}/bomberman-93.20114 - extracted.bup`;
const BOMBERMAN_RAW_FILENAME = `${DIR}/bomberman-93.20114 - raw.sav`;

const NEUTOPIA_EXTRACTED_FILENAME = `${DIR}/neutopia-ii.21439 - extracted.bup`;
const NEUTOPIA_RAW_FILENAME = `${DIR}/neutopia-ii.21439 - raw.sav`;

const LODERUNNER_EXTRACTED_FILENAME = `${DIR}/battle-lode-runner.16193 - extracted.bup`;
const LODERUNNER_RAW_FILENAME = `${DIR}/battle-lode-runner.16193 - raw.sav`;

describe('Convert from the Wii PC Engine format', () => {
  it('should convert Castlevania - Rondo of Blood (my save) correctly', async () => {
    const extractedData = await ArrayBufferUtil.readArrayBuffer(CASTLEVANIA_MY_EXTRACTED_FILENAME);
    const expectedRawData = await ArrayBufferUtil.readArrayBuffer(CASTLEVANIA_MY_RAW_FILENAME);

    const convertedData = ConvertFromPcEngine(extractedData);

    expect(ArrayBufferUtil.arrayBuffersEqual(convertedData.saveData, expectedRawData)).to.equal(true);
    expect(convertedData.fileExtension).to.equal('sav');
  });

  it('should convert Castlevania - Rondo of Blood (test save) correctly', async () => {
    const extractedData = await ArrayBufferUtil.readArrayBuffer(CASTLEVANIA_TEST_EXTRACTED_FILENAME);
    const expectedRawData = await ArrayBufferUtil.readArrayBuffer(CASTLEVANIA_TEST_RAW_FILENAME);

    const convertedData = ConvertFromPcEngine(extractedData);

    expect(ArrayBufferUtil.arrayBuffersEqual(convertedData.saveData, expectedRawData)).to.equal(true);
    expect(convertedData.fileExtension).to.equal('sav');
  });

  it('should convert Bomberman \'93 correctly', async () => {
    const extractedData = await ArrayBufferUtil.readArrayBuffer(BOMBERMAN_EXTRACTED_FILENAME);
    const expectedRawData = await ArrayBufferUtil.readArrayBuffer(BOMBERMAN_RAW_FILENAME);

    const convertedData = ConvertFromPcEngine(extractedData);

    expect(ArrayBufferUtil.arrayBuffersEqual(convertedData.saveData, expectedRawData)).to.equal(true);
    expect(convertedData.fileExtension).to.equal('sav');
  });

  it('should convert Neutopia II correctly', async () => {
    const extractedData = await ArrayBufferUtil.readArrayBuffer(NEUTOPIA_EXTRACTED_FILENAME);
    const expectedRawData = await ArrayBufferUtil.readArrayBuffer(NEUTOPIA_RAW_FILENAME);

    const convertedData = ConvertFromPcEngine(extractedData);

    expect(ArrayBufferUtil.arrayBuffersEqual(convertedData.saveData, expectedRawData)).to.equal(true);
    expect(convertedData.fileExtension).to.equal('sav');
  });

  it('should convert Battle Lode Runner correctly', async () => {
    const extractedData = await ArrayBufferUtil.readArrayBuffer(LODERUNNER_EXTRACTED_FILENAME);
    const expectedRawData = await ArrayBufferUtil.readArrayBuffer(LODERUNNER_RAW_FILENAME);

    const convertedData = ConvertFromPcEngine(extractedData);

    expect(ArrayBufferUtil.arrayBuffersEqual(convertedData.saveData, expectedRawData)).to.equal(true);
    expect(convertedData.fileExtension).to.equal('sav');
  });
});
