import { expect } from 'chai';
import ConvertFromSega from '@/save-formats/Wii/ConvertFromSega';

import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/wii/sega';

const MASTER_SYSTEM_EXTRACTED_FILENAME = `${DIR}/phantasy-star.21604-extracted.bin`; // This one contains "compound data"
const MASTER_SYSTEM_RAW_FILENAME = `${DIR}/phantasy-star.21604-raw.bin`;

const GENESIS_SRAM_EXTRACTED_FILENAME = `${DIR}/phantasy-star-ii.18168-extracted.bin`; // This one does not contain "compound data"
const GENESIS_SRAM_RAW_FILENAME = `${DIR}/phantasy-star-ii.18168-raw.bin`;

const GENESIS_EEPROM_EXTRACTED_FILENAME = `${DIR}/wonder-boy-in-monster-world-extracted.bin`; // This one does not contain "compound data"
const GENESIS_EEPROM_RAW_FILENAME = `${DIR}/wonder-boy-in-monster-world-raw.bin`;

const GENESIS_FRAM_EXTRACTED_FILENAME = `${DIR}/sonic-the-hedgehog-3.18899-extracted.bin`; // This one does not contain "compound data"
const GENESIS_FRAM_RAW_FILENAME = `${DIR}/sonic-the-hedgehog-3.18899-raw.bin`;

describe('Convert from the Wii Sega formats', () => {
  it('should convert a Master System game correctly', async () => {
    const extractedData = await ArrayBufferUtil.readArrayBuffer(MASTER_SYSTEM_EXTRACTED_FILENAME);
    const expectedRawData = await ArrayBufferUtil.readArrayBuffer(MASTER_SYSTEM_RAW_FILENAME);

    const convertedData = ConvertFromSega(extractedData, 'VC-SMS');

    expect(ArrayBufferUtil.arrayBuffersEqual(convertedData.saveData, expectedRawData)).to.equal(true);
    expect(convertedData.fileExtension).to.equal('sav');
  });

  it('should convert a Genesis SRAM game correctly', async () => {
    const extractedData = await ArrayBufferUtil.readArrayBuffer(GENESIS_SRAM_EXTRACTED_FILENAME);
    const expectedRawData = await ArrayBufferUtil.readArrayBuffer(GENESIS_SRAM_RAW_FILENAME);

    const convertedData = ConvertFromSega(extractedData, 'VC-MD', 'SRAM');

    expect(ArrayBufferUtil.arrayBuffersEqual(convertedData.saveData, expectedRawData)).to.equal(true);
    expect(convertedData.fileExtension).to.equal('srm');
  });

  it('should convert a Genesis EEPROM game correctly', async () => {
    const extractedData = await ArrayBufferUtil.readArrayBuffer(GENESIS_EEPROM_EXTRACTED_FILENAME);
    const expectedRawData = await ArrayBufferUtil.readArrayBuffer(GENESIS_EEPROM_RAW_FILENAME);

    const convertedData = ConvertFromSega(extractedData, 'VC-MD', 'EEPROM');

    expect(ArrayBufferUtil.arrayBuffersEqual(convertedData.saveData, expectedRawData)).to.equal(true);
    expect(convertedData.fileExtension).to.equal('srm');
  });

  it('should convert a Genesis FRAM game correctly', async () => {
    const extractedData = await ArrayBufferUtil.readArrayBuffer(GENESIS_FRAM_EXTRACTED_FILENAME);
    const expectedRawData = await ArrayBufferUtil.readArrayBuffer(GENESIS_FRAM_RAW_FILENAME);

    const convertedData = ConvertFromSega(extractedData, 'VC-MD', 'FRAM');

    expect(ArrayBufferUtil.arrayBuffersEqual(convertedData.saveData, expectedRawData)).to.equal(true);
    expect(convertedData.fileExtension).to.equal('srm');
  });
});
