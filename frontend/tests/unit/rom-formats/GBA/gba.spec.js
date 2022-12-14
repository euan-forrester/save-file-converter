import { expect } from 'chai';
import GbaRom from '@/rom-formats/gba';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/data/rom-formats/gba';

const FILENAME = `${DIR}/Zelda - Minish Cap header.gba`; // Not a real ROM file (!), just the parts in the header that we read

describe('GBA ROM format', () => {
  it('should parse a GBA ROM', async () => {
    const romArrayBuffer = await ArrayBufferUtil.readArrayBuffer(FILENAME);

    const gbaRom = new GbaRom(romArrayBuffer);

    expect(gbaRom.getInternalName()).to.equal('GBAZELDA MC\u0000BZME');
    expect(gbaRom.getChecksum()).to.equal(0);
    expect(gbaRom.getComplimentCheck()).to.equal(216);
    expect(gbaRom.getMaker()).to.equal(48);
  });
});
