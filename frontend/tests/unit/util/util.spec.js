import { expect } from 'chai';
import Util from '@/util/util';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const PLAINTEXT_STRING = 'Gargoyle\'s Quest > Demon\'s Crest, Megaman X3 > Megaman X2, Adventure of Link > Link to the Past';
const PLAINTEXT_ENCODING = 'utf8';
const ENCRYPTION_ALGORITHM = 'aes-128-cbc';
const ENCRYPTION_KEY = 'ab01b9d8e1622b08afbad84dbfc2a55d';
const ENCRYPTION_INITIALIZATION_VECTOR = '216712e6aa1f689f95c5a22324dc6a98';

describe('util', () => {
  it('should encrypt then decrypt the same data', () => {
    const textEncoder = new TextEncoder(PLAINTEXT_ENCODING);
    const plaintextArrayBuffer = Util.bufferToArrayBuffer(textEncoder.encode(PLAINTEXT_STRING));

    const encryptedArrayBuffer = Util.encrypt(plaintextArrayBuffer, ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, ENCRYPTION_INITIALIZATION_VECTOR);
    const decryptedArrayBuffer = Util.decrypt(encryptedArrayBuffer, ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, ENCRYPTION_INITIALIZATION_VECTOR);

    expect(ArrayBufferUtil.arrayBuffersEqual(decryptedArrayBuffer, plaintextArrayBuffer)).to.equal(true);

    const textDecoder = new TextDecoder(PLAINTEXT_ENCODING);
    const decryptedBuffer = Buffer.from(decryptedArrayBuffer);
    const decryptedText = textDecoder.decode(decryptedBuffer);

    expect(decryptedText).to.equal(PLAINTEXT_STRING);
  });
});
