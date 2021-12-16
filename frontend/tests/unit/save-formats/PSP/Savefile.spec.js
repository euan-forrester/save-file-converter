import { expect } from 'chai';
import PspSaveData from '@/save-formats/PSP/Savefile';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/psp';

const GAME_KEY = Buffer.from('01020304050607080900010203040506', 'hex');

const ENCRYPTED_FILENAME = `${DIR}/DRACULA.BIN`;
// const UNENCRYPTED_FILENAME = `${DIR}/DRACULA-unencrypted.BIN`;

describe('PSP save decryption', () => {
  it('should decrypt an encrypted PSP save file', async () => {
    const encryptedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ENCRYPTED_FILENAME);
    // const unencryptedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(UNENCRYPTED_FILENAME);

    const pspSaveData = await PspSaveData.createFromEncryptedData(encryptedArrayBuffer, GAME_KEY);

    expect(pspSaveData.getUnencryptedArrayBuffer().byteLength).to.not.equal(0);

    // ArrayBufferUtil.writeArrayBuffer(UNENCRYPTED_FILENAME, pspSaveData.getUnencryptedArrayBuffer());

    // expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getUnencryptedArrayBuffer(), unencryptedArrayBuffer)).to.equal(true);
  });
});
