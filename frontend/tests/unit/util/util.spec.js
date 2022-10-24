import { expect } from 'chai';
import Util from '@/util/util';

describe('Util', () => {
  it('should convert a description into a filename', () => {
    // Some simple made-up strings
    expect(Util.convertDescriptionToFilename('thunderforce 3')).to.equal('thunderforce 3');
    expect(Util.convertDescriptionToFilename('Thunderforce 3')).to.equal('Thunderforce 3');
    expect(Util.convertDescriptionToFilename('THUNDERFORCE 3')).to.equal('THUNDERFORCE 3');
    expect(Util.convertDescriptionToFilename('Thunderforce 3!')).to.equal('Thunderforce 3');
    expect(Util.convertDescriptionToFilename('***Thunderforce*** 3!')).to.equal('Thunderforce 3');

    // Real descriptions from our test files, which contain special characters
    expect(Util.convertDescriptionToFilename('T2-WAREHOUSE.P')).to.equal('T2-WAREHOUSEP');
    expect(Util.convertDescriptionToFilename('T2-\'.G')).to.equal('T2-G');
    expect(Util.convertDescriptionToFilename('BK6.SRAM')).to.equal('BK6SRAM');
    expect(Util.convertDescriptionToFilename('A BUG\'S LIFE')).to.equal('A BUGS LIFE');
    expect(Util.convertDescriptionToFilename('CASTLEVANIA-2 PHOENIX 208%')).to.equal('CASTLEVANIA-2 PHOENIX 208');
    expect(Util.convertDescriptionToFilename('THPS4 CAREERー PHELIPE E RENATO')).to.equal('THPS4 CAREER PHELIPE E RENATO');
    expect(Util.convertDescriptionToFilename('SUIKODEN2-(1) LV57  31:11:33')).to.equal('SUIKODEN2-1 LV57  311133');

    // If the file is all special characters + whitespace then just return 'output'
    expect(Util.convertDescriptionToFilename('!@#$ %^&* ()')).to.equal('output');
  });
});
