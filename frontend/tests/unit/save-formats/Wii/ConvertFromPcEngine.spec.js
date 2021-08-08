import { expect } from 'chai';
import ConvertFromPcEngine from '@/save-formats/Wii/ConvertFromPcEngine';

import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/wii/pcengine';

const EXTRACTED_FILENAME = `${DIR}/Castlevania - Rondo of Blood - extracted.bup`;
const RAW_FILENAME = `${DIR}/Castlevania - Rondo of Blood - raw.srm`;

describe('Convert from the Wii PC Engine format', () => {
  it('should convert a PC Engine game correctly', async () => {
    const extractedData = await ArrayBufferUtil.readArrayBuffer(EXTRACTED_FILENAME);
    // const expectedRawData = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    const convertedData = ConvertFromPcEngine(extractedData);

    ArrayBufferUtil.writeArrayBuffer(RAW_FILENAME, convertedData.saveData);

    // expect(ArrayBufferUtil.arrayBuffersEqual(convertedData.saveData, expectedRawData)).to.equal(true);
    expect(convertedData.fileExtension).to.equal('srm');
  });
});
