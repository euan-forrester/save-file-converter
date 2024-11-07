import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import SegaSaturnBupSaveData from '@/save-formats/SegaSaturn/Bup';
import SegaSaturnUtil from '@/save-formats/SegaSaturn/Util';

const DIR = './tests/data/save-formats/segasaturn';

const BUP_FILENAME = `${DIR}/DRACULAX.BUP`;
const RAW_FILENAME = `${DIR}/DRACULAX.raw`;
const BUP_RECREATED_FILENAME = `${DIR}/DRACULAX-recreated.BUP`;

describe('Sega Saturn', () => {
  it('should correctly read a .BUP file', async () => {
    const bupArrayBuffer = await ArrayBufferUtil.readArrayBuffer(BUP_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    const segaSaturnSaveFiles = SegaSaturnBupSaveData.convertBupsToSaveFiles([bupArrayBuffer]);

    expect(segaSaturnSaveFiles.length).to.equal(1);

    expect(segaSaturnSaveFiles[0].name).to.equal('DRACULAX_02');
    expect(segaSaturnSaveFiles[0].language).to.equal('Japanese');
    expect(segaSaturnSaveFiles[0].comment).to.equal('ﾄﾞﾗｷｭﾗX'); // "Dracula X"
    expect(segaSaturnSaveFiles[0].date.toUTCString()).to.equal('Fri, 05 Sep 1997 05:38:00 GMT');
    expect(segaSaturnSaveFiles[0].saveSize).to.equal(4388);
    expect(segaSaturnSaveFiles[0].saveSize).to.equal(rawArrayBuffer.byteLength);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveFiles[0].rawData, rawArrayBuffer)).to.equal(true);
  });

  it('should correctly write a .BUP file', async () => {
    // The .BUP file that we write out differs at 2 points from the original one we got from the web.
    //
    // The first is that ours sets byte 0x1B to 0. This is the last character in the encoded name, and
    // is one byte beyond what the actual Saturn can read. It's supposedly to store a NULL at the end of the name
    // string (which is unnecessary). No idea why it's non-zero in our sample file
    //
    // The second is that ours sets byte 0x31 to 0. This is part of the block size specified by the file.
    // The example code we based our implementation off of sets this to be zero. The example file
    // contains 77 for the block size, which makes no sense. 0x40 and 0x200 are the only legitimate sizes
    // that I've seen so far.
    const bupArrayBuffer = await ArrayBufferUtil.readArrayBuffer(BUP_RECREATED_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    const saveFile = {
      name: 'DRACULAX_02',
      languageCode: SegaSaturnUtil.getLanguageCode('Japanese'),
      comment: 'ﾄﾞﾗｷｭﾗX', // "Dracula X"
      dateCode: SegaSaturnUtil.getDateCode(new Date('Fri, 05 Sep 1997 05:38:00 GMT')),
      saveSize: rawArrayBuffer.byteLength,
      rawData: rawArrayBuffer,
    };

    const segaSaturnSaveFiles = SegaSaturnBupSaveData.convertSaveFilesToBups([saveFile]);

    expect(segaSaturnSaveFiles.length).to.equal(1);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveFiles[0], bupArrayBuffer)).to.equal(true);
  });
});
