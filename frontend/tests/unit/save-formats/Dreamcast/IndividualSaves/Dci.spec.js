import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import DreamcastDciSaveData from '@/save-formats/Dreamcast/IndividualSaves/Dci';
import DreamcastUtil from '@/save-formats/Dreamcast/Util';

const DIR = './tests/data/save-formats/dreamcast/individualsaves';

const DCI_FILENAME = `${DIR}/kiss-psycho-circus-the-nightmare-child.29341.dci`;
const DCI_RECREATED_FILENAME = `${DIR}/kiss-psycho-circus-the-nightmare-child.29341-recreated.dci`; // The day of week is set incorrectly in the original file, which is the only difference vs this file that we output
const RAW_FILENAME = `${DIR}/kiss-psycho-circus-the-nightmare-child.29341.bin`;

const DCI_NO_COPY_FILENAME = `${DIR}/project-justice.882.dci`;
const DCI_NO_COPY_RECREATED_FILENAME = `${DIR}/project-justice.882-recreated.dci`; // The day of week is set incorrectly in the original file, which is the only difference vs this file that we output
const RAW_NO_COPY_FILENAME = `${DIR}/project-justice.882.bin`;

const DCI_GAME_FILENAME = `${DIR}/tetr.dci`;
const DCI_GAME_RECREATED_FILENAME = `${DIR}/tetr-recreated.dci`; // The day of week is set incorrectly in the original file, as well as the number of blocks
const RAW_GAME_FILENAME = `${DIR}/tetr.bin`;

describe('Dreamcast - .DCI', () => {
  it('should correctly read a .DCI file', async () => {
    const dciArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DCI_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    const dreamcastSaveFile = DreamcastDciSaveData.convertIndividualSaveToSaveFile(dciArrayBuffer);

    expect(dreamcastSaveFile.fileType).to.equal('Data');
    expect(dreamcastSaveFile.copyProtected).to.equal(false);
    expect(dreamcastSaveFile.firstBlockNumber).to.equal(0);
    expect(dreamcastSaveFile.filename).to.equal('TRMR_KPC.DAT');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveFile.fileCreationTime)).to.equal('1999-09-23 05:55:04');
    expect(dreamcastSaveFile.fileSizeInBlocks).to.equal(3);
    expect(dreamcastSaveFile.fileHeaderBlockNumber).to.equal(0);
    expect(dreamcastSaveFile.storageComment).to.equal('KISSPSYCHOCIRCUS');
    expect(dreamcastSaveFile.fileComment).to.equal('');

    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveFile.rawData, rawArrayBuffer)).to.equal(true);
  });

  it('should correctly write a .DCI file', async () => {
    const dciArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DCI_RECREATED_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    const saveFile = {
      fileType: 'Data',
      copyProtected: false,
      filename: 'TRMR_KPC.DAT',
      fileCreationTime: new Date('1999-09-23 05:55:04'),
      fileHeaderBlockNumber: 0,
      rawData: rawArrayBuffer,
    };

    const dreamcastSaveFile = DreamcastDciSaveData.convertSaveFileToDci(saveFile);

    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveFile, dciArrayBuffer)).to.equal(true);
  });

  it('should correctly read a .DCI file with the no copy flag', async () => {
    const dciArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DCI_NO_COPY_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_NO_COPY_FILENAME);

    const dreamcastSaveFile = DreamcastDciSaveData.convertIndividualSaveToSaveFile(dciArrayBuffer);

    expect(dreamcastSaveFile.fileType).to.equal('Data');
    expect(dreamcastSaveFile.copyProtected).to.equal(false); // This game sets this flag to be true, but whatever device made this file appears to have set it to false
    expect(dreamcastSaveFile.firstBlockNumber).to.equal(0);
    expect(dreamcastSaveFile.filename).to.equal('PJUSTICE_SYS');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveFile.fileCreationTime)).to.equal('2001-05-30 14:42:42');
    expect(dreamcastSaveFile.fileSizeInBlocks).to.equal(2);
    expect(dreamcastSaveFile.fileHeaderBlockNumber).to.equal(0);
    expect(dreamcastSaveFile.storageComment).to.equal('SYSTEM FILE     ');
    expect(dreamcastSaveFile.fileComment).to.equal('PROJECT JUSTICE                 ');

    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveFile.rawData, rawArrayBuffer)).to.equal(true);
  });

  it('should correctly write a .DCI file with the no copy flag', async () => {
    const dciArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DCI_NO_COPY_RECREATED_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_NO_COPY_FILENAME);

    const saveFile = {
      fileType: 'Data',
      copyProtected: false, // This game sets this flag to be true, but whatever device made this file appears to have set it to false
      filename: 'PJUSTICE_SYS',
      fileCreationTime: new Date('2001-05-30 14:42:42'),
      fileHeaderBlockNumber: 0,
      rawData: rawArrayBuffer,
    };

    const dreamcastSaveFile = DreamcastDciSaveData.convertSaveFileToDci(saveFile);

    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveFile, dciArrayBuffer)).to.equal(true);
  });

  it('should correctly read a .DCI file containing a game', async () => {
    const dciArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DCI_GAME_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GAME_FILENAME);

    const dreamcastSaveFile = DreamcastDciSaveData.convertIndividualSaveToSaveFile(dciArrayBuffer, false); // The number of blocks listed in the directory entry header doesn't match the number of blocks in the actual data

    expect(dreamcastSaveFile.fileType).to.equal('Game');
    expect(dreamcastSaveFile.copyProtected).to.equal(true);
    expect(dreamcastSaveFile.firstBlockNumber).to.equal(0);
    expect(dreamcastSaveFile.filename).to.equal('TINY_TETRIS');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveFile.fileCreationTime)).to.equal('2018-11-15 20:10:44');
    expect(dreamcastSaveFile.fileSizeInBlocks).to.equal(7);
    expect(dreamcastSaveFile.fileHeaderBlockNumber).to.equal(1);
    expect(dreamcastSaveFile.storageComment).to.equal('Tiny Tetris     ');
    expect(dreamcastSaveFile.fileComment).to.equal('Mini VMU Tetris by marcus       ');

    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveFile.rawData, rawArrayBuffer)).to.equal(true);
  });

  it('should correctly write a .DCI file containing a game', async () => {
    const dciArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DCI_GAME_RECREATED_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GAME_FILENAME);

    const saveFile = {
      fileType: 'Game',
      copyProtected: true,
      filename: 'TINY_TETRIS',
      fileCreationTime: new Date('2018-11-15 20:10:44'),
      fileHeaderBlockNumber: 1,
      rawData: rawArrayBuffer,
    };

    const dreamcastSaveFile = DreamcastDciSaveData.convertSaveFileToDci(saveFile);

    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveFile, dciArrayBuffer)).to.equal(true);
  });
});
