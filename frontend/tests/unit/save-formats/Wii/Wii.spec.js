import { expect } from 'chai';
import WiiSaveData from '@/save-formats/Wii/Wii';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/wii';

const WII_FILENAME = `${DIR}/zelda-ii-the-adventure-of-link.15037.bin`;
const RAW_FILENAME = `${DIR}/zelda-ii-the-adventure-of-link.15037-extracted.bin`;

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
