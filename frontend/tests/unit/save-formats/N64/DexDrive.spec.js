import { expect } from 'chai';
import seedrandom from 'seedrandom';
import N64DexDriveSaveData from '@/save-formats/N64/DexDrive';
import N64MempackSaveData from '@/save-formats/N64/Mempack';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/data/save-formats/n64/dexdrive';

const DEXDRIVE_ONE_FILE_FILENAME = `${DIR}/mario-kart-64.1116.n64`;
const RAW_ONE_FILE_FILENAME = `${DIR}/mario-kart-64.1116.mpk`;
const RAW_ONE_FILE_NOTE_FILENAME = `${DIR}/mario-kart-64.1116-1`;

const DEXDRIVE_COMMENT_FILENAME = `${DIR}/perfect-dark.1043.n64`;
const RAW_COMMENT_FILENAME = `${DIR}/perfect-dark.1043.mpk`;
const RAW_COMMENT_NOTE_FILENAME = `${DIR}/perfect-dark.1043.1116-1`;

const DEXDRIVE_TWO_FILES_FILENAME = `${DIR}/tony-hawks-pro-skater-2.1077.n64`;
const RAW_TWO_FILES_FILENAME = `${DIR}/tony-hawks-pro-skater-2.1077.mpk`;
const RAW_TWO_FILES_NOTE_1_FILENAME = `${DIR}/tony-hawks-pro-skater-2.1077-1`;
const RAW_TWO_FILES_NOTE_2_FILENAME = `${DIR}/tony-hawks-pro-skater-2.1077-2`;

const DEXDRIVE_TWO_FILES_OUTPUT_FILENAME = `${DIR}/tony-hawks-pro-skater-2.1077-output.n64`;

const DEXDRIVE_05KB_EEP_FILENAME = `${DIR}/super-mario-64.1091.n64`;
const RAW_05KB_EEP_FILENAME = `${DIR}/super-mario-64.1091.mpk`;
const RAW_05KB_EEP_NOTE_FILENAME = `${DIR}/super-mario-64.1091-1`;

const DEXDRIVE_05KB_EEP_BLACKBAG_FILENAME = `${DIR}/banjokaz.n64`;
const RAW_05KB_EEP_BLACKBAG_FILENAME = `${DIR}/banjokaz.mpk`;
const RAW_05KB_EEP_BLACKBAG_NOTE_1_FILENAME = `${DIR}/banjokaz-1`;
const RAW_05KB_EEP_BLACKBAG_NOTE_2_FILENAME = `${DIR}/banjokaz-2`;

const DEXDRIVE_2KB_EEP_FILENAME = `${DIR}/donkey-kong-64.1156.n64`;
const RAW_2KB_EEP_FILENAME = `${DIR}/donkey-kong-64.1156.mpk`;
const RAW_2KB_EEP_NOTE_FILENAME = `${DIR}/donkey-kong-64.1156-1`;

const DEXDRIVE_FOUR_FILES_FILENAME = `${DIR}/banjo-kazooie.1141.n64`;
const RAW_FOUR_FILES_FILENAME = `${DIR}/banjo-kazooie.1141.mpk`;
const RAW_FOUR_FILES_NOTE_1_FILENAME = `${DIR}/banjo-kazooie.1141-1`;
const RAW_FOUR_FILES_NOTE_2_FILENAME = `${DIR}/banjo-kazooie.1141-2`;
const RAW_FOUR_FILES_NOTE_3_FILENAME = `${DIR}/banjo-kazooie.1141-3`;
const RAW_FOUR_FILES_NOTE_4_FILENAME = `${DIR}/banjo-kazooie.1141-4`;

const DEXDRIVE_SINGLE_PAGE_FILENAME = `${DIR}/ecw-hardcore-revolution.1000.n64`;
const RAW_SINGLE_PAGE_FILENAME = `${DIR}/ecw-hardcore-revolution.1000.mpk`;
const RAW_SINGLE_PAGE_NOTE_1_FILENAME = `${DIR}/ecw-hardcore-revolution.1000-1`;

const DEXDRIVE_EMPTY_HEADER_FILENAME = `${DIR}/ecw-hardcore-revolution-empty-header.1000.n64`; // We're reusing the same data, just manually setting the header to be all blank, so the other two files are exactly the same
const RAW_EMPTY_HEADER_FILENAME = RAW_SINGLE_PAGE_FILENAME;
const RAW_EMPTY_HEADER_NOTE_1_FILENAME = RAW_SINGLE_PAGE_NOTE_1_FILENAME;

const DEXDRIVE_NO_HEADER_FILENAME = `${DIR}/ecw-hardcore-revolution-no-header.1000.n64`; // We're reusing the same data, just manually deleting the header, so the other two files are exactly the same
const RAW_NO_HEADER_FILENAME = RAW_SINGLE_PAGE_FILENAME;
const RAW_NO_HEADER_NOTE_1_FILENAME = RAW_SINGLE_PAGE_NOTE_1_FILENAME;

const DEXDRIVE_CORRUPTED_FILENAME = `${DIR}/Ready 2 Rumble Boxing (U) [!].n64`;
const RAW_FIXED_FILENAME = `${DIR}/Ready 2 Rumble Boxing (U) [!]-fixed.mpk`;
const RAW_FIXED_NOTE_1_FILENAME = `${DIR}/Ready 2 Rumble Boxing (U) [!]-fixed-1`;
const RAW_FIXED_NOTE_2_FILENAME = `${DIR}/Ready 2 Rumble Boxing (U) [!]-fixed-2`;

describe('N64 - DexDrive save format', () => {
  let randomNumberGenerator = null;

  beforeEach(() => {
    // Replace Math.random() so that the results are predictable
    // We can't just override the global Math.random() because these tests run concurrently with tests of the
    // N64 mempack format, which also depends on random numbers. When they execute concurrently, re-seeding
    // causes unpredictable results
    randomNumberGenerator = seedrandom('Happy day = when I realized collectathons were no longer a genre');
  });

  it('should convert a file containing a single save that is 121 pages', async () => {
    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DEXDRIVE_ONE_FILE_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_ONE_FILE_FILENAME);
    const rawNoteArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_ONE_FILE_NOTE_FILENAME);

    const dexDriveSaveData = N64DexDriveSaveData.createFromDexDriveData(dexDriveArrayBuffer, randomNumberGenerator);

    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getMempack().getArrayBuffer(), rawArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles().length).to.equal(1);

    expect(dexDriveSaveData.getSaveFiles()[0].startingPage).to.equal(5);
    expect(dexDriveSaveData.getSaveFiles()[0].pageNumbers.length).to.equal(121);
    expect(dexDriveSaveData.getSaveFiles()[0].noteName).to.equal('MARIOKART64');
    expect(dexDriveSaveData.getSaveFiles()[0].comment).to.equal('');
    expect(dexDriveSaveData.getSaveFiles()[0].gameSerialCode).to.equal('NKTJ');
    expect(dexDriveSaveData.getSaveFiles()[0].publisherCode).to.equal('01');
    expect(dexDriveSaveData.getSaveFiles()[0].region).to.equal('J');
    expect(dexDriveSaveData.getSaveFiles()[0].regionName).to.equal('Japan');
    expect(dexDriveSaveData.getSaveFiles()[0].media).to.equal('N');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[0].rawData, rawNoteArrayBuffer)).to.equal(true);
  });

  it('should convert a file containing a single save that is 28 pages and has a comment', async () => {
    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DEXDRIVE_COMMENT_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_COMMENT_FILENAME);
    const rawNoteArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_COMMENT_NOTE_FILENAME);

    const dexDriveSaveData = N64DexDriveSaveData.createFromDexDriveData(dexDriveArrayBuffer, randomNumberGenerator);

    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getMempack().getArrayBuffer(), rawArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles().length).to.equal(1);

    expect(dexDriveSaveData.getSaveFiles()[0].startingPage).to.equal(5);
    expect(dexDriveSaveData.getSaveFiles()[0].pageNumbers.length).to.equal(28);
    expect(dexDriveSaveData.getSaveFiles()[0].noteName).to.equal('PERFECT DARK');
    expect(dexDriveSaveData.getSaveFiles()[0].comment).to.equal('All missions completed on all difficulties, all challenges, most cheats');
    expect(dexDriveSaveData.getSaveFiles()[0].gameSerialCode).to.equal('NPDE');
    expect(dexDriveSaveData.getSaveFiles()[0].publisherCode).to.equal('4Y');
    expect(dexDriveSaveData.getSaveFiles()[0].region).to.equal('E');
    expect(dexDriveSaveData.getSaveFiles()[0].regionName).to.equal('North America');
    expect(dexDriveSaveData.getSaveFiles()[0].media).to.equal('N');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[0].rawData, rawNoteArrayBuffer)).to.equal(true);

    ArrayBufferUtil.writeArrayBuffer(RAW_COMMENT_NOTE_FILENAME, dexDriveSaveData.getSaveFiles()[0].rawData);
  });

  it('should convert a file containing two saves that are 27 and 20 pages', async () => {
    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DEXDRIVE_TWO_FILES_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_TWO_FILES_FILENAME);
    const rawNote1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_TWO_FILES_NOTE_1_FILENAME);
    const rawNote2ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_TWO_FILES_NOTE_2_FILENAME);

    const dexDriveSaveData = N64DexDriveSaveData.createFromDexDriveData(dexDriveArrayBuffer, randomNumberGenerator);

    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getMempack().getArrayBuffer(), rawArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles().length).to.equal(2);

    expect(dexDriveSaveData.getSaveFiles()[0].startingPage).to.equal(5);
    expect(dexDriveSaveData.getSaveFiles()[0].pageNumbers.length).to.equal(27);
    expect(dexDriveSaveData.getSaveFiles()[0].noteName).to.equal('T2-\'.G');
    expect(dexDriveSaveData.getSaveFiles()[0].comment).to.equal('');
    expect(dexDriveSaveData.getSaveFiles()[0].gameSerialCode).to.equal('NTQE');
    expect(dexDriveSaveData.getSaveFiles()[0].publisherCode).to.equal('52');
    expect(dexDriveSaveData.getSaveFiles()[0].region).to.equal('E');
    expect(dexDriveSaveData.getSaveFiles()[0].regionName).to.equal('North America');
    expect(dexDriveSaveData.getSaveFiles()[0].media).to.equal('N');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[0].rawData, rawNote1ArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles()[1].startingPage).to.equal(32);
    expect(dexDriveSaveData.getSaveFiles()[1].pageNumbers.length).to.equal(20);
    expect(dexDriveSaveData.getSaveFiles()[1].noteName).to.equal('T2-WAREHOUSE.P');
    expect(dexDriveSaveData.getSaveFiles()[1].comment).to.equal('');
    expect(dexDriveSaveData.getSaveFiles()[1].gameSerialCode).to.equal('NTQE');
    expect(dexDriveSaveData.getSaveFiles()[1].publisherCode).to.equal('52');
    expect(dexDriveSaveData.getSaveFiles()[1].region).to.equal('E');
    expect(dexDriveSaveData.getSaveFiles()[0].regionName).to.equal('North America');
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

    const dexDriveSaveData = N64DexDriveSaveData.createFromSaveFiles(saveFiles, randomNumberGenerator);

    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getArrayBuffer(), dexDriveArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles().length).to.equal(2);

    expect(dexDriveSaveData.getSaveFiles()[0].startingPage).to.equal(5);
    expect(dexDriveSaveData.getSaveFiles()[0].pageNumbers.length).to.equal(27);
    expect(dexDriveSaveData.getSaveFiles()[0].noteName).to.equal('T2-\'.G');
    expect(dexDriveSaveData.getSaveFiles()[0].comment).to.equal('Comment 1');
    expect(dexDriveSaveData.getSaveFiles()[0].gameSerialCode).to.equal('NTQE');
    expect(dexDriveSaveData.getSaveFiles()[0].publisherCode).to.equal('52');
    expect(dexDriveSaveData.getSaveFiles()[0].region).to.equal('E');
    expect(dexDriveSaveData.getSaveFiles()[0].regionName).to.equal('North America');
    expect(dexDriveSaveData.getSaveFiles()[0].media).to.equal('N');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[0].rawData, rawNote1ArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles()[1].startingPage).to.equal(32);
    expect(dexDriveSaveData.getSaveFiles()[1].pageNumbers.length).to.equal(20);
    expect(dexDriveSaveData.getSaveFiles()[1].noteName).to.equal('T2-WAREHOUSE.P');
    expect(dexDriveSaveData.getSaveFiles()[1].comment).to.equal('Comment 2');
    expect(dexDriveSaveData.getSaveFiles()[1].gameSerialCode).to.equal('NTQE');
    expect(dexDriveSaveData.getSaveFiles()[1].publisherCode).to.equal('52');
    expect(dexDriveSaveData.getSaveFiles()[1].region).to.equal('E');
    expect(dexDriveSaveData.getSaveFiles()[1].regionName).to.equal('North America');
    expect(dexDriveSaveData.getSaveFiles()[1].media).to.equal('N');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[1].rawData, rawNote2ArrayBuffer)).to.equal(true);
  });

  it('should convert a file containing a 0.5kB EEPROM save', async () => {
    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DEXDRIVE_05KB_EEP_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_05KB_EEP_FILENAME);
    const rawNoteArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_05KB_EEP_NOTE_FILENAME);

    const dexDriveSaveData = N64DexDriveSaveData.createFromDexDriveData(dexDriveArrayBuffer, randomNumberGenerator);

    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getMempack().getArrayBuffer(), rawArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles().length).to.equal(1);

    expect(dexDriveSaveData.getSaveFiles()[0].startingPage).to.equal(5);
    expect(dexDriveSaveData.getSaveFiles()[0].pageNumbers.length).to.equal(2);
    expect(dexDriveSaveData.getSaveFiles()[0].noteName).to.equal('SMSM');
    expect(dexDriveSaveData.getSaveFiles()[0].comment).to.equal('100% Completed');
    expect(dexDriveSaveData.getSaveFiles()[0].gameSerialCode).to.equal(N64MempackSaveData.GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE);
    expect(dexDriveSaveData.getSaveFiles()[0].publisherCode).to.equal(N64MempackSaveData.GAMESHARK_ACTIONREPLAY_CART_SAVE_PUBLISHER_CODE);
    expect(dexDriveSaveData.getSaveFiles()[0].region).to.equal(N64MempackSaveData.GAMESHARK_ACTIONREPLAY_CART_SAVE_REGION_CODE);
    expect(dexDriveSaveData.getSaveFiles()[0].regionName).to.equal('Unknown region');
    expect(dexDriveSaveData.getSaveFiles()[0].media).to.equal(N64MempackSaveData.GAMESHARK_ACTIONREPLAY_CART_SAVE_MEDIA_CODE);
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[0].rawData, rawNoteArrayBuffer)).to.equal(true);
  });

  it('should convert a file containing 2 0.5kB EEPROM saves created with the BlackBag memory manager', async () => {
    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DEXDRIVE_05KB_EEP_BLACKBAG_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_05KB_EEP_BLACKBAG_FILENAME);
    const rawNote1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_05KB_EEP_BLACKBAG_NOTE_1_FILENAME);
    const rawNote2ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_05KB_EEP_BLACKBAG_NOTE_2_FILENAME);

    const dexDriveSaveData = N64DexDriveSaveData.createFromDexDriveData(dexDriveArrayBuffer, randomNumberGenerator);

    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getMempack().getArrayBuffer(), rawArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles().length).to.equal(2);

    expect(dexDriveSaveData.getSaveFiles()[0].startingPage).to.equal(5);
    expect(dexDriveSaveData.getSaveFiles()[0].pageNumbers.length).to.equal(2);
    expect(dexDriveSaveData.getSaveFiles()[0].noteName).to.equal('BK6.SRAM');
    expect(dexDriveSaveData.getSaveFiles()[0].comment).to.equal('Save spot 3 contains a save with 63 jigsaws and 563 notes (time: 13:43:23)');
    expect(dexDriveSaveData.getSaveFiles()[0].gameSerialCode).to.equal(N64MempackSaveData.BLACKBAG_CART_SAVE_GAME_SERIAL_CODE);
    expect(dexDriveSaveData.getSaveFiles()[0].publisherCode).to.equal(N64MempackSaveData.BLACKBAG_CART_SAVE_PUBLISHER_CODE);
    expect(dexDriveSaveData.getSaveFiles()[0].region).to.equal(N64MempackSaveData.BLACKBAG_CART_SAVE_REGION_CODE);
    expect(dexDriveSaveData.getSaveFiles()[0].regionName).to.equal('Unknown region');
    expect(dexDriveSaveData.getSaveFiles()[0].media).to.equal(N64MempackSaveData.BLACKBAG_CART_SAVE_MEDIA_CODE);
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[0].rawData, rawNote1ArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles()[1].startingPage).to.equal(7);
    expect(dexDriveSaveData.getSaveFiles()[1].pageNumbers.length).to.equal(2);
    expect(dexDriveSaveData.getSaveFiles()[1].noteName).to.equal('BK7.SRAM');
    expect(dexDriveSaveData.getSaveFiles()[1].comment).to.equal('not working?');
    expect(dexDriveSaveData.getSaveFiles()[1].gameSerialCode).to.equal(N64MempackSaveData.BLACKBAG_CART_SAVE_GAME_SERIAL_CODE);
    expect(dexDriveSaveData.getSaveFiles()[1].publisherCode).to.equal(N64MempackSaveData.BLACKBAG_CART_SAVE_PUBLISHER_CODE);
    expect(dexDriveSaveData.getSaveFiles()[1].region).to.equal(N64MempackSaveData.BLACKBAG_CART_SAVE_REGION_CODE);
    expect(dexDriveSaveData.getSaveFiles()[1].regionName).to.equal('Unknown region');
    expect(dexDriveSaveData.getSaveFiles()[1].media).to.equal(N64MempackSaveData.BLACKBAG_CART_SAVE_MEDIA_CODE);
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[1].rawData, rawNote2ArrayBuffer)).to.equal(true);
  });

  it('should convert a file containing a 2kB EEPROM save', async () => {
    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DEXDRIVE_2KB_EEP_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_2KB_EEP_FILENAME);
    const rawNoteArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_2KB_EEP_NOTE_FILENAME);

    const dexDriveSaveData = N64DexDriveSaveData.createFromDexDriveData(dexDriveArrayBuffer, randomNumberGenerator);

    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getMempack().getArrayBuffer(), rawArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles().length).to.equal(1);

    expect(dexDriveSaveData.getSaveFiles()[0].startingPage).to.equal(5);
    expect(dexDriveSaveData.getSaveFiles()[0].pageNumbers.length).to.equal(7);
    expect(dexDriveSaveData.getSaveFiles()[0].rawData.byteLength).to.equal(2048); // Only 7 pages, but 2048 bytes: that reflects the extra padding we're adding to the end of truncated cart saves
    expect(dexDriveSaveData.getSaveFiles()[0].noteName).to.equal('DODO');
    expect(dexDriveSaveData.getSaveFiles()[0].comment).to.equal('101% Compleat, but I did not beat the game yet on this file.  '
      + 'Some stages have all 500 bananas collected, but others are missing some.  Try to find those if you want, but I\'ll try to update this file once I get those');
    expect(dexDriveSaveData.getSaveFiles()[0].gameSerialCode).to.equal(N64MempackSaveData.GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE);
    expect(dexDriveSaveData.getSaveFiles()[0].publisherCode).to.equal(N64MempackSaveData.GAMESHARK_ACTIONREPLAY_CART_SAVE_PUBLISHER_CODE);
    expect(dexDriveSaveData.getSaveFiles()[0].region).to.equal(N64MempackSaveData.GAMESHARK_ACTIONREPLAY_CART_SAVE_REGION_CODE);
    expect(dexDriveSaveData.getSaveFiles()[0].regionName).to.equal('Unknown region');
    expect(dexDriveSaveData.getSaveFiles()[0].media).to.equal(N64MempackSaveData.GAMESHARK_ACTIONREPLAY_CART_SAVE_MEDIA_CODE);
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[0].rawData, rawNoteArrayBuffer)).to.equal(true);
  });

  it('should convert a file containing 4 notes, two of which are 0.5kB EEPROM saves whose filename have extensions', async () => {
    // We had a bug where the extensions on the .eep notes in this save weren't read correctly, so adding a test for them specifically

    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DEXDRIVE_FOUR_FILES_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FOUR_FILES_FILENAME);
    const rawNote1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FOUR_FILES_NOTE_1_FILENAME);
    const rawNote2ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FOUR_FILES_NOTE_2_FILENAME);
    const rawNote3ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FOUR_FILES_NOTE_3_FILENAME);
    const rawNote4ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FOUR_FILES_NOTE_4_FILENAME);

    const dexDriveSaveData = N64DexDriveSaveData.createFromDexDriveData(dexDriveArrayBuffer, randomNumberGenerator);

    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getMempack().getArrayBuffer(), rawArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles().length).to.equal(4);

    expect(dexDriveSaveData.getSaveFiles()[0].startingPage).to.equal(5);
    expect(dexDriveSaveData.getSaveFiles()[0].pageNumbers.length).to.equal(2);
    expect(dexDriveSaveData.getSaveFiles()[0].noteName).to.equal('ARMY MEN SARGE');
    expect(dexDriveSaveData.getSaveFiles()[0].comment).to.equal('');
    expect(dexDriveSaveData.getSaveFiles()[0].gameSerialCode).to.equal('NAME');
    expect(dexDriveSaveData.getSaveFiles()[0].publisherCode).to.equal('5H');
    expect(dexDriveSaveData.getSaveFiles()[0].region).to.equal('E');
    expect(dexDriveSaveData.getSaveFiles()[0].regionName).to.equal('North America');
    expect(dexDriveSaveData.getSaveFiles()[0].media).to.equal('N');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[0].rawData, rawNote1ArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles()[1].startingPage).to.equal(7);
    expect(dexDriveSaveData.getSaveFiles()[1].pageNumbers.length).to.equal(12);
    expect(dexDriveSaveData.getSaveFiles()[1].noteName).to.equal('A BUG\'S LIFE');
    expect(dexDriveSaveData.getSaveFiles()[1].comment).to.equal('');
    expect(dexDriveSaveData.getSaveFiles()[1].gameSerialCode).to.equal('NBYE');
    expect(dexDriveSaveData.getSaveFiles()[1].publisherCode).to.equal('52');
    expect(dexDriveSaveData.getSaveFiles()[1].region).to.equal('E');
    expect(dexDriveSaveData.getSaveFiles()[1].regionName).to.equal('North America');
    expect(dexDriveSaveData.getSaveFiles()[1].media).to.equal('N');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[1].rawData, rawNote2ArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles()[2].startingPage).to.equal(19);
    expect(dexDriveSaveData.getSaveFiles()[2].pageNumbers.length).to.equal(2);
    expect(dexDriveSaveData.getSaveFiles()[2].noteName).to.equal('SMSM.1');
    expect(dexDriveSaveData.getSaveFiles()[2].comment).to.equal('');
    expect(dexDriveSaveData.getSaveFiles()[2].gameSerialCode).to.equal(N64MempackSaveData.GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE);
    expect(dexDriveSaveData.getSaveFiles()[2].publisherCode).to.equal(N64MempackSaveData.GAMESHARK_ACTIONREPLAY_CART_SAVE_PUBLISHER_CODE);
    expect(dexDriveSaveData.getSaveFiles()[2].region).to.equal(N64MempackSaveData.GAMESHARK_ACTIONREPLAY_CART_SAVE_REGION_CODE);
    expect(dexDriveSaveData.getSaveFiles()[2].regionName).to.equal('Unknown region');
    expect(dexDriveSaveData.getSaveFiles()[2].media).to.equal(N64MempackSaveData.GAMESHARK_ACTIONREPLAY_CART_SAVE_MEDIA_CODE);
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[2].rawData, rawNote3ArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles()[3].startingPage).to.equal(25); // There are 4 unused pages after the previous save. I assume something was deleted
    expect(dexDriveSaveData.getSaveFiles()[3].pageNumbers.length).to.equal(2);
    expect(dexDriveSaveData.getSaveFiles()[3].noteName).to.equal('BKBK.1');
    expect(dexDriveSaveData.getSaveFiles()[3].comment).to.equal('');
    expect(dexDriveSaveData.getSaveFiles()[3].gameSerialCode).to.equal(N64MempackSaveData.GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE);
    expect(dexDriveSaveData.getSaveFiles()[3].publisherCode).to.equal(N64MempackSaveData.GAMESHARK_ACTIONREPLAY_CART_SAVE_PUBLISHER_CODE);
    expect(dexDriveSaveData.getSaveFiles()[3].region).to.equal(N64MempackSaveData.GAMESHARK_ACTIONREPLAY_CART_SAVE_REGION_CODE);
    expect(dexDriveSaveData.getSaveFiles()[3].regionName).to.equal('Unknown region');
    expect(dexDriveSaveData.getSaveFiles()[3].media).to.equal(N64MempackSaveData.GAMESHARK_ACTIONREPLAY_CART_SAVE_MEDIA_CODE);
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[3].rawData, rawNote4ArrayBuffer)).to.equal(true);
  });

  it('should convert a file with a save consisting of just 1 page', async () => {
    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DEXDRIVE_SINGLE_PAGE_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_SINGLE_PAGE_FILENAME);
    const rawNoteArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_SINGLE_PAGE_NOTE_1_FILENAME);

    const dexDriveSaveData = N64DexDriveSaveData.createFromDexDriveData(dexDriveArrayBuffer, randomNumberGenerator);

    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getMempack().getArrayBuffer(), rawArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles().length).to.equal(1);

    expect(dexDriveSaveData.getSaveFiles()[0].startingPage).to.equal(5);
    expect(dexDriveSaveData.getSaveFiles()[0].pageNumbers.length).to.equal(1);
    expect(dexDriveSaveData.getSaveFiles()[0].noteName).to.equal('ECW');
    expect(dexDriveSaveData.getSaveFiles()[0].comment).to.equal('All Hidden Wrestlers and Cheats Unlocked');
    expect(dexDriveSaveData.getSaveFiles()[0].gameSerialCode).to.equal('NWIE');
    expect(dexDriveSaveData.getSaveFiles()[0].publisherCode).to.equal('51');
    expect(dexDriveSaveData.getSaveFiles()[0].region).to.equal('E');
    expect(dexDriveSaveData.getSaveFiles()[0].regionName).to.equal('North America');
    expect(dexDriveSaveData.getSaveFiles()[0].media).to.equal('N');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[0].rawData, rawNoteArrayBuffer)).to.equal(true);
  });

  it('should convert a file containing an empty header (without the correct magic)', async () => {
    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DEXDRIVE_EMPTY_HEADER_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_EMPTY_HEADER_FILENAME);
    const rawNoteArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_EMPTY_HEADER_NOTE_1_FILENAME);

    const dexDriveSaveData = N64DexDriveSaveData.createFromDexDriveData(dexDriveArrayBuffer, randomNumberGenerator);

    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getMempack().getArrayBuffer(), rawArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles().length).to.equal(1);

    expect(dexDriveSaveData.getSaveFiles()[0].startingPage).to.equal(5);
    expect(dexDriveSaveData.getSaveFiles()[0].pageNumbers.length).to.equal(1);
    expect(dexDriveSaveData.getSaveFiles()[0].noteName).to.equal('ECW');
    expect(dexDriveSaveData.getSaveFiles()[0].comment).to.equal('');
    expect(dexDriveSaveData.getSaveFiles()[0].gameSerialCode).to.equal('NWIE');
    expect(dexDriveSaveData.getSaveFiles()[0].publisherCode).to.equal('51');
    expect(dexDriveSaveData.getSaveFiles()[0].region).to.equal('E');
    expect(dexDriveSaveData.getSaveFiles()[0].regionName).to.equal('North America');
    expect(dexDriveSaveData.getSaveFiles()[0].media).to.equal('N');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[0].rawData, rawNoteArrayBuffer)).to.equal(true);
  });

  it('should convert a file containing no header (a raw mempack files)', async () => {
    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DEXDRIVE_NO_HEADER_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_NO_HEADER_FILENAME);
    const rawNoteArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_NO_HEADER_NOTE_1_FILENAME);

    const dexDriveSaveData = N64DexDriveSaveData.createFromDexDriveData(dexDriveArrayBuffer, randomNumberGenerator);

    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getMempack().getArrayBuffer(), rawArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles().length).to.equal(1);

    expect(dexDriveSaveData.getSaveFiles()[0].startingPage).to.equal(5);
    expect(dexDriveSaveData.getSaveFiles()[0].pageNumbers.length).to.equal(1);
    expect(dexDriveSaveData.getSaveFiles()[0].noteName).to.equal('ECW');
    expect(dexDriveSaveData.getSaveFiles()[0].comment).to.equal('');
    expect(dexDriveSaveData.getSaveFiles()[0].gameSerialCode).to.equal('NWIE');
    expect(dexDriveSaveData.getSaveFiles()[0].publisherCode).to.equal('51');
    expect(dexDriveSaveData.getSaveFiles()[0].region).to.equal('E');
    expect(dexDriveSaveData.getSaveFiles()[0].regionName).to.equal('North America');
    expect(dexDriveSaveData.getSaveFiles()[0].media).to.equal('N');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[0].rawData, rawNoteArrayBuffer)).to.equal(true);
  });

  it('should convert a file containing corrupted controller pak data to one that is not corrupted', async () => {
    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DEXDRIVE_CORRUPTED_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FIXED_FILENAME);
    const rawNote1ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FIXED_NOTE_1_FILENAME);
    const rawNote2ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FIXED_NOTE_2_FILENAME);

    const dexDriveSaveData = N64DexDriveSaveData.createFromDexDriveData(dexDriveArrayBuffer, randomNumberGenerator);

    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getMempack().getArrayBuffer(), rawArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles().length).to.equal(2);

    expect(dexDriveSaveData.getSaveFiles()[0].startingPage).to.equal(5);
    expect(dexDriveSaveData.getSaveFiles()[0].pageNumbers.length).to.equal(9);
    expect(dexDriveSaveData.getSaveFiles()[0].noteName).to.equal('READY2RUMBLE');
    expect(dexDriveSaveData.getSaveFiles()[0].comment).to.equal('');
    expect(dexDriveSaveData.getSaveFiles()[0].gameSerialCode).to.equal('NRDP');
    expect(dexDriveSaveData.getSaveFiles()[0].publisherCode).to.equal('5D');
    expect(dexDriveSaveData.getSaveFiles()[0].region).to.equal('P');
    expect(dexDriveSaveData.getSaveFiles()[0].regionName).to.equal('Europe');
    expect(dexDriveSaveData.getSaveFiles()[0].media).to.equal('N');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[0].rawData, rawNote1ArrayBuffer)).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles()[1].startingPage).to.equal(14);
    expect(dexDriveSaveData.getSaveFiles()[1].pageNumbers.length).to.equal(9);
    expect(dexDriveSaveData.getSaveFiles()[1].noteName).to.equal('READY2RUMBLE');
    expect(dexDriveSaveData.getSaveFiles()[1].comment).to.equal('');
    expect(dexDriveSaveData.getSaveFiles()[1].gameSerialCode).to.equal('NRDP');
    expect(dexDriveSaveData.getSaveFiles()[1].publisherCode).to.equal('5D');
    expect(dexDriveSaveData.getSaveFiles()[1].region).to.equal('P');
    expect(dexDriveSaveData.getSaveFiles()[1].regionName).to.equal('Europe');
    expect(dexDriveSaveData.getSaveFiles()[1].media).to.equal('N');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[1].rawData, rawNote2ArrayBuffer)).to.equal(true);
  });
});
