import { expect } from 'chai';
import Ps3SaveData from '@/save-formats/PS1/Ps3';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/ps1/ps3';

const PS3_STREET_FIGHTER_EX2_PLUS_FILENAME = `${DIR}/BASLUS-011054441544131.PSV`;
const PS3_STREET_FIGHTER_EX2_PLUS_BASE_FILENAME = PS3_STREET_FIGHTER_EX2_PLUS_FILENAME.substr(-26, 22);
const RAW_STREET_FIGHTER_EX2_PLUS_FILENAME = `${DIR}/street-fighter-ex2-plus.17422.mcr`;

describe('PS1 - PS3 save format', () => {
  it('should convert a PS3 file containing a Street Fighter EX2 Plus save', async () => {
    const ps3SaveArrayBuffer = await ArrayBufferUtil.readArrayBuffer(PS3_STREET_FIGHTER_EX2_PLUS_FILENAME);
    // const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_STREET_FIGHTER_EX2_PLUS);

    const ps3SaveFiles = [
      {
        filename: PS3_STREET_FIGHTER_EX2_PLUS_BASE_FILENAME,
        rawData: ps3SaveArrayBuffer,
      },
    ];

    const ps3SaveData = Ps3SaveData.createFromPS3SaveFiles(ps3SaveFiles);

    ArrayBufferUtil.writeArrayBuffer(RAW_STREET_FIGHTER_EX2_PLUS_FILENAME, ps3SaveData.getMemoryCard().getArrayBuffer());
  });
});
