import { expect } from 'chai';
import PspSaveData from '@/save-formats/PSP/Savefile';
import Util from '@/util/util';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/psp';

const PSP_ENCRYPTION_WASM_BUILD_MDOE = 'release'; // For some reason, the outputted encrypted files are different if the psp-encryption lib is built in debug or release, but the results are still deterministic within those build modes
const KIRK_INIT_SEED = 0x12345678;

const GAME_KEY = Buffer.from('01020304050607080900010203040506', 'hex'); // Apparently Castlevania: Dracula X Chronicles uses a super sekret encryption key for its save data

const ENCRYPTED_FILENAME = `${DIR}/DRACULA.BIN`;
const PARAM_SFO_FILENAME = `${DIR}/DRACULA-PARAM.SFO`;

const UNENCRYPTED_FILENAME = `${DIR}/DRACULA-unencrypted.BIN`;

const REENCRYPTED_FILENAME = {
  debug: `${DIR}/DRACULA-reencrypted-debug.BIN`,
  release: `${DIR}/DRACULA-reencrypted-release.BIN`,
};
const REENCRYPTED_PARAM_SFO_FILENAME = {
  debug: `${DIR}/DRACULA-PARAM-reencrypted-debug.SFO`,
  release: `${DIR}/DRACULA-PARAM-reencrypted-release.SFO`,
};

describe('PSP save decryption', () => {
  before(async () => {
    await PspSaveData.init(KIRK_INIT_SEED); // Load in the wasm file and initialize the kirk engine deterministically (so that the encryption results aren't random)
  });

  it('should decrypt an encrypted PSP save file', async () => {
    const encryptedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ENCRYPTED_FILENAME);
    const unencryptedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(UNENCRYPTED_FILENAME);

    const pspSaveData = PspSaveData.createFromEncryptedData(encryptedArrayBuffer, GAME_KEY);

    expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getUnencryptedArrayBuffer(), unencryptedArrayBuffer)).to.equal(true);
  });

  it('should encrypt an unencrypted PSP save file', async () => {
    // Note that the 2 files get re-encrypted to different contents than the originally-encrypted files.
    // The new contents are deterministic though, due to how we initialized PspSaveData above.

    const unencryptedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(UNENCRYPTED_FILENAME);
    const paramSfoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(PARAM_SFO_FILENAME);

    const reencryptedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(REENCRYPTED_FILENAME[PSP_ENCRYPTION_WASM_BUILD_MDOE]);
    const reencryptedParamSfoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(REENCRYPTED_PARAM_SFO_FILENAME[PSP_ENCRYPTION_WASM_BUILD_MDOE]);

    const encryptedFilename = Util.getFilename(ENCRYPTED_FILENAME);

    const pspSaveData = PspSaveData.createFromUnencryptedData(unencryptedArrayBuffer, encryptedFilename, paramSfoArrayBuffer, GAME_KEY);

    expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getEncryptedArrayBuffer(), reencryptedArrayBuffer)).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getParamSfoArrayBuffer(), reencryptedParamSfoArrayBuffer)).to.equal(true);
  });

  it('should decrypt a re-encrypted PSP save file to get the same data', async () => {
    // Note that the 2 files get re-encrypted to different contents than the originally-encrypted files.
    // The new contents are deterministic though, due to how we initialized PspSaveData above.

    const unencryptedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(UNENCRYPTED_FILENAME);
    const paramSfoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(PARAM_SFO_FILENAME);

    const encryptedFilename = Util.getFilename(ENCRYPTED_FILENAME);

    const pspEncryptedSaveData = PspSaveData.createFromUnencryptedData(unencryptedArrayBuffer, encryptedFilename, paramSfoArrayBuffer, GAME_KEY);

    const pspRedecryptedSaveData = PspSaveData.createFromEncryptedData(pspEncryptedSaveData.getEncryptedArrayBuffer(), GAME_KEY);

    expect(ArrayBufferUtil.arrayBuffersEqual(pspRedecryptedSaveData.getUnencryptedArrayBuffer(), unencryptedArrayBuffer)).to.equal(true);
  });
});
