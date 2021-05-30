import { expect } from 'chai';
import Troubleshooting from '@/util/Troubleshooting';

import ArrayBufferUtil from '#/util/ArrayBuffer';

/*
  Files:

  - Tomato Adventure (Japan).srm: Original broken file from a user, which has 128k of padding then 8k of data
  - Tomato Adventure (Japan) fixed.srm: Corrected version of the above file: the padding is removed and 8k of data remains
  - Tomato Adventure (Japan) test save all padding.srm: Test save for this game from an emulator, but game wasn't saved yet so file is all padding but is correct size (8k)
  - Tomato Adventure (Japan) extra padding at end.srm: The original file but with an extra 8k of padding added to the end
  - Tomato Adventure (Japan) fixed extra padding at end.srm: Corrected version of the original file, but with 8k of padding added to the end
*/

describe('Troubleshooting example files', () => {
  it('should remove padding from the start', async () => {
    const brokenSaveData = await ArrayBufferUtil.readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan).srm');
    const testSaveData = await ArrayBufferUtil.readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan) fixed.srm');
    const correctSaveData = await ArrayBufferUtil.readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan) fixed.srm');

    const fixedData = Troubleshooting.attemptFix(testSaveData, brokenSaveData);

    expect(ArrayBufferUtil.arrayBuffersEqual(fixedData, correctSaveData)).to.equal(true);
  });

  it('should add padding to the start', async () => {
    const brokenSaveData = await ArrayBufferUtil.readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan) fixed.srm');
    const testSaveData = await ArrayBufferUtil.readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan).srm');
    const correctSaveData = await ArrayBufferUtil.readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan).srm');

    const fixedData = Troubleshooting.attemptFix(testSaveData, brokenSaveData);

    expect(ArrayBufferUtil.arrayBuffersEqual(fixedData, correctSaveData)).to.equal(true);
  });

  it('should remove padding at the the start and end', async () => {
    const brokenSaveData = await ArrayBufferUtil.readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan) extra padding at end.srm');
    const testSaveData = await ArrayBufferUtil.readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan) fixed.srm');
    const correctSaveData = await ArrayBufferUtil.readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan) fixed.srm');

    const fixedData = Troubleshooting.attemptFix(testSaveData, brokenSaveData);

    expect(ArrayBufferUtil.arrayBuffersEqual(fixedData, correctSaveData)).to.equal(true);
  });

  it('should add padding to the end', async () => {
    const brokenSaveData = await ArrayBufferUtil.readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan).srm');
    const testSaveData = await ArrayBufferUtil.readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan) fixed extra padding at end.srm');
    const correctSaveData = await ArrayBufferUtil.readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan) fixed extra padding at end.srm');

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
