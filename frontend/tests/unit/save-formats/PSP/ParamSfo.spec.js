import { expect } from 'chai';
import PspParamSfo from '@/save-formats/PSP/ParamSfo';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/data/save-formats/psp';

const PARAM_SFO_FILENAME = `${DIR}/PARAM.SFO`;

describe('PSP PARAM.SFO', () => {
  it('should parse a PARAM.SFO file', async () => {
    const paramSfoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(PARAM_SFO_FILENAME);

    const pspParamSfo = new PspParamSfo(paramSfoArrayBuffer);

    expect(pspParamSfo.getValue('BOOTABLE')).to.equal(1);
    expect(pspParamSfo.getValue('CATEGORY')).to.equal('UG');
    expect(pspParamSfo.getValue('DISC_ID')).to.equal('ULUS12345');
    expect(pspParamSfo.getValue('DISC_NUMBER')).to.equal(1);
    expect(pspParamSfo.getValue('DISC_TOTAL')).to.equal(1);
    expect(pspParamSfo.getValue('DISC_VERSION')).to.equal('1.02');
    expect(pspParamSfo.getValue('PARENTAL_LEVEL')).to.equal(5);
    expect(pspParamSfo.getValue('PSP_SYSTEM_VER')).to.equal('3.52');
    expect(pspParamSfo.getValue('REGION')).to.equal(32768);
    expect(pspParamSfo.getValue('TITLE')).to.equal('Test game');
  });
});
