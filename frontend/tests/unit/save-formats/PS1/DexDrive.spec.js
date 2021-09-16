import { expect } from 'chai';
import DexDriveSaveData from '@/save-formats/PS1/DexDrive';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/ps1/dexdrive';

const DEXDRIVE_NO_FILES_FILENAME = `${DIR}/castlevania-symphony-of-the-night.3172.gme`;

const DEXDRIVE_ONE_FILE_FILENAME = `${DIR}/castlevania-symphony-of-the-night.1368.gme`;
const RAW_ONE_FILE_FILENAME = `${DIR}/castlevania-symphony-of-the-night.1368-BASLUS-00067DRAX01.srm`;

const DEXDRIVE_TWO_FILES_FILENAME = `${DIR}/castlevania-symphony-of-the-night.1782.gme`;
const RAW_TWO_FILES_FILENAMES = [`${DIR}/castlevania-symphony-of-the-night.1782-BASLUS-00067DRAX00.srm`, `${DIR}/castlevania-symphony-of-the-night.1782-BASLUS-00067DRAX01.srm`];

const DEXDRIVE_FIVE_BLOCK_FILENAME = `${DIR}/gran-turismo.26535.gme`;
const RAW_FIVE_BLOCK_FILENAME = `${DIR}/gran-turismo.26535-BASCUS-94194GT.srm`;

const DEXDRIVE_FIVE_BLOCK_PLUS_OTHER_STUFF_FILENAME = `${DIR}/gran-turismo.26537.gme`;
const RAW_FIVE_BLOCK_PLUS_OTHER_STUFF_FILENAME = [`${DIR}/gran-turismo.26537-BASCUS-94194GT.srm`, `${DIR}/gran-turismo.26537-BASCUS-94194RT.srm`];
const OUTPUT_DEXDRIVE_FIVE_BLOCK_PLUS_OTHER_STUFF_FILENAME = `${DIR}/gran-turismo.26537-output.gme`;

const COMMENTS = [
  'I used to have a DexDrive but then I foolishly gave it away when I was purging old stuff. Now I have regret.',
  'I thought it was useless without a serial port, and that the included software was too old, but you can get a USB adaptor and memcardrex can talk to it.',
];

describe('PS1 - DexDrive save format', () => {
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

    expect(dexDriveSaveData.getSaveFiles()[0].startingBlock).to.equal(0);
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

    expect(dexDriveSaveData.getSaveFiles()[0].startingBlock).to.equal(0);
    expect(dexDriveSaveData.getSaveFiles()[0].filename).to.equal('BASLUS-00067DRAX00');
    expect(dexDriveSaveData.getSaveFiles()[0].comment).to.equal('');
    expect(dexDriveSaveData.getSaveFiles()[0].description).to.equal('ＣＡＳＴＬＥＶＡＮＩＡ－１　ＡＬＵＣＡＲＤ　２００％');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[0].rawData, rawArrayBuffers[0])).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles()[1].startingBlock).to.equal(1);
    expect(dexDriveSaveData.getSaveFiles()[1].filename).to.equal('BASLUS-00067DRAX01');
    expect(dexDriveSaveData.getSaveFiles()[1].comment).to.equal('');
    expect(dexDriveSaveData.getSaveFiles()[1].description).to.equal('ＣＡＳＴＬＥＶＡＮＩＡ－２　ＲＩＣＨＴＥＲ　１９５％');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[1].rawData, rawArrayBuffers[1])).to.equal(true);
  });

  it('should convert a file containing a save that is five blocks long', async () => {
    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DEXDRIVE_FIVE_BLOCK_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FIVE_BLOCK_FILENAME);

    const dexDriveSaveData = DexDriveSaveData.createFromDexDriveData(dexDriveArrayBuffer);

    expect(dexDriveSaveData.getSaveFiles().length).to.equal(1);

    expect(dexDriveSaveData.getSaveFiles()[0].startingBlock).to.equal(0);
    expect(dexDriveSaveData.getSaveFiles()[0].filename).to.equal('BASCUS-94194GT');
    expect(dexDriveSaveData.getSaveFiles()[0].comment).to.equal('');
    expect(dexDriveSaveData.getSaveFiles()[0].description).to.equal('ＧＴ　ｇａｍｅ　ｄａｔａ');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[0].rawData, rawArrayBuffer)).to.equal(true);
  });

  it('should convert a file containing a save that is five blocks long and a save that is three blocks long plus some deleted files', async () => {
    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(DEXDRIVE_FIVE_BLOCK_PLUS_OTHER_STUFF_FILENAME);
    const rawArrayBuffers = await Promise.all(RAW_FIVE_BLOCK_PLUS_OTHER_STUFF_FILENAME.map((n) => ArrayBufferUtil.readArrayBuffer(n)));

    const dexDriveSaveData = DexDriveSaveData.createFromDexDriveData(dexDriveArrayBuffer);

    expect(dexDriveSaveData.getSaveFiles().length).to.equal(2);

    expect(dexDriveSaveData.getSaveFiles()[0].startingBlock).to.equal(6);
    expect(dexDriveSaveData.getSaveFiles()[0].filename).to.equal('BASCUS-94194GT');
    expect(dexDriveSaveData.getSaveFiles()[0].comment).to.equal('');
    expect(dexDriveSaveData.getSaveFiles()[0].description).to.equal('ＧＴ　ｇａｍｅ　ｄａｔａ');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[0].rawData, rawArrayBuffers[0])).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles()[1].startingBlock).to.equal(12);
    expect(dexDriveSaveData.getSaveFiles()[1].filename).to.equal('BASCUS-94194RT');
    expect(dexDriveSaveData.getSaveFiles()[1].comment).to.equal('');
    expect(dexDriveSaveData.getSaveFiles()[1].description).to.equal('ＧＴ　ｒｅｐｌａｙ　ｄａｔａ');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[1].rawData, rawArrayBuffers[1])).to.equal(true);
  });

  it('should correctly create a file that has two saves of 3 and 5 blocks respectively', async () => {
    const dexDriveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(OUTPUT_DEXDRIVE_FIVE_BLOCK_PLUS_OTHER_STUFF_FILENAME);
    const saveFilesArrayBuffers = await Promise.all(RAW_FIVE_BLOCK_PLUS_OTHER_STUFF_FILENAME.map((n) => ArrayBufferUtil.readArrayBuffer(n)));
    const saveFilenames = RAW_FIVE_BLOCK_PLUS_OTHER_STUFF_FILENAME.map((n) => n.substr(-18, 14));
    const saveFiles = RAW_FIVE_BLOCK_PLUS_OTHER_STUFF_FILENAME.map((n, i) => ({ filename: saveFilenames[i], rawData: saveFilesArrayBuffers[i], comment: COMMENTS[i] }));

    const dexDriveSaveData = DexDriveSaveData.createFromSaveFiles(saveFiles);

    expect(dexDriveSaveData.getSaveFiles().length).to.equal(RAW_FIVE_BLOCK_PLUS_OTHER_STUFF_FILENAME.length);

    expect(dexDriveSaveData.getSaveFiles()[0].startingBlock).to.equal(0);
    expect(dexDriveSaveData.getSaveFiles()[0].filename).to.equal('BASCUS-94194GT');
    expect(dexDriveSaveData.getSaveFiles()[0].comment).to.equal(COMMENTS[0]);
    expect(dexDriveSaveData.getSaveFiles()[0].description).to.equal('ＧＴ　ｇａｍｅ　ｄａｔａ');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[0].rawData, saveFilesArrayBuffers[0])).to.equal(true);

    expect(dexDriveSaveData.getSaveFiles()[1].startingBlock).to.equal(5);
    expect(dexDriveSaveData.getSaveFiles()[1].filename).to.equal('BASCUS-94194RT');
    expect(dexDriveSaveData.getSaveFiles()[1].comment).to.equal(COMMENTS[1]);
    expect(dexDriveSaveData.getSaveFiles()[1].description).to.equal('ＧＴ　ｒｅｐｌａｙ　ｄａｔａ');
    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getSaveFiles()[1].rawData, saveFilesArrayBuffers[1])).to.equal(true);

    expect(ArrayBufferUtil.arrayBuffersEqual(dexDriveSaveData.getArrayBuffer(), dexDriveArrayBuffer)).to.equal(true);
  });
});
