import { expect } from 'chai';
import PspIso from '@/rom-formats/PspIso';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const TEST_RETAIL_ISOS = true; // They're large files and so take several seconds to load

const TIMEOUT_MS = 20000; // Need to load in some large files

const DIR = './tests/unit/rom-formats/data/psp';

const CASTLEVANIA_ISO_FILENAME = `${DIR}/retail/Castlevania - Dracula X Chronicles.ISO`;
const CASTLEVANIA_EXECUTABLE_FILENAME = `${DIR}/retail/Castlevania - Dracula X Chronicles - EBOOT.BIN`;
const CASTLEVANIA_EXECUTABLE_PATH = '/PSP_GAME/SYSDIR/EBOOT.BIN';
const CASTLEVANIA_GAME_ID = 'ULUS10277';

const ENCRYPTED_EXECUTABLE_MAGIC0_ISO = `${DIR}/encrypted-executable-magic0.iso`;
const ENCRYPTED_EXECUTABLE_MAGIC0 = `${DIR}/encrypted-executable-magic0 - EBOOT.BIN`;
const ENCRYPTED_EXECUTABLE_MAGIC0_EXECUTABLE_PATH = '/PSP_GAME/SYSDIR/EBOOT.BIN';
const ENCRYPTED_EXECUTABLE_MAGIC0_GAME_ID = 'ULUS12345';

const ENCRYPTED_EXECUTABLE_MAGIC1_ISO = `${DIR}/encrypted-executable-magic1.iso`;
const ENCRYPTED_EXECUTABLE_MAGIC1 = `${DIR}/encrypted-executable-magic1 - EBOOT.BIN`;
const ENCRYPTED_EXECUTABLE_MAGIC1_EXECUTABLE_PATH = '/PSP_GAME/SYSDIR/EBOOT.BIN';
const ENCRYPTED_EXECUTABLE_MAGIC1_GAME_ID = 'ULUS12345';

const UNENCRYPTED_EXECUTABLE_ISO = `${DIR}/unencrypted-executable.iso`;
const UNENCRYPTED_EXECUTABLE = `${DIR}/unencrypted-executable - BOOT.BIN`;
const UNENCRYPTED_EXECUTABLE_EXECUTABLE_PATH = '/PSP_GAME/SYSDIR/BOOT.BIN';
const UNENCRYPTED_EXECUTABLE_GAME_ID = 'ULUS12345';

const ENCRYPTED_EXECUTABLE_INCORRECT_MAGIC_ISO = `${DIR}/encrypted-executable-incorrect-magic.iso`;
const ENCRYPTED_EXECUTABLE_INCORRECT_MAGIC = `${DIR}/encrypted-executable-incorrect-magic - BOOT.BIN`;
const ENCRYPTED_EXECUTABLE_INCORRECT_MAGIC_EXECUTABLE_PATH = '/PSP_GAME/SYSDIR/BOOT.BIN';
const ENCRYPTED_EXECUTABLE_INCORRECT_MAGIC_GAME_ID = 'ULUS12345';

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
      expect(pspIso.getExecutableInfo().path).to.equal(CASTLEVANIA_EXECUTABLE_PATH);
      expect(pspIso.getExecutableInfo().encrypted).to.equal(true);
      expect(ArrayBufferUtil.arrayBuffersEqual(pspIso.getExecutableInfo().arrayBuffer, executableArrayBuffer)).to.equal(true);
    }
  });

  it('should find an encrypted executable matching magic 0', async () => {
    const isoFileExists = await ArrayBufferUtil.fileExists(ENCRYPTED_EXECUTABLE_MAGIC0_ISO);
    const executableFileExists = await ArrayBufferUtil.fileExists(ENCRYPTED_EXECUTABLE_MAGIC0);

    expect(isoFileExists).to.equal(executableFileExists);

    if (isoFileExists && executableFileExists) {
      const isoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ENCRYPTED_EXECUTABLE_MAGIC0_ISO);
      const executableArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ENCRYPTED_EXECUTABLE_MAGIC0);

      const pspIso = await PspIso.Create(isoArrayBuffer, 'EncryptedExecutableMagic0');

      expect(pspIso.getExecutableInfo().gameId).to.equal(ENCRYPTED_EXECUTABLE_MAGIC0_GAME_ID);
      expect(pspIso.getExecutableInfo().path).to.equal(ENCRYPTED_EXECUTABLE_MAGIC0_EXECUTABLE_PATH);
      expect(pspIso.getExecutableInfo().encrypted).to.equal(true);
      expect(ArrayBufferUtil.arrayBuffersEqual(pspIso.getExecutableInfo().arrayBuffer, executableArrayBuffer)).to.equal(true);
    }
  });

  it('should find an encrypted executable matching magic 1', async () => {
    const isoFileExists = await ArrayBufferUtil.fileExists(ENCRYPTED_EXECUTABLE_MAGIC1_ISO);
    const executableFileExists = await ArrayBufferUtil.fileExists(ENCRYPTED_EXECUTABLE_MAGIC1);

    expect(isoFileExists).to.equal(executableFileExists);

    if (isoFileExists && executableFileExists) {
      const isoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ENCRYPTED_EXECUTABLE_MAGIC1_ISO);
      const executableArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ENCRYPTED_EXECUTABLE_MAGIC1);

      const pspIso = await PspIso.Create(isoArrayBuffer, 'EncryptedExecutableMagic1');

      expect(pspIso.getExecutableInfo().gameId).to.equal(ENCRYPTED_EXECUTABLE_MAGIC1_GAME_ID);
      expect(pspIso.getExecutableInfo().path).to.equal(ENCRYPTED_EXECUTABLE_MAGIC1_EXECUTABLE_PATH);
      expect(pspIso.getExecutableInfo().encrypted).to.equal(true);
      expect(ArrayBufferUtil.arrayBuffersEqual(pspIso.getExecutableInfo().arrayBuffer, executableArrayBuffer)).to.equal(true);
    }
  });

  it('should find an unencrypted executable if there is no encrypted one', async () => {
    const isoFileExists = await ArrayBufferUtil.fileExists(UNENCRYPTED_EXECUTABLE_ISO);
    const executableFileExists = await ArrayBufferUtil.fileExists(UNENCRYPTED_EXECUTABLE);

    expect(isoFileExists).to.equal(executableFileExists);

    if (isoFileExists && executableFileExists) {
      const isoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(UNENCRYPTED_EXECUTABLE_ISO);
      const executableArrayBuffer = await ArrayBufferUtil.readArrayBuffer(UNENCRYPTED_EXECUTABLE);

      const pspIso = await PspIso.Create(isoArrayBuffer, 'EncryptedExecutableMagic1');

      expect(pspIso.getExecutableInfo().gameId).to.equal(UNENCRYPTED_EXECUTABLE_GAME_ID);
      expect(pspIso.getExecutableInfo().path).to.equal(UNENCRYPTED_EXECUTABLE_EXECUTABLE_PATH);
      expect(pspIso.getExecutableInfo().encrypted).to.equal(false);
      expect(ArrayBufferUtil.arrayBuffersEqual(pspIso.getExecutableInfo().arrayBuffer, executableArrayBuffer)).to.equal(true);
    }
  });

  it('should find an unencrypted executable if the encrypted one\'s magic doesn\'t match', async () => {
    const isoFileExists = await ArrayBufferUtil.fileExists(ENCRYPTED_EXECUTABLE_INCORRECT_MAGIC_ISO);
    const executableFileExists = await ArrayBufferUtil.fileExists(ENCRYPTED_EXECUTABLE_INCORRECT_MAGIC);

    expect(isoFileExists).to.equal(executableFileExists);

    if (isoFileExists && executableFileExists) {
      const isoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ENCRYPTED_EXECUTABLE_INCORRECT_MAGIC_ISO);
      const executableArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ENCRYPTED_EXECUTABLE_INCORRECT_MAGIC);

      const pspIso = await PspIso.Create(isoArrayBuffer, 'EncryptedExecutableMagic1');

      expect(pspIso.getExecutableInfo().gameId).to.equal(ENCRYPTED_EXECUTABLE_INCORRECT_MAGIC_GAME_ID);
      expect(pspIso.getExecutableInfo().path).to.equal(ENCRYPTED_EXECUTABLE_INCORRECT_MAGIC_EXECUTABLE_PATH);
      expect(pspIso.getExecutableInfo().encrypted).to.equal(false);
      expect(ArrayBufferUtil.arrayBuffersEqual(pspIso.getExecutableInfo().arrayBuffer, executableArrayBuffer)).to.equal(true);
    }
  });
});
