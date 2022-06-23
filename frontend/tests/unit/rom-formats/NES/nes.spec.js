import { expect } from 'chai';
import NesRom from '@/rom-formats/nes';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/rom-formats/data/nes';

const INES_FILENAME = `${DIR}/Zelda II - Header.nes`; // Not a real ROM file (!), just the parts in the header that we read

describe('NES ROM format', () => {
  it('should parse an iNES headered ROM', async () => {
    const romArrayBuffer = await ArrayBufferUtil.readArrayBuffer(INES_FILENAME);

    const nesRom = new NesRom(romArrayBuffer);

    expect(nesRom.getIsNes20Header()).to.equal(false);
  });
});
