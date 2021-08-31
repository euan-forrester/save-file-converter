import { expect } from 'chai';
import Ps1MemcardSaveData from '@/save-formats/PS1/Memcard';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/ps1/memcard';

const SINGLE_BLOCK_TWO_FILES_FILENAMES = [`${DIR}/castlevania-symphony-of-the-night.1782-BASLUS-00067DRAX00.srm`, `${DIR}/castlevania-symphony-of-the-night.1782-BASLUS-00067DRAX01.srm`];

describe('PS1 memcard save format', () => {
  it('should correctly create a file that has two saves of one block each', async () => {
    const saveFilesArrayBuffers = await Promise.all(SINGLE_BLOCK_TWO_FILES_FILENAMES.map((n) => ArrayBufferUtil.readArrayBuffer(n)));
    const saveFilenames = SINGLE_BLOCK_TWO_FILES_FILENAMES.map((n) => n.substr(-22, 18));
    const saveFiles = SINGLE_BLOCK_TWO_FILES_FILENAMES.map((n, i) => ({ filename: saveFilenames[i], rawData: saveFilesArrayBuffers[i] }));

    const ps1MemcardSaveData = Ps1MemcardSaveData.createFromSaveFiles(saveFiles);

    expect(ps1MemcardSaveData.getSaveFiles().length).to.equal(SINGLE_BLOCK_TWO_FILES_FILENAMES.length);
  });
});
