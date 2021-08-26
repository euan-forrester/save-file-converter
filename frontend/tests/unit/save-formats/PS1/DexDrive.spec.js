import { expect } from 'chai';
import DexDriveSaveData from '@/save-formats/PS1/DexDrive';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/dexdrive-ps1';

const DEXDRIVE_NO_FILES_FILENAME = `${DIR}/castlevania-symphony-of-the-night.3172.gme`;

const DEXDRIVE_ONE_FILE_FILENAME = `${DIR}/castlevania-symphony-of-the-night.1368.gme`;
const RAW_ONE_FILE_FILENAME = `${DIR}/castlevania-symphony-of-the-night.1368-BASLUS-00067DRAX01.srm`;

const DEXDRIVE_TWO_FILES_FILENAME = `${DIR}/castlevania-symphony-of-the-night.1782.gme`;
const RAW_TWO_FILES_FILENAMES = [`${DIR}/castlevania-symphony-of-the-night.1782-BASLUS-00067DRAX00.srm`, `${DIR}/castlevania-symphony-of-the-night.1782-BASLUS-00067DRAX01.srm`];

describe('DexDrive PS1 save format', () => {
  it('should correctly handle a file that contains no save data', async () => {
    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DEXDRIVE_NO_FILES_FILENAME);

    const dexDriveSaveData = DexDriveSaveData.createFromDexDriveData(dexDriveArrayBuffer);

    expect(dexDriveSaveData.getSaveFiles().length).to.equal(0);
  });

  it('should convert a file containing a single save that is one block', async () => {
    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DEXDRIVE_ONE_FILE_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_ONE_FILE_FILENAME);

    const dexDriveSaveData = DexDriveSaveData.createFromDexDriveData(dexDriveArrayBuffer);

    expect(dexDriveSaveData.getSaveFiles().length).to.equal(1);

    expect(dexDriveSaveData.getSaveFiles()[0].block).to.equal(0);
    expect(dexDriveSaveData.getSaveFiles()[0].filename).to.equal('BASLUS-00067DRAX01');
    expect(dexDriveSaveData.getSaveFiles()[0].comment).to.equal('');
    expect(dexDriveSaveData.getSaveFiles()[0].description).to.equal('ＣＡＳＴＬＥＶＡＮＩＡ－２　ＰＨＯＥＮＩＸ　２０８％');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[0].rawData, rawArrayBuffer)).to.equal(true);
  });

  it('should convert a file containing two saves that are each one block', async () => {
    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DEXDRIVE_TWO_FILES_FILENAME);
    const rawArrayBuffers = await Promise.all(RAW_TWO_FILES_FILENAMES.map((n) => ArrayBufferUtil.readArrayBuffer(n)));

    const dexDriveSaveData = DexDriveSaveData.createFromDexDriveData(dexDriveArrayBuffer);

    expect(dexDriveSaveData.getSaveFiles().length).to.equal(2);

    expect(dexDriveSaveData.getSaveFiles()[0].block).to.equal(0);
    expect(dexDriveSaveData.getSaveFiles()[0].filename).to.equal('BASLUS-00067DRAX00');
    expect(dexDriveSaveData.getSaveFiles()[0].comment).to.equal('');
    expect(dexDriveSaveData.getSaveFiles()[0].description).to.equal('ＣＡＳＴＬＥＶＡＮＩＡ－１　ＡＬＵＣＡＲＤ　２００％');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[0].rawData, rawArrayBuffers[0])).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles()[1].block).to.equal(1);
    expect(dexDriveSaveData.getSaveFiles()[1].filename).to.equal('BASLUS-00067DRAX01');
    expect(dexDriveSaveData.getSaveFiles()[1].comment).to.equal('');
    expect(dexDriveSaveData.getSaveFiles()[1].description).to.equal('ＣＡＳＴＬＥＶＡＮＩＡ－２　ＲＩＣＨＴＥＲ　１９５％');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[1].rawData, rawArrayBuffers[1])).to.equal(true);
  });
});
