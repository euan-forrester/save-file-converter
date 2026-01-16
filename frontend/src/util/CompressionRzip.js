import { RzipJS } from 'RzipJS';

import Util from './util';

export default class CompressionRzip {
  static decompress(arrayBuffer) {
    try {
      const rzip = new RzipJS(new Uint8Array(arrayBuffer));

      if (!rzip.is_rzip_compressed()) {
        throw new Error('Data is not compressed with rzip');
      }

      return Util.bufferToArrayBuffer(rzip.rzip_inflate());
    } catch (e) {
      throw new Error('Could not decompress the data using rzip', e);
    }
  }

  static compress(arrayBuffer) {
    try {
      const rzip = new RzipJS(new Uint8Array(arrayBuffer));

      if (rzip.is_rzip_compressed()) {
        throw new Error('Data is already compressed using rzip');
      }

      return Util.bufferToArrayBuffer(rzip.rzip_deflate());
    } catch (e) {
      throw new Error('Could not compress the data using rzip', e);
    }
  }
}
