import { expect } from 'chai';
import GbRom from '@/rom-formats/gb';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/data/rom-formats/gb';

const GB_FILENAME = `${DIR}/Zelda - Link's Awakening header.gb`; // Not a real ROM file (!), just the parts in the header that we read
const GBC_FILENAME = `${DIR}/Wario Land 3 header.gbc`; // Not a real ROM file (!), just the parts in the header that we read

describe('GB/GBC ROM format', () => {
  it('should parse a GB ROM', async () => {
    const romArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GB_FILENAME);

    const gbRom = new GbRom(romArrayBuffer);

    expect(gbRom.getInternalName()).to.equal('ZELDA');
    expect(gbRom.getIsGbc()).to.equal(false);
    expect(gbRom.getCartridgeType()).to.equal(0x3);
    expect(gbRom.getSramSize()).to.equal(8192);
  });

  it('should parse a GBC ROM', async () => {
    const romArrayBuffer = await ArrayBufferUtil.readArrayBuffer(GBC_FILENAME);

    const gbRom = new GbRom(romArrayBuffer);

    expect(gbRom.getInternalName()).to.equal('WARIOLAND3');
    expect(gbRom.getIsGbc()).to.equal(true);
    expect(gbRom.getCartridgeType()).to.equal(0x1B);
    expect(gbRom.getSramSize()).to.equal(32768);
  });
});
