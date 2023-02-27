import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import NsoGbaSaveData from '@/save-formats/NintendoSwitchOnline/GameboyAdvance';

const DIR = './tests/data/save-formats/nintendoswitchonline/gba';

const GBA_FILENAME = `${DIR}/The_Legend_of_Zelda_The_Minish_Cap.sram`;

describe('Nintendo Switch Online - GBA', () => {
  it('should convert a raw GBA save to NSO format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GBA_FILENAME);

    const nsoGbaSaveData = NsoGbaSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoGbaSaveData.getNsoArrayBuffer(), nsoGbaSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a NSO GBA save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GBA_FILENAME);

    const nsoGbaSaveData = NsoGbaSaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoGbaSaveData.getNsoArrayBuffer(), nsoGbaSaveData.getRawArrayBuffer())).to.equal(true);
  });
});
