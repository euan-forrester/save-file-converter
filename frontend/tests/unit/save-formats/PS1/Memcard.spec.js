import { expect } from 'chai';
import Ps1MemcardSaveData from '@/save-formats/PS1/Memcard';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/ps1/memcard';

const SINGLE_BLOCK_TWO_FILES_FILENAMES = [`${DIR}/castlevania-symphony-of-the-night.1782-BASLUS-00067DRAX00.srm`, `${DIR}/castlevania-symphony-of-the-night.1782-BASLUS-00067DRAX01.srm`];

const MULTI_BLOCK_TWO_FILES_FILENAMES = [`${DIR}/gran-turismo.26537-BASCUS-94194GT.srm`, `${DIR}/gran-turismo.26537-BASCUS-94194RT.srm`];

describe('PS1 memcard save format', () => {
  it('should correctly create a file that has two saves of one block each', async () => {
    const saveFilesArrayBuffers = await Promise.all(SINGLE_BLOCK_TWO_FILES_FILENAMES.map((n) => ArrayBufferUtil.readArrayBuffer(n)));
    const saveFilenames = SINGLE_BLOCK_TWO_FILES_FILENAMES.map((n) => n.substr(-22, 18));
    const saveFiles = SINGLE_BLOCK_TWO_FILES_FILENAMES.map((n, i) => ({ filename: saveFilenames[i], rawData: saveFilesArrayBuffers[i] }));

    const ps1MemcardSaveData = Ps1MemcardSaveData.createFromSaveFiles(saveFiles);

    expect(ps1MemcardSaveData.getSaveFiles().length).to.equal(SINGLE_BLOCK_TWO_FILES_FILENAMES.length);

    expect(ps1MemcardSaveData.getSaveFiles()[0].startingBlock).to.equal(0);
    expect(ps1MemcardSaveData.getSaveFiles()[0].filename).to.equal('BASLUS-00067DRAX00');
    expect(ps1MemcardSaveData.getSaveFiles()[0].description).to.equal('ＣＡＳＴＬＥＶＡＮＩＡ－１　ＡＬＵＣＡＲＤ　２００％');
    expect(ArrayBufferUtil.arrayBuffersEqual(ps1MemcardSaveData.getSaveFiles()[0].rawData, saveFilesArrayBuffers[0])).to.equal(true);

    expect(ps1MemcardSaveData.getSaveFiles()[1].startingBlock).to.equal(1);
    expect(ps1MemcardSaveData.getSaveFiles()[1].filename).to.equal('BASLUS-00067DRAX01');
    expect(ps1MemcardSaveData.getSaveFiles()[1].description).to.equal('ＣＡＳＴＬＥＶＡＮＩＡ－２　ＲＩＣＨＴＥＲ　１９５％');
    expect(ArrayBufferUtil.arrayBuffersEqual(ps1MemcardSaveData.getSaveFiles()[1].rawData, saveFilesArrayBuffers[1])).to.equal(true);
  });

  it('should correctly create a file that has two saves of 3 and 5 blocks respectively', async () => {
    const saveFilesArrayBuffers = await Promise.all(MULTI_BLOCK_TWO_FILES_FILENAMES.map((n) => ArrayBufferUtil.readArrayBuffer(n)));
    const saveFilenames = MULTI_BLOCK_TWO_FILES_FILENAMES.map((n) => n.substr(-18, 14));
    const saveFiles = MULTI_BLOCK_TWO_FILES_FILENAMES.map((n, i) => ({ filename: saveFilenames[i], rawData: saveFilesArrayBuffers[i] }));

    const ps1MemcardSaveData = Ps1MemcardSaveData.createFromSaveFiles(saveFiles);

    expect(ps1MemcardSaveData.getSaveFiles().length).to.equal(MULTI_BLOCK_TWO_FILES_FILENAMES.length);

    expect(ps1MemcardSaveData.getSaveFiles()[0].startingBlock).to.equal(0);
    expect(ps1MemcardSaveData.getSaveFiles()[0].filename).to.equal('BASCUS-94194GT');
    expect(ps1MemcardSaveData.getSaveFiles()[0].description).to.equal('ＧＴ　ｇａｍｅ　ｄａｔａ');
    expect(ArrayBufferUtil.arrayBuffersEqual(ps1MemcardSaveData.getSaveFiles()[0].rawData, saveFilesArrayBuffers[0])).to.equal(true);

    expect(ps1MemcardSaveData.getSaveFiles()[1].startingBlock).to.equal(5);
    expect(ps1MemcardSaveData.getSaveFiles()[1].filename).to.equal('BASCUS-94194RT');
    expect(ps1MemcardSaveData.getSaveFiles()[1].description).to.equal('ＧＴ　ｒｅｐｌａｙ　ｄａｔａ');
    expect(ArrayBufferUtil.arrayBuffersEqual(ps1MemcardSaveData.getSaveFiles()[1].rawData, saveFilesArrayBuffers[1])).to.equal(true);
  });
});
