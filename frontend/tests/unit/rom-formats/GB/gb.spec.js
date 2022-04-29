import { expect } from 'chai';
import GbRom from '@/rom-formats/gb';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/rom-formats/data/gb';

const GB_FILENAME = `${DIR}/Zelda - Link's Awakening header.gb`; // Not a real ROM file (!), just the parts in the header that we read
const GBC_FILENAME = `${DIR}/Wario Land 3 header.gbc`; // Not a real ROM file (!), just the parts in the header that we read

describe('GB/GBC ROM format', () => {
  it('should parse a GB ROM', async () => {
    const romArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GB_FILENAME);

    const gbRom = new GbRom(romArrayBuffer);

    expect(gbRom.getInternalName()).to.equal('ZELDA');
    expect(gbRom.getIsGbc()).to.equal(false);
  });

  it('should parse a GBC ROM', async () => {
    const romArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GBC_FILENAME);

    const gbRom = new GbRom(romArrayBuffer);

    expect(gbRom.getInternalName()).to.equal('WARIOLAND3');
    expect(gbRom.getIsGbc()).to.equal(true);
  });
});
