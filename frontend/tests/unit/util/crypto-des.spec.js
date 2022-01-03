import { expect } from 'chai';
import CryptoDes from '@/util/crypto-des';
import Util from '@/util/util';
import ArrayBufferUtil from '#/util/ArrayBuffer';
import CryptoUtil from '#/util/Crypto';

const PLAINTEXT_STRING = 'Mega Man > Mega Man Powered Up, Mega Man X > Mega Man Maverick Hunter X, Need for Speed: Underground > Need for Speed: Underground Rivals';
const PLAINTEXT_ENCODING = 'utf8';
const ENCRYPTION_ALGORITHM = 'des-cbc';
const ENCRYPTION_KEY = Buffer.from('abcdef0123456789', 'hex');
const ENCRYPTION_INITIALIZATION_VECTOR = Buffer.from('9876543210fedcba', 'hex');

describe('crypto-des', () => {
  it('should encrypt then decrypt the same data', () => {
    const textEncoder = new TextEncoder(PLAINTEXT_ENCODING);
    const plaintextArrayBuffer = Util.bufferToArrayBuffer(textEncoder.encode(PLAINTEXT_STRING));

    const encryptedArrayBuffer = CryptoDes.encrypt(CryptoUtil.addPkcsPadding(plaintextArrayBuffer), ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, ENCRYPTION_INITIALIZATION_VECTOR);

    expect(ArrayBufferUtil.arrayBuffersEqual(plaintextArrayBuffer, encryptedArrayBuffer)).to.equal(false);

    const decryptedArrayBuffer = CryptoUtil.removePkcsPadding(CryptoDes.decrypt(encryptedArrayBuffer, ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, ENCRYPTION_INITIALIZATION_VECTOR));

    expect(ArrayBufferUtil.arrayBuffersEqual(decryptedArrayBuffer, plaintextArrayBuffer)).to.equal(true);

    const textDecoder = new TextDecoder(PLAINTEXT_ENCODING);
    const decryptedBuffer = Buffer.from(decryptedArrayBuffer);
    const decryptedText = textDecoder.decode(decryptedBuffer);

    expect(decryptedText).to.equal(PLAINTEXT_STRING);
  });
});
