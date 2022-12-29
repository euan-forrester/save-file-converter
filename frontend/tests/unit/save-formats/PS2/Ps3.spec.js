import { expect } from 'chai';
import Ps3SaveData from '@/save-formats/PS2/Ps3';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/data/save-formats/ps2/ps3';

const PS3_SUIKODEN_III_FILENAME = `${DIR}/Suikoden III-BASLUS-20387737569335F753031.PSV`;
const PS3_SUIKODEN_III_BASE_FILENAME = PS3_SUIKODEN_III_FILENAME.substr(-28, 24);
// const RAW_SUIKODEN_III_FILENAME = `${DIR}/street-fighter-ex2-plus.17782.mcr`;

/*
const RAW_SUIKODEN_2_FILENAME = `${DIR}/Suikoden 2-BASLUS-00958GS2-7.srm`;
const RAW_SUIKODEN_2_BASE_FILENAME = RAW_SUIKODEN_2_FILENAME.substr(-21, 17);
const PS3_SUIKODEN_2_FILENAME = `${DIR}/Suikoden 2-BASLUS-009584753322D37.PSV`;
*/

describe('PS1 - PS3 save format', () => {
  it('should convert a PS3 file to PS2, which contains a Suikoden III save', async () => {
    const ps3SaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(PS3_SUIKODEN_III_FILENAME);
    // const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_SUIKODEN_III_FILENAME);

    const ps3SaveFiles = [
      {
        filename: PS3_SUIKODEN_III_BASE_FILENAME,
        rawData: ps3SaveArrayBuffer,
      },
    ];

    const ps3SaveData = Ps3SaveData.createFromPs3SaveFiles(ps3SaveFiles);

    expect(ps3SaveData.getSaveFiles().length).to.equal(1);
    expect(ps3SaveData.getPs3SaveFiles().length).to.equal(1);

    // expect(ArrayBufferUtil.arrayBuffersEqual(ps3SaveData.getMemoryCard().getArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  /*
  it('should convert a PS1 file to PS3 file, which contains a Suikoden 2 save', async () => {
    const ps1SaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_SUIKODEN_2_FILENAME);
    const ps3SaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(PS3_SUIKODEN_2_FILENAME);

    const ps1SaveFiles = [
      {
        filename: RAW_SUIKODEN_2_BASE_FILENAME,
        rawData: ps1SaveArrayBuffer,
      },
    ];

    const ps3SaveData = Ps3SaveData.createFromPs1SaveFiles(ps1SaveFiles);

    expect(ps3SaveData.getSaveFiles().length).to.equal(1);
    expect(ps3SaveData.getPs3SaveFiles().length).to.equal(1);

    expect(ArrayBufferUtil.arrayBuffersEqual(ps3SaveData.getPs3SaveFiles()[0].rawData, ps3SaveArrayBuffer)).to.equal(true);
  });
  */
});
