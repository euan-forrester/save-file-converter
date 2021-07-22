import { expect } from 'chai';
import ConvertFromN64 from '@/save-formats/Wii/ConvertFromN64';

import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/';

// One save of each type from here: http://micro-64.com/database/gamesave.shtml

// Maybe we should find a game where the extracted file is 2kB in size? The code we based the conversion off of seemed to think they exist

// 0.5kB EEPROM
// Curiously, the extracted file is 16kB in size, which is then cut down to 2kB by the conversion process. Loads fine in mupen64plus
const EEPROM_05KB_EXTRACTED_FILENAME = DIR.concat('super-mario-64.14546-extracted.bin');
const EEPROM_05KB_RAW_FILENAME = DIR.concat('super-mario-64.14546-raw.eep');

// 2kB EEPROM
// Again, the extracted file is 16kB in size, which is then cut down to 2kB
const EEPROM_2KB_EXTRACTED_FILENAME = DIR.concat('yoshis-story.17238-extracted.bin');
const EEPROM_2KB_RAW_FILENAME = DIR.concat('yoshis-story.17238-raw.eep');

// 32kB SRAM (on cart)
const SRAM_32KB_CART_EXTRACTED_FILENAME = DIR.concat('f-zero-x.15165-extracted.bin');
const SRAM_32KB_CART_RAW_FILENAME = DIR.concat('f-zero-x.15165-raw.sra');

// 32kB SRAM (on Controller Pak)
// The extracted file here is 16kB in size
const SRAM_32KB_CONTROLLER_PAK_EXTRACTED_FILENAME = DIR.concat('mario-kart-64.14534-extracted.bin');
const SRAM_32KB_CONTROLLER_PAK_RAW_FILENAME = DIR.concat('mario-kart-64.14534-raw.eep');

// 128kB Flash RAM
const FLASHRAM_128KB_CART_EXTRACTED_FILENAME = DIR.concat('paper-mario.17225-extracted.bin');
const FLASHRAM_128KB_CART_RAW_FILENAME = DIR.concat('paper-mario.17225-raw.fla');

// 128kB Flash RAM (but extracted file is only 32kB in size). Not sure if it's just has its save type listed incorrectly on that site, or if something else is going on
// FIXME: The resultant file doesn't work with mupen64plus
const FLASHRAM_128KB_CART_BUT_SMALL_FILE_EXTRACTED_FILENAME = DIR.concat('the-legend-of-zelda-majoras-mask.19167-extracted.bin');
const FLASHRAM_128KB_CART_BUT_SMALL_FILE_RAW_FILENAME = DIR.concat('the-legend-of-zelda-majoras-mask.19167-raw.sra');

describe('Convert from the Wii N64 formats', () => {
  it('should convert a 0.5kB EEPROM game correctly', async () => {
    const extractedData = await ArrayBufferUtil.readArrayBuffer(EEPROM_05KB_EXTRACTED_FILENAME);
    const expectedRawData = await ArrayBufferUtil.readArrayBuffer(EEPROM_05KB_RAW_FILENAME);

    const convertedData = ConvertFromN64(extractedData);

    expect(ArrayBufferUtil.arrayBuffersEqual(convertedData.saveData, expectedRawData)).to.equal(true);
    expect(convertedData.fileExtension).to.equal('eep');
  });

  it('should convert a 2kB EEPROM game correctly', async () => {
    const extractedData = await ArrayBufferUtil.readArrayBuffer(EEPROM_2KB_EXTRACTED_FILENAME);
    const expectedRawData = await ArrayBufferUtil.readArrayBuffer(EEPROM_2KB_RAW_FILENAME);

    const convertedData = ConvertFromN64(extractedData);

    expect(ArrayBufferUtil.arrayBuffersEqual(convertedData.saveData, expectedRawData)).to.equal(true);
    expect(convertedData.fileExtension).to.equal('eep');
  });

  it('should convert a 32kB SRAM (on cart) game correctly', async () => {
    const extractedData = await ArrayBufferUtil.readArrayBuffer(SRAM_32KB_CART_EXTRACTED_FILENAME);
    const expectedRawData = await ArrayBufferUtil.readArrayBuffer(SRAM_32KB_CART_RAW_FILENAME);

    const convertedData = ConvertFromN64(extractedData);

    expect(ArrayBufferUtil.arrayBuffersEqual(convertedData.saveData, expectedRawData)).to.equal(true);
    expect(convertedData.fileExtension).to.equal('sra');
  });

  it('should convert a 32kB SRAM (on Controller Pak) game correctly', async () => {
    const extractedData = await ArrayBufferUtil.readArrayBuffer(SRAM_32KB_CONTROLLER_PAK_EXTRACTED_FILENAME);
    const expectedRawData = await ArrayBufferUtil.readArrayBuffer(SRAM_32KB_CONTROLLER_PAK_RAW_FILENAME);

    const convertedData = ConvertFromN64(extractedData);

    expect(ArrayBufferUtil.arrayBuffersEqual(convertedData.saveData, expectedRawData)).to.equal(true);
    expect(convertedData.fileExtension).to.equal('eep');
  });

  it('should convert a 128kB Flash RAM game correctly', async () => {
    const extractedData = await ArrayBufferUtil.readArrayBuffer(FLASHRAM_128KB_CART_EXTRACTED_FILENAME);
    const expectedRawData = await ArrayBufferUtil.readArrayBuffer(FLASHRAM_128KB_CART_RAW_FILENAME);

    const convertedData = ConvertFromN64(extractedData);

    expect(ArrayBufferUtil.arrayBuffersEqual(convertedData.saveData, expectedRawData)).to.equal(true);
    expect(convertedData.fileExtension).to.equal('fla');
  });

  it('should convert a 128kB Flash RAM game that has a small extracted file correctly', async () => {
    const extractedData = await ArrayBufferUtil.readArrayBuffer(FLASHRAM_128KB_CART_BUT_SMALL_FILE_EXTRACTED_FILENAME);
    const expectedRawData = await ArrayBufferUtil.readArrayBuffer(FLASHRAM_128KB_CART_BUT_SMALL_FILE_RAW_FILENAME);

    const convertedData = ConvertFromN64(extractedData);

    expect(ArrayBufferUtil.arrayBuffersEqual(convertedData.saveData, expectedRawData)).to.equal(true);
    expect(convertedData.fileExtension).to.equal('sra');
  });
});
