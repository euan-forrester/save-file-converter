import { expect } from 'chai';
import PspIso from '@/rom-formats/PspIso';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const TIMEOUT_MS = 20000; // Need to load in some large files

const DIR = './tests/unit/rom-formats/data/psp';

const ISO_FILENAME = `${DIR}/Castlevania - Dracula X Chronicles.ISO`;

describe('PSP ISO parsing', function () { // eslint-disable-line func-names
  this.timeout(TIMEOUT_MS); // Can't use arrow function above if referencing 'this' here

  it('should find an encrypted executable in the Castlevania ISO', async () => {
    const isoFileExists = await ArrayBufferUtil.fileExists(ISO_FILENAME);

    if (isoFileExists) {
      const isoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ISO_FILENAME);
      const pspIso = await PspIso.Create(isoArrayBuffer, 'Castlevania');

      expect(pspIso.foundExecutable()).to.equal(true);
    }
  });
});
