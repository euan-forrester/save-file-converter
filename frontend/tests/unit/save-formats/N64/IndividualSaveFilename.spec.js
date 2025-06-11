import { expect } from 'chai';
import N64IndividualSaveFilename from '@/save-formats/N64/IndividualSaveFilename';
import N64GameSerialCodeUtil from '@/save-formats/N64/Components/GameSerialCodeUtil';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/data/save-formats/n64/mempack';

const RAW_ONE_FILE_NOTE_FILENAME = `${DIR}/mario-kart-64.1116-1`;

const RAW_TWO_FILES_NOTE_1_FILENAME = `${DIR}/tony-hawks-pro-skater-2.1077-1`;

const RAW_PERIODS_IN_NOTENAME_NOTE_FILENAME = `${DIR}/san-francisco-rush-extreme-racing.1103-1`;
const RAW_CART_SAVE_WITH_NOTE_NAME_EXTENSION = `${DIR}/banjokaz-1`;
const RAW_CART_SAVE_WITHOUT_NOTE_NAME_EXTENSION = `${DIR}/super-mario-64.1091-1`;

describe('N64 - Individual save filename', () => {
  it('should create a new-style filename for a game without a note name extension', async () => {
    const rawNoteArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_ONE_FILE_NOTE_FILENAME);

    const saveFile = {
      noteName: 'MARIOKART64',
      noteNameExtension: '',
      gameSerialCode: 'NKTJ',
      publisherCode: '01',
      rawData: rawNoteArrayBuffer,
    };

    expect(N64IndividualSaveFilename.createFilename(saveFile)).to.equal('RAW-4d4152494f4b4152543634--4e4b544a-3031');
  });

  it('should parse a new-style filename for a game without a note name extension', async () => {
    const saveFile = N64IndividualSaveFilename.parseFilename('RAW-4d4152494f4b4152543634--4e4b544a-3031');

    expect(saveFile.noteName).to.equal('MARIOKART64');
    expect(saveFile.noteNameExtension).to.equal('');
    expect(saveFile.gameSerialCode).to.equal('NKTJ');
    expect(saveFile.publisherCode).to.equal('01');
  });

  it('should parse an old-style filename for a game without a note name extension', async () => {
    const saveFile = N64IndividualSaveFilename.parseFilename('RAW-4d4152494f4b4152543634-4e4b544a-3031');

    expect(saveFile.noteName).to.equal('MARIOKART64');
    expect(saveFile.noteNameExtension).to.equal('');
    expect(saveFile.gameSerialCode).to.equal('NKTJ');
    expect(saveFile.publisherCode).to.equal('01');
  });

  it('should create a new-style filename for a game with a note name extension', async () => {
    const rawNoteArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_TWO_FILES_NOTE_1_FILENAME);

    const saveFile = {
      noteName: 'T2-\'',
      noteNameExtension: 'G',
      gameSerialCode: 'NTQE',
      publisherCode: '52',
      rawData: rawNoteArrayBuffer,
    };

    expect(N64IndividualSaveFilename.createFilename(saveFile)).to.equal('RAW-54322d27-47-4e545145-3532');
  });

  it('should parse a new-style filename for a game with a note name extension', async () => {
    const saveFile = N64IndividualSaveFilename.parseFilename('RAW-54322d27-47-4e545145-3532');

    expect(saveFile.noteName).to.equal('T2-\'');
    expect(saveFile.noteNameExtension).to.equal('G');
    expect(saveFile.gameSerialCode).to.equal('NTQE');
    expect(saveFile.publisherCode).to.equal('52');
  });

  it('should parse an old-style filename for a game with a note name extension', async () => {
    const saveFile = N64IndividualSaveFilename.parseFilename('RAW-54322d272e47-4e545145-3532');

    expect(saveFile.noteName).to.equal('T2-\'');
    expect(saveFile.noteNameExtension).to.equal('G');
    expect(saveFile.gameSerialCode).to.equal('NTQE');
    expect(saveFile.publisherCode).to.equal('52');
  });

  it('should create a new-style filename for a game with periods in its note name', async () => {
    const rawNoteArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_PERIODS_IN_NOTENAME_NOTE_FILENAME);

    const saveFile = {
      noteName: 'S.F. RUSH',
      noteNameExtension: '',
      gameSerialCode: 'NSFE',
      publisherCode: '5D',
      rawData: rawNoteArrayBuffer,
    };

    expect(N64IndividualSaveFilename.createFilename(saveFile)).to.equal('RAW-532e462e2052555348--4e534645-3544');
  });

  it('should parse an new-style filename for a game with periods in its note name', async () => {
    const saveFile = N64IndividualSaveFilename.parseFilename('RAW-532e462e2052555348--4e534645-3544');

    expect(saveFile.noteName).to.equal('S.F. RUSH');
    expect(saveFile.noteNameExtension).to.equal('');
    expect(saveFile.gameSerialCode).to.equal('NSFE');
    expect(saveFile.publisherCode).to.equal('5D');
  });

  it('should parse an old-style filename for a game with periods in its note name', async () => {
    const saveFile = N64IndividualSaveFilename.parseFilename('RAW-532e462e2052555348-4e534645-3544');

    expect(saveFile.noteName).to.equal('S.F. RUSH');
    expect(saveFile.noteNameExtension).to.equal('');
    expect(saveFile.gameSerialCode).to.equal('NSFE');
    expect(saveFile.publisherCode).to.equal('5D');
  });

  it('should create a filename for a cart save with a note name extension in its name', async () => {
    const rawNoteArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_CART_SAVE_WITH_NOTE_NAME_EXTENSION);

    const saveFile = {
      noteName: 'BK6',
      noteNameExtension: 'SRAM',
      gameSerialCode: N64GameSerialCodeUtil.GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE,
      publisherCode: N64GameSerialCodeUtil.GAMESHARK_ACTIONREPLAY_CART_SAVE_PUBLISHER_CODE,
      rawData: rawNoteArrayBuffer,
    };

    expect(N64IndividualSaveFilename.createFilename(saveFile)).to.equal('BK6.SRAM.eep');
  });

  it('should parse a filename filename for a cart save with a note name extension in its name', async () => {
    const saveFile = N64IndividualSaveFilename.parseFilename('BK6.SRAM.eep');

    expect(saveFile.noteName).to.equal('BK6');
    expect(saveFile.noteNameExtension).to.equal('SRAM');
    expect(saveFile.gameSerialCode).to.equal(N64GameSerialCodeUtil.GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE);
    expect(saveFile.publisherCode).to.equal(N64GameSerialCodeUtil.GAMESHARK_ACTIONREPLAY_CART_SAVE_PUBLISHER_CODE);
  });

  it('should create a filename for a cart save without a note name extension in its name', async () => {
    const rawNoteArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_CART_SAVE_WITHOUT_NOTE_NAME_EXTENSION);

    const saveFile = {
      noteName: 'SMSM',
      noteNameExtension: '',
      gameSerialCode: N64GameSerialCodeUtil.GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE,
      publisherCode: N64GameSerialCodeUtil.GAMESHARK_ACTIONREPLAY_CART_SAVE_PUBLISHER_CODE,
      rawData: rawNoteArrayBuffer,
    };

    expect(N64IndividualSaveFilename.createFilename(saveFile)).to.equal('SMSM.eep');
  });

  it('should parse a filename filename for a cart save without a note name extension in its name', async () => {
    const saveFile = N64IndividualSaveFilename.parseFilename('SMSM.eep');

    expect(saveFile.noteName).to.equal('SMSM');
    expect(saveFile.noteNameExtension).to.equal('');
    expect(saveFile.gameSerialCode).to.equal(N64GameSerialCodeUtil.GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE);
    expect(saveFile.publisherCode).to.equal(N64GameSerialCodeUtil.GAMESHARK_ACTIONREPLAY_CART_SAVE_PUBLISHER_CODE);
  });
});
