import { expect } from 'chai';
import GbRom from '@/rom-formats/gb';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/rom-formats/data/gb';

const FILENAME = `${DIR}/Zelda - Link's Awakening header.gb`; // Not a real ROM file (!), just the parts in the header that we read

describe('GB ROM format', () => {
  it('should parse a GB ROM', async () => {
    const romArrayBuffer = await ArrayBufferUtil.readArrayBuffer(FILENAME);

    const gbRom = new GbRom(romArrayBuffer);

    expect(gbRom.getInternalName()).to.equal('ZELDA');
  });
});
