import { expect } from 'chai';
import CompressionRzip from '@/util/CompressionRzip';
import Util from '@/util/util';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const PLAINTEXT_STRING = 'I CAN\'T DRIVE, SO I\'M GONNA WALK ALL OVER YOU.';
const PLAINTEXT_ENCODING = 'utf8';

const DIR = './tests/data/util';

const COMPRESSED_FILENAME = `${DIR}/Xenogears (USA) (Disc 1)-compressed.srm`;
const UNCOMPRESSED_FILENAME = `${DIR}/Xenogears (USA) (Disc 1)-uncompressed.srm`;

describe('CompressionRzip', () => {
  it('should compress and then decompress data', () => {
    const textEncoder = new TextEncoder(PLAINTEXT_ENCODING);
    const initialArrayBuffer = Util.bufferToArrayBuffer(textEncoder.encode(PLAINTEXT_STRING));

    const compressedArrayBuffer = CompressionRzip.compress(initialArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(initialArrayBuffer, compressedArrayBuffer)).to.equal(false);

    const uncompressedArrayBuffer = CompressionRzip.decompress(compressedArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(uncompressedArrayBuffer, initialArrayBuffer)).to.equal(true);

    const textDecoder = new TextDecoder(PLAINTEXT_ENCODING);
    const decryptedBuffer = Buffer.from(uncompressedArrayBuffer);
    const decryptedText = textDecoder.decode(decryptedBuffer);

    expect(decryptedText).to.equal(PLAINTEXT_STRING);
  });

  it('should fail to decompress data not in the correct format', () => {
    const textEncoder = new TextEncoder(PLAINTEXT_ENCODING);
    const initialArrayBuffer = Util.bufferToArrayBuffer(textEncoder.encode(PLAINTEXT_STRING));

    expect(() => CompressionRzip.decompress(initialArrayBuffer)).to.throw(
      // Passing in a specific instance of an Error triggers a comparison of the references: https://github.com/chaijs/chai/issues/430
      Error,
      'Could not decompress the data using rzip',
    );
  });

  it('should decompress a save file from retroarch', async () => {
    const compressedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(COMPRESSED_FILENAME);
    const uncompressedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(UNCOMPRESSED_FILENAME);

    const decompressedArrayBuffer = CompressionRzip.decompress(compressedArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(decompressedArrayBuffer, uncompressedArrayBuffer)).to.equal(true);
  });

  it('should compress a save file to be the same as retroarch', async () => {
    const compressedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(COMPRESSED_FILENAME);
    const uncompressedArrayBuffer = await ArrayBufferUtil.readArrayBuffer(UNCOMPRESSED_FILENAME);

    const recompressedArrayBuffer = CompressionRzip.compress(uncompressedArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(recompressedArrayBuffer, compressedArrayBuffer)).to.equal(true);
  });
});
