// import { expect } from 'chai';
import PspSaveData from '@/save-formats/PSP/Savefile';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/psp';

const DECRYPTION_KEY = Buffer.from('CAFEBABE', 'hex');
const DECRYPTION_IV = Buffer.from('CAFED00D', 'hex');

const ENCRYPTED_FILENAME = `${DIR}/DRACULA.BIN`;
const UNENCRYPTED_FILENAME = `${DIR}/DRACULA-unencrypted.BIN`;

describe('PSP save decryption', () => {
  it('should decrypt an encrypted PSP save file', async () => {
    const encryptedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ENCRYPTED_FILENAME);
    // const unencryptedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(UNENCRYPTED_FILENAME);

    const pspSaveData = PspSaveData.createFromEncryptedData(encryptedArrayBuffer, DECRYPTION_KEY, DECRYPTION_IV);

    ArrayBufferUtil.writeArrayBuffer(UNENCRYPTED_FILENAME, pspSaveData.getUnencryptedArrayBuffer());

    // expect(ArrayBufferUtil.arrayBuffersEqual(pspSaveData.getUnencryptedArrayBuffer(), unencryptedArrayBuffer)).to.equal(true);
  });
});
