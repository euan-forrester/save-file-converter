import { expect } from 'chai';
import Retron5SaveData from '@/save-formats/Retron5/Retron5';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/data/save-formats/retron5';

const RETRON5_FILENAME = `${DIR}/Final Fantasy III (USA).sav`;
const RAW_FILENAME = `${DIR}/Final Fantasy III (USA).srm`;

const RETRON5_WITH_PADDING_FILENAME = `${DIR}/Tomato Adventure (Japan).sav`;
const RAW_WITHOUT_PADDING_FILENAME = `${DIR}/Tomato Adventure (Japan)-truncated.srm`;

describe('Retron 5 save format', () => {
  it('should convert a Retron 5 file to a raw file', async () => {
    const retron5ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RETRON5_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    const retron5SaveData = Retron5SaveData.createFromRetron5Data(retron5ArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(retron5SaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw file to a Retron 5 file', async () => {
    const retron5ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RETRON5_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    const retron5SaveData = Retron5SaveData.createFromEmulatorData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(retron5SaveData.getRetron5ArrayBuffer(), retron5ArrayBuffer)).to.equal(true);
  });

  it('should convert a Retron 5 file with extra padding to a raw file without padding', async () => {
    const retron5ArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RETRON5_WITH_PADDING_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_WITHOUT_PADDING_FILENAME);

    const retron5SaveData = Retron5SaveData.createFromRetron5Data(retron5ArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(retron5SaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });
});
