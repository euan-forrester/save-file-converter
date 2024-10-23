import { expect } from 'chai';
import CompressionZLib from '@/util/CompressionZlib';
import Util from '@/util/util';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const PLAINTEXT_STRING = 'I\'LL GIVE YOU A TKO FROM TOKYO!';
const PLAINTEXT_ENCODING = 'utf8';

describe('CompressionZlib', () => {
  it('should compress and then decompress data', () => {
    const textEncoder = new TextEncoder(PLAINTEXT_ENCODING);
    const initialArrayBuffer = Util.bufferToArrayBuffer(textEncoder.encode(PLAINTEXT_STRING));

    const compressedArrayBuffer = CompressionZLib.compress(initialArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(initialArrayBuffer, compressedArrayBuffer)).to.equal(false);

    const uncompressedArrayBuffer = CompressionZLib.decompress(compressedArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(uncompressedArrayBuffer, initialArrayBuffer)).to.equal(true);

    const textDecoder = new TextDecoder(PLAINTEXT_ENCODING);
    const decryptedBuffer = Buffer.from(uncompressedArrayBuffer);
    const decryptedText = textDecoder.decode(decryptedBuffer);

    expect(decryptedText).to.equal(PLAINTEXT_STRING);
  });

  it('should fail to decompress data not in the correct format', () => {
    const textEncoder = new TextEncoder(PLAINTEXT_ENCODING);
    const initialArrayBuffer = Util.bufferToArrayBuffer(textEncoder.encode(PLAINTEXT_STRING));

    expect(() => CompressionZLib.decompress(initialArrayBuffer)).to.throw(
      // Passing in a specific instance of an Error triggers a comparison of the references: https://github.com/chaijs/chai/issues/430
      Error,
      'Could not decompress the data using zlib',
    );
  });
});
