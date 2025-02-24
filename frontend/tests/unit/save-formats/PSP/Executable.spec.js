import { expect } from 'chai';
import PspExecutable from '@/save-formats/PSP/Executable';
import PspEncryptionUtil from '@/save-formats/PSP/PspEncryptionUtil';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/data/rom-formats/psp';

const KIRK_INIT_SEED = 0x12345678;

const CASTLEVANIA_ENCRYPTED_EXECUTABLE_FILENAME = `${DIR}/retail/Castlevania - Dracula X Chronicles - EBOOT.BIN`;
const CASTLEVANIA_UNENCRYPTED_EXECUTABLE_FILENAME = `${DIR}/retail/Castlevania - Dracula X Chronicles - EBOOT-decrypted.BIN`;

describe('PSP executable decryption', () => {
  before(async () => {
    await PspEncryptionUtil.init(KIRK_INIT_SEED); // Load in the wasm file and initialize the kirk engine deterministically (so that the encryption results aren't random)
  });

  it('should decrypt an encrypted PSP executable', async () => {
    const encryptedExecutableFileExists = await ArrayBufferUtil.fileExists(CASTLEVANIA_ENCRYPTED_EXECUTABLE_FILENAME);
    const unencryptedExecutableFileExists = await ArrayBufferUtil.fileExists(CASTLEVANIA_UNENCRYPTED_EXECUTABLE_FILENAME);

    expect(encryptedExecutableFileExists).to.equal(unencryptedExecutableFileExists);

    if (encryptedExecutableFileExists && unencryptedExecutableFileExists) { // These files are not included in our repo for obvious reasons
      const encryptedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CASTLEVANIA_ENCRYPTED_EXECUTABLE_FILENAME);
      const unencryptedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(CASTLEVANIA_UNENCRYPTED_EXECUTABLE_FILENAME);

      const pspExecutable = PspExecutable.createFromEncryptedData(encryptedArrayBuffer);

      expect(ArrayBufferUtil.arrayBuffersEqual(pspExecutable.getUnencryptedArrayBuffer(), unencryptedArrayBuffer)).to.equal(true);
      expect(pspExecutable.getExecutableInfo().compressionAttributes).to.equal(0);
      expect(pspExecutable.getExecutableInfo().elfSize).to.equal(3697876);
      expect(pspExecutable.getExecutableInfo().pspSize).to.equal(3698224);
    }
  });
});
