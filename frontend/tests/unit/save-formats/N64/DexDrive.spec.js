import { expect } from 'chai';
import N64DexDriveSaveData from '@/save-formats/N64/DexDrive';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/n64/dexdrive';

const DEXDRIVE_ONE_FILE_FILENAME = `${DIR}/mario-kart-64.1116.n64`;
const RAW_ONE_FILE_FILENAME = `${DIR}/mario-kart-64.1116.mpk`;

describe('N64 - DexDrive save format', () => {
  it('should convert a file containing a single save that is one block', async () => {
    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DEXDRIVE_ONE_FILE_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_ONE_FILE_FILENAME);

    const dexDriveSaveData = N64DexDriveSaveData.createFromDexDriveData(dexDriveArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getMempack().getArrayBuffer(), rawArrayBuffer)).to.equal(true);

    /*
    expect(dexDriveSaveData.getSaveFiles().length).to.equal(1);

    expect(dexDriveSaveData.getSaveFiles()[0].startingBlock).to.equal(0);
    expect(dexDriveSaveData.getSaveFiles()[0].filename).to.equal('BASLUS-00067DRAX01');
    expect(dexDriveSaveData.getSaveFiles()[0].comment).to.equal('');
    expect(dexDriveSaveData.getSaveFiles()[0].description).to.equal('CASTLEVANIA-2 PHOENIX 208%');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[0].rawData, rawArrayBuffer)).to.equal(true);
    */
  });
});
