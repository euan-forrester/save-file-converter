/* eslint-disable no-param-reassign */

import { expect } from 'chai';
import Util from '@/util/util';

const SOURCE_ARRAY_BUFFER_SIZE = 32;
const DESTINATION_ARRAY_BUFFER_SIZE = 64;
const SOURCE_DATA_VALUE = 0x12; // Represents actual data in our source ArrayBuffer
const DESTINATION_DATA_VALUE = 0xAB; // Represents actual data in our destination ArrayBuffer
const HEADER_VALUE = 0xCD; // Represents data in our "header"
const FOOTER_VALUE = 0xEF; // Represents data in our "footer"
const HEADER_LENGTH = 16;
const FOOTER_LENGTH = 24;

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

  it('should copy a header from one array buffer and prepend it to the other', () => {
    const sourceArrayBuffer = new ArrayBuffer(SOURCE_ARRAY_BUFFER_SIZE + HEADER_LENGTH);
    const sourceUint8Array = new Uint8Array(sourceArrayBuffer);
    sourceUint8Array.forEach((e, i, a) => {
      if (i < HEADER_LENGTH) {
        a[i] = HEADER_VALUE;
      } else {
        a[i] = SOURCE_DATA_VALUE;
      }
    });
    const destinationArrayBuffer = new ArrayBuffer(DESTINATION_ARRAY_BUFFER_SIZE);
    const destinationUint8Array = new Uint8Array(destinationArrayBuffer);
    destinationUint8Array.forEach((e, i, a) => {
      a[i] = DESTINATION_DATA_VALUE;
    });

    const outputArrayBuffer = Util.copyHeaderFromArrayBuffer(sourceArrayBuffer, HEADER_LENGTH, destinationArrayBuffer);
    const outputUint8Array = new Uint8Array(outputArrayBuffer);

    expect(outputUint8Array.length).to.equal(DESTINATION_ARRAY_BUFFER_SIZE + HEADER_LENGTH);
    outputUint8Array.forEach((e, i, a) => {
      if (i < HEADER_LENGTH) {
        expect(a[i]).to.equal(HEADER_VALUE, `header index ${i}`);
      } else {
        expect(a[i]).to.equal(DESTINATION_DATA_VALUE, `data index ${i}`);
      }
    });
  });

  it('should copy a footer from one array buffer and append it to the other', () => {
    const sourceArrayBuffer = new ArrayBuffer(SOURCE_ARRAY_BUFFER_SIZE + FOOTER_LENGTH);
    const sourceUint8Array = new Uint8Array(sourceArrayBuffer);
    sourceUint8Array.forEach((e, i, a) => {
      if (i < SOURCE_ARRAY_BUFFER_SIZE) {
        a[i] = SOURCE_DATA_VALUE;
      } else {
        a[i] = FOOTER_VALUE;
      }
    });
    const destinationArrayBuffer = new ArrayBuffer(DESTINATION_ARRAY_BUFFER_SIZE);
    const destinationUint8Array = new Uint8Array(destinationArrayBuffer);
    destinationUint8Array.forEach((e, i, a) => {
      a[i] = DESTINATION_DATA_VALUE;
    });

    const outputArrayBuffer = Util.copyFooterFromArrayBuffer(sourceArrayBuffer, FOOTER_LENGTH, destinationArrayBuffer);
    const outputUint8Array = new Uint8Array(outputArrayBuffer);

    expect(outputUint8Array.length).to.equal(DESTINATION_ARRAY_BUFFER_SIZE + FOOTER_LENGTH);
    outputUint8Array.forEach((e, i, a) => {
      if (i < DESTINATION_ARRAY_BUFFER_SIZE) {
        expect(a[i]).to.equal(DESTINATION_DATA_VALUE, `data index ${i}`);
      } else {
        expect(a[i]).to.equal(FOOTER_VALUE, `footer index ${i}`);
      }
    });
  });
});
