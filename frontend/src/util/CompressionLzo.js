import lzo from '../../lib/minlzo-js/lzo1x';
import Util from './util';

export default class CompressionLzo {
  static decompress(arrayBuffer, uncompressedSize) {
    const state = {
      inputBuffer: new Uint8Array(arrayBuffer),
      outputBuffer: null,
    };

    lzo.setOutputEstimate(uncompressedSize);

    const returnVal = lzo.decompress(state);

    if (returnVal === lzo.OK) {
      return Util.bufferToArrayBuffer(state.outputBuffer);
    }

    throw new Error(`Encountered error ${returnVal} when trying to decompress LZO buffer`);
  }

  static compress(arrayBuffer) {
    const state = {
      inputBuffer: new Uint8Array(arrayBuffer),
      outputBuffer: null,
    };

    const returnVal = lzo.compress(state);

    if (returnVal === lzo.OK) {
      return Util.bufferToArrayBuffer(state.outputBuffer);
    }

    throw new Error(`Encountered error ${returnVal} when trying to compress buffer with LZO`);
  }
}
