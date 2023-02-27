import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import NsoSnesSaveData from '@/save-formats/NintendoSwitchOnline/Snes';

const DIR = './tests/data/save-formats/nintendoswitchonline/snes';

const SNES_FILENAME = `${DIR}/Super Mario World SNES.sram`;

describe('Nintendo Switch Online - SNES', () => {
  it('should convert a raw SNES save to NSO format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SNES_FILENAME);

    const nsoSnesSaveData = NsoSnesSaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSnesSaveData.getNsoArrayBuffer(), nsoSnesSaveData.getRawArrayBuffer())).to.equal(true);
  });

  it('should convert a NSO SNES save to raw format', async () => {
    const nsoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SNES_FILENAME);

    const nsoSnesSaveData = NsoSnesSaveData.createFromNsoData(nsoArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(nsoSnesSaveData.getNsoArrayBuffer(), nsoSnesSaveData.getRawArrayBuffer())).to.equal(true);
  });
});
