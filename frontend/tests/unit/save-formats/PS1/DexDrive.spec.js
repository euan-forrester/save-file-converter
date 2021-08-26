import { expect } from 'chai';
import DexDriveSaveData from '@/save-formats/DexDrive';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/dexdrive-ps1';

const DEXDRIVE_NO_FILES_FILENAME = `${DIR}/castlevania-symphony-of-the-night.3172.gme`;

const DEXDRIVE_ONE_FILE_FILENAME = `${DIR}/castlevania-symphony-of-the-night.1368.gme`;
const RAW_ONE_FILE_FILENAME = `${DIR}/castlevania-symphony-of-the-night.1368-BASLUS-00067DRAX01.srm`;

/*
const DEXDRIVE_15_FILES_FILENAME = `${DIR}/castlevania-symphony-of-the-night.1782.gme`;
const RAW_15_FILES_FILENAME = `${DIR}/castlevania-symphony-of-the-night.1782.srm`;
*/

describe('DexDrive PS1 save format', () => {
  it('should correctly handle a file that contains no save data', async () => {
    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DEXDRIVE_NO_FILES_FILENAME);

    const dexDriveSaveData = DexDriveSaveData.createFromDexDriveData(dexDriveArrayBuffer);

    expect(dexDriveSaveData.getSaveFiles().length).to.equal(0);
  });

  it('should convert a single save file to a raw file', async () => {
    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DEXDRIVE_ONE_FILE_FILENAME);
    // const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_ONE_FILE_FILENAME);

    const dexDriveSaveData = DexDriveSaveData.createFromDexDriveData(dexDriveArrayBuffer);

    for (let i = 0; i < dexDriveSaveData.getSaveFiles().length; i += 1) {
      const saveFile = dexDriveSaveData.getSaveFiles()[i];
      console.log(`Found block ${saveFile.block} contains file: '${saveFile.filename}', comment: '${saveFile.comment}', \
description: '${saveFile.description}', raw save data length: ${saveFile.rawData.byteLength}`);

      ArrayBufferUtil.writeArrayBuffer(RAW_ONE_FILE_FILENAME, saveFile.rawData);
    }

    // expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getRawSaveData(), rawArrayBuffer)).to.equal(true);
  });

  /*
  it('should convert a 15 save file to a raw file', async () => {
    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DEXDRIVE_15_FILES_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_15_FILES_FILENAME);

    const dexDriveSaveData = DexDriveSaveData.createFromDexDriveData(dexDriveArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getRawSaveData(), rawArrayBuffer)).to.equal(true);
  });
  */
});
