import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import NsoNesSaveData from '@/save-formats/NintendoSwitchOnline/Nes';

const DIR = './tests/data/save-formats/nintendoswitchonline/nes';

const NSO_FILENAME = `${DIR}/Legend_of_Zelda_The_USA_Rev_1.sram`;
const RAW_FILENAME = `${DIR}/Zelda-converted.srm`;

describe('Nintendo Switch Online - NES', () => {
  it('should convert a raw NES save to NSO format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    const nsoSaveData = NsoNesSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getNsoArrayBuffer(), nsoArrayBuffer)).to.equal(true);
  });

  it('should convert a NSO NES save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NSO_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    const nsoSaveData = NsoNesSaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSaveData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });
});
