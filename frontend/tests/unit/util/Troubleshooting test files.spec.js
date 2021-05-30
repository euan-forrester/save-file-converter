import { expect } from 'chai';
import Troubleshooting from '@/util/Troubleshooting';

import ArrayBufferUtil from '../../util/ArrayBuffer';

describe('Troubleshooting example files', () => {
  it('should fix a file with padding at the start', async () => {
    const brokenSaveData = await ArrayBufferUtil.readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan).srm');
    const testSaveData = await ArrayBufferUtil.readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan) fixed.srm');
    const correctSaveData = await ArrayBufferUtil.readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan) fixed.srm');

    const fixedData = Troubleshooting.attemptFix(testSaveData, brokenSaveData);

    expect(ArrayBufferUtil.arrayBuffersEqual(fixedData, correctSaveData)).to.equal(true);
  });

  it('should add padding to the start of a file to fix it', async () => {
    const brokenSaveData = await ArrayBufferUtil.readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan) fixed.srm');
    const testSaveData = await ArrayBufferUtil.readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan).srm');
    const correctSaveData = await ArrayBufferUtil.readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan).srm');

    const fixedData = Troubleshooting.attemptFix(testSaveData, brokenSaveData);

    expect(ArrayBufferUtil.arrayBuffersEqual(fixedData, correctSaveData)).to.equal(true);
  });

  it('should be able to use a test save that\'s all padding', async () => {
    const brokenSaveData = await ArrayBufferUtil.readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan).srm');
    const testSaveData = await ArrayBufferUtil.readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan) test save all padding.srm');
    const correctSaveData = await ArrayBufferUtil.readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan) fixed.srm');

    const fixedData = Troubleshooting.attemptFix(testSaveData, brokenSaveData);

    expect(ArrayBufferUtil.arrayBuffersEqual(fixedData, correctSaveData)).to.equal(true);
  });
});
