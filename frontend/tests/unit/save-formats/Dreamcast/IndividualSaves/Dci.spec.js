import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import DreamcastDciSaveData from '@/save-formats/Dreamcast/IndividualSaves/Dci';
import DreamcastUtil from '@/save-formats/Dreamcast/Util';

const DIR = './tests/data/save-formats/dreamcast/individualsaves';

const DCI_FILENAME = `${DIR}/kiss-psycho-circus-the-nightmare-child.29341.dci`;
const DCI_RECREATED_FILENAME = `${DIR}/kiss-psycho-circus-the-nightmare-child.29341-recreated.dci`; // The day of week is set incorrectly in the original file, which is the only difference vs this file that we output
const RAW_FILENAME = `${DIR}/kiss-psycho-circus-the-nightmare-child.29341.bin`;

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
    expect(dreamcastSaveFile.fileHeaderOffsetInBlocks).to.equal(0);

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
      fileHeaderOffsetInBlocks: 0,
      rawData: rawArrayBuffer,
    };

    const dreamcastSaveFile = DreamcastDciSaveData.convertSaveFileToDci(saveFile);

    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveFile, dciArrayBuffer)).to.equal(true);
  });
});
