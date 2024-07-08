import { expect } from 'chai';
import CompressionLzo from '@/util/CompressionLzo';
import Util from '@/util/util';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const PLAINTEXT_STRING = 'I DRINK TO PREPARE FOR A FIGHT. TONIGHT I AM VERY PREPARED!';
const PLAINTEXT_ENCODING = 'utf8';

describe('CompressionLzo', () => {
  it('should compress and then decompress data', () => {
    const textEncoder = new TextEncoder(PLAINTEXT_ENCODING);
    const initialArrayBuffer = Util.bufferToArrayBuffer(textEncoder.encode(PLAINTEXT_STRING));

    const compressedArrayBuffer = CompressionLzo.compress(initialArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(initialArrayBuffer, compressedArrayBuffer)).to.equal(false);

    const uncompressedArrayBuffer = CompressionLzo.decompress(compressedArrayBuffer, initialArrayBuffer.byteLength);

    expect(ArrayBufferUtil.arrayBuffersEqual(uncompressedArrayBuffer, initialArrayBuffer)).to.equal(true);

    const textDecoder = new TextDecoder(PLAINTEXT_ENCODING);
    const decryptedBuffer = Buffer.from(uncompressedArrayBuffer);
    const decryptedText = textDecoder.decode(decryptedBuffer);

    expect(decryptedText).to.equal(PLAINTEXT_STRING);
  });

  it('should fail to decompress data not in the correct format', () => {
    const textEncoder = new TextEncoder(PLAINTEXT_ENCODING);
    const initialArrayBuffer = Util.bufferToArrayBuffer(textEncoder.encode(PLAINTEXT_STRING));

    expect(() => CompressionLzo.decompress(initialArrayBuffer)).to.throw(
      // Passing in a specific instance of an Error triggers a comparison of the references: https://github.com/chaijs/chai/issues/430
      Error,
      'Encountered error -4 when trying to decompress LZO buffer',
    );
  });
});
