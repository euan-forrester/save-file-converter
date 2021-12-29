import { expect } from 'chai';
import PspSaveData from '@/save-formats/PSP/Savefile';
import Util from '@/util/util';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/psp';

const GAME_KEY = Buffer.from('01020304050607080900010203040506', 'hex'); // Apparently Castlevania: Dracula X Chronicles uses a super sekret encryption key for its save data

const ENCRYPTED_FILENAME = `${DIR}/DRACULA.BIN`;
const PARAM_SFO_FILENAME = `${DIR}/DRACULA-PARAM.SFO`;
const UNENCRYPTED_FILENAME = `${DIR}/DRACULA-unencrypted.BIN`;

describe('PSP save decryption', () => {
  before(async () => {
    await PspSaveData.init(); // Load in the wasm file and initialize the kirk engine
  });

  it('should decrypt an encrypted PSP save file', async () => {
    const encryptedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ENCRYPTED_FILENAME);
    const unencryptedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(UNENCRYPTED_FILENAME);

    const pspSaveData = PspSaveData.createFromEncryptedData(encryptedArrayBuffer, GAME_KEY);

    expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getUnencryptedArrayBuffer(), unencryptedArrayBuffer)).to.equal(true);
  });

  it('should encrypt an unencrypted PSP save file', async () => {
    const unencryptedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(UNENCRYPTED_FILENAME);
    const paramSfoArrayBuffer = await ArrayBufferUtil.readArrayBuffer(PARAM_SFO_FILENAME);

    const encryptedFilename = Util.getFilename(ENCRYPTED_FILENAME);

    const pspSaveData = PspSaveData.createFromUnencryptedData(unencryptedArrayBuffer, encryptedFilename, paramSfoArrayBuffer, GAME_KEY);

    // The encrypted data + hashes in PARAM.SFO are nondeterministic, so we can't tell directly if we managed to encrypt it correctly.
    // See kirk_init(): stuff is initialized based on current time + some fixed buffers. Unsure how to override time() in C++.
    // We can decrypt our data again and see if we get the same data we started with

    const pspSaveData2 = PspSaveData.createFromEncryptedData(pspSaveData.getEncryptedArrayBuffer(), GAME_KEY);

    expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getUnencryptedArrayBuffer(), pspSaveData2.getUnencryptedArrayBuffer())).to.equal(true);
  });
});
