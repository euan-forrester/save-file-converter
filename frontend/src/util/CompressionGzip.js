// Note that we can potentially remove the dependancy on pako by using the Compression Streams API:
// https://stackoverflow.com/questions/36185110/is-there-a-way-to-use-browsers-native-gzip-decompression-using-javascript
//
// But this requires making these functions async

import pako from 'pako';

export default class CompressionGzip {
  static decompress(arrayBuffer) {
    try {
      return pako.ungzip(arrayBuffer);
    } catch (e) {
      // pako throws a string rather than an error
      throw new Error(`Could not decompress the data using gzip: ${e}`);
    }
  }

  static compress(arrayBuffer) {
    try {
      return pako.gzip(arrayBuffer);
    } catch (e) {
      // pako throws a string rather than an error
      throw new Error(`Could not compress the data using gzip: ${e}`);
    }
  }
}
