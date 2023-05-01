import { expect } from 'chai';
import WiiSaveData from '@/save-formats/Wii/Wii';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/data/save-formats/wii';

const WII_FILENAME = `${DIR}/zelda-ii-the-adventure-of-link.15037.bin`;
const RAW_FILENAME = `${DIR}/zelda-ii-the-adventure-of-link.15037-extracted.bin`;

const WII_MULTIPLE_FILES_FILENAME = `${DIR}/Zelda NES Dolphin VC.bin`; // This file is the only one I've seen that has multiple files inside it, and it was also created by Dolphin. Not sure if the 2 facts are related
const RAW_MULTIPLE_FILES_FILENAME_1 = `${DIR}/Zelda NES Dolphin VC-extracted-1.bin`;
const RAW_MULTIPLE_FILES_FILENAME_2 = `${DIR}/Zelda NES Dolphin VC-extracted-2.bin`;

const WII_GENESIS_EEPROM_FILENAME = `${DIR}/wonder-boy-in-monster-world.bin`;
const RAW_GENESIS_EEPROM_FILENAME = `${DIR}/wonder-boy-in-monster-world-extracted.bin`;

const WII_GENESIS_FRAM_FILENAME = `${DIR}/sonic-the-hedgehog-3.18899.bin`;
const RAW_GENESIS_FRAM_FILENAME = `${DIR}/sonic-the-hedgehog-3.18899-extracted.bin`;

const WII_MARIO_GOLF_FILENAME = `${DIR}/mario-golf.23691.bin`;
const RAW_MARIO_GOLF_FILENAME = `${DIR}/mario-golf.23681-extracted.bin`;

describe('Wii save format', () => {
  it('should decrypt and parse a sample save file', async () => {
    const wiiArrayBuffer = await ArrayBufferUtil.readArrayBuffer(WII_FILENAME);
    const wiiSaveData = new WiiSaveData(wiiArrayBuffer);

    expect(wiiSaveData.getGameTitle()).to.equal('Zelda Ⅱ');
    expect(wiiSaveData.getGameSubtitle()).to.equal('The Adv. of Link');
    expect(wiiSaveData.getGameId()).to.equal('FA9E');
    expect(wiiSaveData.getNumberOfFiles()).to.equal(1);
    expect(wiiSaveData.getSizeOfFiles()).to.equal(8384);
    expect(wiiSaveData.getTotalSize()).to.equal(9344);

    const fileList = wiiSaveData.getFiles();

    expect(fileList.length).to.equal(1);

    const file = fileList[0];

    expect(file.size).to.equal(8256);
    expect(file.name).to.equal('savedata.bin');
    expect(file.data.byteLength).to.equal(file.size);

    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    expect(ArrayBufferUtil.arrayBuffersEqual(file.data, rawArrayBuffer)).to.equal(true);
  });

  it('should decrypt a save file containing multiple files', async () => {
    const wiiArrayBuffer = await ArrayBufferUtil.readArrayBuffer(WII_MULTIPLE_FILES_FILENAME);
    const rawArrayBuffer1 = await ArrayBufferUtil.readArrayBuffer(RAW_MULTIPLE_FILES_FILENAME_1);
    const rawArrayBuffer2 = await ArrayBufferUtil.readArrayBuffer(RAW_MULTIPLE_FILES_FILENAME_2);

    const wiiSaveData = new WiiSaveData(wiiArrayBuffer);

    expect(wiiSaveData.getGameTitle()).to.equal('The Legend of Zelda');
    expect(wiiSaveData.getGameSubtitle()).to.equal('lda ');
    expect(wiiSaveData.getGameId()).to.equal('FAKE'); // Surprisingly this is the correct game ID for Zelda
    expect(wiiSaveData.getNumberOfFiles()).to.equal(3);
    expect(wiiSaveData.getSizeOfFiles()).to.equal(32256);
    expect(wiiSaveData.getTotalSize()).to.equal(33216);

    const fileList = wiiSaveData.getFiles();

    expect(fileList.length).to.equal(3);

    expect(fileList[0].size).to.equal(0);
    expect(fileList[0].name).to.equal('nocopy');
    expect(fileList[0].data.byteLength).to.equal(fileList[0].size);

    expect(fileList[1].size).to.equal(23616); // Whatever this file is for, it's just all zeros
    expect(fileList[1].name).to.equal('nocopy/savework.bin');
    expect(fileList[1].data.byteLength).to.equal(fileList[1].size);

    expect(fileList[2].size).to.equal(8256);
    expect(fileList[2].name).to.equal('savedata.bin');
    expect(fileList[2].data.byteLength).to.equal(fileList[2].size);

    expect(ArrayBufferUtil.arrayBuffersEqual(fileList[1].data, rawArrayBuffer1)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(fileList[2].data, rawArrayBuffer2)).to.equal(true);
  });

  it('should decrypt and parse a Genesis EEPROM save file', async () => {
    const wiiArrayBuffer = await ArrayBufferUtil.readArrayBuffer(WII_GENESIS_EEPROM_FILENAME);
    const wiiSaveData = new WiiSaveData(wiiArrayBuffer);

    expect(wiiSaveData.getGameTitle()).to.equal('Wonder Boy in MW');
    expect(wiiSaveData.getGameSubtitle()).to.equal('GENESIS');
    expect(wiiSaveData.getGameId()).to.equal('MAVE');
    expect(wiiSaveData.getNumberOfFiles()).to.equal(1);
    expect(wiiSaveData.getSizeOfFiles()).to.equal(49280);
    expect(wiiSaveData.getTotalSize()).to.equal(50240);

    const fileList = wiiSaveData.getFiles();

    expect(fileList.length).to.equal(1);

    const file = fileList[0];

    expect(file.size).to.equal(49152);
    expect(file.name).to.equal('savedata.bin');
    expect(file.data.byteLength).to.equal(file.size);

    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GENESIS_EEPROM_FILENAME);

    expect(ArrayBufferUtil.arrayBuffersEqual(file.data, rawArrayBuffer)).to.equal(true);
  });

  it('should decrypt and parse a Genesis FRAM save file', async () => {
    const wiiArrayBuffer = await ArrayBufferUtil.readArrayBuffer(WII_GENESIS_FRAM_FILENAME);
    const wiiSaveData = new WiiSaveData(wiiArrayBuffer);

    expect(wiiSaveData.getGameTitle()).to.equal('Sonic the Hedgehog 3');
    expect(wiiSaveData.getGameSubtitle()).to.equal('og 3GENESIS');
    expect(wiiSaveData.getGameId()).to.equal('MBME');
    expect(wiiSaveData.getNumberOfFiles()).to.equal(1);
    expect(wiiSaveData.getSizeOfFiles()).to.equal(49280);
    expect(wiiSaveData.getTotalSize()).to.equal(50240);

    const fileList = wiiSaveData.getFiles();

    expect(fileList.length).to.equal(1);

    const file = fileList[0];

    expect(file.size).to.equal(49152);
    expect(file.name).to.equal('savedata.bin');
    expect(file.data.byteLength).to.equal(file.size);

    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_GENESIS_FRAM_FILENAME);

    expect(ArrayBufferUtil.arrayBuffersEqual(file.data, rawArrayBuffer)).to.equal(true);
  });

  it('should decrypt and parse a Mario Golf save file', async () => {
    const wiiArrayBuffer = await ArrayBufferUtil.readArrayBuffer(WII_MARIO_GOLF_FILENAME);
    const wiiSaveData = new WiiSaveData(wiiArrayBuffer);

    expect(wiiSaveData.getGameTitle()).to.equal('Mario Golf');
    expect(wiiSaveData.getGameSubtitle()).to.equal(' ');
    expect(wiiSaveData.getGameId()).to.equal('NAUE');
    expect(wiiSaveData.getNumberOfFiles()).to.equal(1);
    expect(wiiSaveData.getSizeOfFiles()).to.equal(49280);
    expect(wiiSaveData.getTotalSize()).to.equal(50240);

    const fileList = wiiSaveData.getFiles();

    const file = fileList[0];

    expect(file.size).to.equal(49152);
    expect(file.name).to.equal('RAM_NMFE');
    expect(file.data.byteLength).to.equal(file.size);

    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_MARIO_GOLF_FILENAME);

    expect(ArrayBufferUtil.arrayBuffersEqual(file.data, rawArrayBuffer)).to.equal(true);
  });
});
