import { expect } from 'chai';
import PspExecutable from '@/save-formats/PSP/Executable';
import PspEncryptionUtil from '@/save-formats/PSP/PspEncryptionUtil';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/data/rom-formats/psp';

const TIMEOUT_MS = 40000; // Decrypting executables in debug mode is pretty slow

const KIRK_INIT_SEED = 0x12345678;

const CASTLEVANIA_ENCRYPTED_EXECUTABLE_FILENAME = `${DIR}/retail/Castlevania - Dracula X Chronicles - EBOOT.BIN`;
const CASTLEVANIA_UNENCRYPTED_EXECUTABLE_FILENAME = `${DIR}/retail/Castlevania - Dracula X Chronicles - EBOOT-decrypted.BIN`;

const FINAL_FANTASY_TACTICS_ENCRYPTED_EXECUTABLE_FILENAME = `${DIR}/retail/Final Fantasy Tactics - War of the Lions - EBOOT.BIN`;
const FINAL_FANTASY_TACTICS_UNENCRYPTED_EXECUTABLE_FILENAME = `${DIR}/retail/Final Fantasy Tactics - War of the Lions - EBOOT-decrypted.BIN`;

const MEGA_MAN_ENCRYPTED_EXECUTABLE_FILENAME = `${DIR}/retail/Mega Man Maverick Hunter X - EBOOT.BIN`;
const MEGA_MAN_UNENCRYPTED_EXECUTABLE_FILENAME = `${DIR}/retail/Mega Man Maverick Hunter X - EBOOT-decrypted.BIN`;

const NEED_FOR_SPEED_ENCRYPTED_EXECUTABLE_FILENAME = `${DIR}/retail/Need for Speed Underground Rivals - EBOOT.BIN`;
const NEED_FOR_SPEED_UNENCRYPTED_EXECUTABLE_FILENAME = `${DIR}/retail/Need for Speed Underground Rivals - EBOOT-decrypted.BIN`;

describe('PSP executable decryption', function () { // eslint-disable-line func-names, no-unused-expressions
  this.timeout(TIMEOUT_MS); // Can't use arrow function above if referencing 'this' here

  before(async () => {
    await PspEncryptionUtil.init(KIRK_INIT_SEED); // Load in the wasm file and initialize the kirk engine deterministically (so that the encryption results aren't random)
  });

  it('should decrypt an encrypted PSP executable for Castlevania', async () => {
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

  it('should decrypt an encrypted PSP executable for Final Fantasy Tactics', async () => {
    const encryptedExecutableFileExists = await ArrayBufferUtil.fileExists(FINAL_FANTASY_TACTICS_ENCRYPTED_EXECUTABLE_FILENAME);
    const unencryptedExecutableFileExists = await ArrayBufferUtil.fileExists(FINAL_FANTASY_TACTICS_UNENCRYPTED_EXECUTABLE_FILENAME);

    expect(encryptedExecutableFileExists).to.equal(unencryptedExecutableFileExists);

    if (encryptedExecutableFileExists && unencryptedExecutableFileExists) { // These files are not included in our repo for obvious reasons
      const encryptedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(FINAL_FANTASY_TACTICS_ENCRYPTED_EXECUTABLE_FILENAME);
      const unencryptedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(FINAL_FANTASY_TACTICS_UNENCRYPTED_EXECUTABLE_FILENAME);

      const pspExecutable = PspExecutable.createFromEncryptedData(encryptedArrayBuffer);

      ArrayBufferUtil.writeArrayBuffer(FINAL_FANTASY_TACTICS_UNENCRYPTED_EXECUTABLE_FILENAME, pspExecutable.getUnencryptedArrayBuffer());

      expect(ArrayBufferUtil.arrayBuffersEqual(pspExecutable.getUnencryptedArrayBuffer(), unencryptedArrayBuffer)).to.equal(true);
      expect(pspExecutable.getExecutableInfo().compressionAttributes).to.equal(2);
      expect(pspExecutable.getExecutableInfo().elfSize).to.equal(3835044);
      expect(pspExecutable.getExecutableInfo().pspSize).to.equal(3835392);
    }
  });

  it('should decrypt an encrypted PSP executable for Mega Man', async () => {
    const encryptedExecutableFileExists = await ArrayBufferUtil.fileExists(MEGA_MAN_ENCRYPTED_EXECUTABLE_FILENAME);
    const unencryptedExecutableFileExists = await ArrayBufferUtil.fileExists(MEGA_MAN_UNENCRYPTED_EXECUTABLE_FILENAME);

    expect(encryptedExecutableFileExists).to.equal(unencryptedExecutableFileExists);

    if (encryptedExecutableFileExists && unencryptedExecutableFileExists) { // These files are not included in our repo for obvious reasons
      const encryptedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_MAN_ENCRYPTED_EXECUTABLE_FILENAME);
      const unencryptedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MEGA_MAN_UNENCRYPTED_EXECUTABLE_FILENAME);

      const pspExecutable = PspExecutable.createFromEncryptedData(encryptedArrayBuffer);

      ArrayBufferUtil.writeArrayBuffer(MEGA_MAN_UNENCRYPTED_EXECUTABLE_FILENAME, pspExecutable.getUnencryptedArrayBuffer());

      expect(ArrayBufferUtil.arrayBuffersEqual(pspExecutable.getUnencryptedArrayBuffer(), unencryptedArrayBuffer)).to.equal(true);
      expect(pspExecutable.getExecutableInfo().compressionAttributes).to.equal(0);
      expect(pspExecutable.getExecutableInfo().elfSize).to.equal(2293524);
      expect(pspExecutable.getExecutableInfo().pspSize).to.equal(2293872);
    }
  });

  it('should decrypt an encrypted PSP executable for Need for Speed', async () => {
    const encryptedExecutableFileExists = await ArrayBufferUtil.fileExists(NEED_FOR_SPEED_ENCRYPTED_EXECUTABLE_FILENAME);
    const unencryptedExecutableFileExists = await ArrayBufferUtil.fileExists(NEED_FOR_SPEED_UNENCRYPTED_EXECUTABLE_FILENAME);

    expect(encryptedExecutableFileExists).to.equal(unencryptedExecutableFileExists);

    if (encryptedExecutableFileExists && unencryptedExecutableFileExists) { // These files are not included in our repo for obvious reasons
      const encryptedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NEED_FOR_SPEED_ENCRYPTED_EXECUTABLE_FILENAME);
      const unencryptedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(NEED_FOR_SPEED_UNENCRYPTED_EXECUTABLE_FILENAME);

      const pspExecutable = PspExecutable.createFromEncryptedData(encryptedArrayBuffer);

      ArrayBufferUtil.writeArrayBuffer(NEED_FOR_SPEED_UNENCRYPTED_EXECUTABLE_FILENAME, pspExecutable.getUnencryptedArrayBuffer());

      expect(ArrayBufferUtil.arrayBuffersEqual(pspExecutable.getUnencryptedArrayBuffer(), unencryptedArrayBuffer)).to.equal(true);
      expect(pspExecutable.getExecutableInfo().compressionAttributes).to.equal(0);
      expect(pspExecutable.getExecutableInfo().elfSize).to.equal(4247409);
      expect(pspExecutable.getExecutableInfo().pspSize).to.equal(4247760);
    }
  });
});
