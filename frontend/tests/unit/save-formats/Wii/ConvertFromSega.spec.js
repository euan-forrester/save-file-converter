import { expect } from 'chai';
import ConvertFromSega from '@/save-formats/Wii/ConvertFromSega';

import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/';

const MASTER_SYSTEM_EXTRACTED_FILENAME = DIR.concat('phantasy-star.21604-extracted.bin'); // This one contains "compound data"
const MASTER_SYSTEM_RAW_FILENAME = DIR.concat('phantasy-star.21604-raw.bin');

const GENESIS_EXTRACTED_FILENAME = DIR.concat('phantasy-star-ii.18168-extracted.bin'); // This one does not contain "compound data"
const GENESIS_RAW_FILENAME = DIR.concat('phantasy-star-ii.18168-raw.bin');

describe('Convert from the Wii Sega formats', () => {
  it('should convert a Master System game correctly', async () => {
    const extractedData = await ArrayBufferUtil.readArrayBuffer(MASTER_SYSTEM_EXTRACTED_FILENAME);
    const expectedRawData = await ArrayBufferUtil.readArrayBuffer(MASTER_SYSTEM_RAW_FILENAME);

    const convertedData = ConvertFromSega(extractedData, 'VC-SMS');

    expect(ArrayBufferUtil.arrayBuffersEqual(convertedData.saveData, expectedRawData)).to.equal(true);
    expect(convertedData.fileExtension).to.equal('sav');
  });

  it('should convert a Genesis game correctly', async () => {
    const extractedData = await ArrayBufferUtil.readArrayBuffer(GENESIS_EXTRACTED_FILENAME);
    const expectedRawData = await ArrayBufferUtil.readArrayBuffer(GENESIS_RAW_FILENAME);

    const convertedData = ConvertFromSega(extractedData, 'VC-MD');

    expect(ArrayBufferUtil.arrayBuffersEqual(convertedData.saveData, expectedRawData)).to.equal(true);
    expect(convertedData.fileExtension).to.equal('srm');
  });
});
