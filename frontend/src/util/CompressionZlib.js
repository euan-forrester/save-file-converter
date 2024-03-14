import pako from 'pako';

export default class CompressionZlib {
  static decompress(arrayBuffer) {
    return pako.inflate(arrayBuffer);
  }

  static compress(arrayBuffer) {
    return pako.deflate(arrayBuffer);
  }
}
