import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import SegaSaturnBupSaveData from '@/save-formats/SegaSaturn/Bup';
import SegaSaturnUtil from '@/save-formats/SegaSaturn/Util';

const DIR = './tests/data/save-formats/segasaturn';

const BUP_JAPANESE_FILENAME = `${DIR}/DRACULAX.BUP`;
const RAW_JAPANESE_FILENAME = `${DIR}/DRACULAX.raw`;
const BUP_JAPANESE_RECREATED_FILENAME = `${DIR}/DRACULAX-recreated.BUP`;

const BUP_ENGLISH_FILENAME = `${DIR}/SFORCE31.BUP`;
const RAW_ENGLISH_FILENAME = `${DIR}/SFORCE31.raw`;
const BUP_ENGLISH_RECREATED_FILENAME = `${DIR}/SFORCE31-recreated.BUP`;

describe('Sega Saturn', () => {
  it('should correctly read a .BUP file with a Japanese comment', async () => {
    const bupArrayBuffer = await ArrayBufferUtil.readArrayBuffer(BUP_JAPANESE_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_JAPANESE_FILENAME);

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

  it('should correctly write a .BUP file with a Japanese comment', async () => {
    // The .BUP file that we write out differs at 2 points from the original one we got from the web.
    //
    // The first is that ours sets byte 0x1B to 0. This is the last character in the encoded name, and
    // is one byte beyond what the actual Saturn can read. It's supposedly to store a NULL at the end of the name
    // string (which is unnecessary). No idea why it's non-zero in our sample file
    //
    // The second is that ours sets byte 0x31 to 0. This is part of the block size specified by the file.
    // The example code we based our implementation off of sets this to be zero. The example file
    // contains 77 for the data size in blocks and we write it out as 0
    const bupArrayBuffer = await ArrayBufferUtil.readArrayBuffer(BUP_JAPANESE_RECREATED_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_JAPANESE_FILENAME);

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

  it('should correctly read a .BUP file with an English comment', async () => {
    const bupArrayBuffer = await ArrayBufferUtil.readArrayBuffer(BUP_ENGLISH_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_ENGLISH_FILENAME);

    const segaSaturnSaveFiles = SegaSaturnBupSaveData.convertBupsToSaveFiles([bupArrayBuffer]);

    expect(segaSaturnSaveFiles.length).to.equal(1);

    expect(segaSaturnSaveFiles[0].name).to.equal('SFORCE31_01');
    expect(segaSaturnSaveFiles[0].language).to.equal('Japanese');
    expect(segaSaturnSaveFiles[0].comment).to.equal('Synbios   ');
    expect(segaSaturnSaveFiles[0].date.toUTCString()).to.equal('Tue, 24 Oct 1995 05:39:00 GMT');
    expect(segaSaturnSaveFiles[0].saveSize).to.equal(12904);
    expect(segaSaturnSaveFiles[0].saveSize).to.equal(rawArrayBuffer.byteLength);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveFiles[0].rawData, rawArrayBuffer)).to.equal(true);
  });

  it('should correctly write a .BUP file with an English comment', async () => {
    // The .BUP file that we write out differs at 4 points from the original one we got from the web
    //
    // The first is that the save ID in the web one is set to 0x04, whereas ours sets it to be 0 since it's the first one in the list provided
    //
    // The second is that there are some stats set in the one from the web, whereas we set them all to 0
    //
    // The third one is that the one from the web has the data size in blocks set to 52 whereas our implementation sets it to 0
    //
    // The last one is that the one from the web has a different date set in date2, whereas ours sets both dates to be the same
    const bupArrayBuffer = await ArrayBufferUtil.readArrayBuffer(BUP_ENGLISH_RECREATED_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_ENGLISH_FILENAME);

    const saveFile = {
      name: 'SFORCE31_01',
      languageCode: SegaSaturnUtil.getLanguageCode('Japanese'),
      comment: 'Synbios   ',
      dateCode: SegaSaturnUtil.getDateCode(new Date('Tue, 24 Oct 1995 05:39:00 GMT')),
      saveSize: rawArrayBuffer.byteLength,
      rawData: rawArrayBuffer,
    };

    const segaSaturnSaveFiles = SegaSaturnBupSaveData.convertSaveFilesToBups([saveFile]);

    expect(segaSaturnSaveFiles.length).to.equal(1);

    expect(ArrayBufferUtil.arrayBuffersEqual(segaSaturnSaveFiles[0], bupArrayBuffer)).to.equal(true);
  });
});
