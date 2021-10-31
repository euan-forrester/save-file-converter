import { expect } from 'chai';
import Crypto from '@/util/crypto';
import Util from '@/util/util';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const PLAINTEXT_STRING = 'Gargoyle\'s Quest > Demon\'s Crest, Megaman X3 > Megaman X2, Adventure of Link > Link to the Past';
const PLAINTEXT_ENCODING = 'utf8';
const ENCRYPTION_ALGORITHM = 'aes-128-cbc';
const ENCRYPTION_KEY = Buffer.from('abcdef0123456789abcdef0123456789', 'hex');
const ENCRYPTION_INITIALIZATION_VECTOR = Buffer.from('9876543210fedcba9876543210fedcba', 'hex');

describe('util', () => {
  it('should encrypt then decrypt the same data', () => {
    const textEncoder = new TextEncoder(PLAINTEXT_ENCODING);
    const plaintextArrayBuffer = Util.bufferToArrayBuffer(textEncoder.encode(PLAINTEXT_STRING));

    const encryptedArrayBuffer = Crypto.encrypt(Crypto.addPkcsPadding(plaintextArrayBuffer), ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, ENCRYPTION_INITIALIZATION_VECTOR);

    expect(ArrayBufferUtil.arrayBuffersEqual(plaintextArrayBuffer, encryptedArrayBuffer)).to.equal(false);

    const decryptedArrayBuffer = Crypto.removePkcsPadding(Crypto.decrypt(encryptedArrayBuffer, ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, ENCRYPTION_INITIALIZATION_VECTOR));

    expect(ArrayBufferUtil.arrayBuffersEqual(decryptedArrayBuffer, plaintextArrayBuffer)).to.equal(true);

    const textDecoder = new TextDecoder(PLAINTEXT_ENCODING);
    const decryptedBuffer = Buffer.from(decryptedArrayBuffer);
    const decryptedText = textDecoder.decode(decryptedBuffer);

    expect(decryptedText).to.equal(PLAINTEXT_STRING);
  });
});
