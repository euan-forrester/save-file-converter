import { expect } from 'chai';
import { readFile } from 'fs/promises';
import Troubleshooting from '@/util/Troubleshooting';

async function readArrayBuffer(filename) {
  const b = await readFile(filename); // returns a Node Buffer object
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); // https://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer/31394257#31394257
}

function arrayBuffersEqual(ab1, ab2) {
  if (ab1.byteLength !== ab2.byteLength) {
    return false;
  }

  const u81 = new Uint8Array(ab1);
  const u82 = new Uint8Array(ab2);

  for (let i = 0; i < ab1.byteLength; i += 1) {
    if (u81[i] !== u82[i]) {
      return false;
    }
  }

  return true;
}

describe('Troubleshooting example files', () => {
  it('should fix a file with padding at the start', async () => {
    const brokenSaveData = await readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan).srm');
    const testSaveData = await readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan) fixed.srm');
    const correctSaveData = await readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan) fixed.srm');

    const fixedData = Troubleshooting.attemptFix(testSaveData, brokenSaveData);

    expect(arrayBuffersEqual(fixedData, correctSaveData)).to.equal(true);
  });

  it('should add padding to the start of a file to fix it', async () => {
    const brokenSaveData = await readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan) fixed.srm');
    const testSaveData = await readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan).srm');
    const correctSaveData = await readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan).srm');

    const fixedData = Troubleshooting.attemptFix(testSaveData, brokenSaveData);

    expect(arrayBuffersEqual(fixedData, correctSaveData)).to.equal(true);
  });

  it('should be able to use a test save that\'s all padding', async () => {
    const brokenSaveData = await readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan).srm');
    const testSaveData = await readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan) test save all padding.srm');
    const correctSaveData = await readArrayBuffer('./tests/unit/util/data/Tomato Adventure (Japan) fixed.srm');

    const fixedData = Troubleshooting.attemptFix(testSaveData, brokenSaveData);

    expect(arrayBuffersEqual(fixedData, correctSaveData)).to.equal(true);
  });
});
