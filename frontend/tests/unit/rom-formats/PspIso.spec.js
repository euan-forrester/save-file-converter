import { expect } from 'chai';
import PspIso from '@/rom-formats/PspIso';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const TIMEOUT_MS = 20000; // Need to load in some large files

const DIR = './tests/unit/rom-formats/data/psp';

const TEST_RETAIL_ISOS = true; // They're large files and so take several seconds to load

const CASTLEVANIA_ISO_FILENAME = `${DIR}/retail/Castlevania - Dracula X Chronicles.ISO`;
const CASTLEVANIA_EXECUTABLE_FILENAME = `${DIR}/retail/Castlevania - Dracula X Chronicles - EBOOT.BIN`;
const CASTLEVANIA_GAME_ID = 'ULUS10277';

describe('PSP ISO parsing', function () { // eslint-disable-line func-names
  this.timeout(TIMEOUT_MS); // Can't use arrow function above if referencing 'this' here

  it('should find an encrypted executable in the Castlevania ISO', async () => {
    const isoFileExists = await ArrayBufferUtil.fileExists(CASTLEVANIA_ISO_FILENAME);
    const executableFileExists = await ArrayBufferUtil.fileExists(CASTLEVANIA_EXECUTABLE_FILENAME);

    expect(isoFileExists).to.equal(executableFileExists);

    if (isoFileExists && executableFileExists && TEST_RETAIL_ISOS) {
      const isoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CASTLEVANIA_ISO_FILENAME);
      const executableArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CASTLEVANIA_EXECUTABLE_FILENAME);

      const pspIso = await PspIso.Create(isoArrayBuffer, 'Castlevania');

      expect(pspIso.getExecutableInfo().gameId).to.equal(CASTLEVANIA_GAME_ID);
      expect(pspIso.getExecutableInfo().path).to.equal('/PSP_GAME/SYSDIR/EBOOT.BIN');
      expect(pspIso.getExecutableInfo().encrypted).to.equal(true);
      expect(ArrayBufferUtil.arrayBuffersEqual(pspIso.getExecutableInfo().arrayBuffer, executableArrayBuffer)).to.equal(true);
    }
  });
});
