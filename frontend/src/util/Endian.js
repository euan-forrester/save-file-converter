function swap2ByteWord(inputDataView, outputDataView) {
  for (let i = 0; i < inputDataView.byteLength / 2; i += 1) {
    const n = inputDataView.getUint16(i * 2, true); // As long as the endianness values here are different, it doesn't matter which is which
    outputDataView.setUint16(i * 2, n, false);
  }
}

function swap4ByteWord(inputDataView, outputDataView) {
  for (let i = 0; i < inputDataView.byteLength / 4; i += 1) {
    const n = inputDataView.getUint32(i * 4, true); // As long as the endianness values here are different, it doesn't matter which is which
    outputDataView.setUint32(i * 4, n, false);
  }
}

function swap8ByteWord(inputDataView, outputDataView) {
  for (let i = 0; i < inputDataView.byteLength / 8; i += 1) {
    const n = inputDataView.getBigUint64(i * 8, true); // As long as the endianness values here are different, it doesn't matter which is which
    outputDataView.setBigUint64(i * 8, n, false);
  }
}

const SWAP_FUNCTIONS = {
  2: swap2ByteWord,
  4: swap4ByteWord,
  8: swap8ByteWord,
};

export default class EndianUtil {
  static swap(inputArrayBuffer, wordSizeInBytes) {
    if ((inputArrayBuffer.byteLength % wordSizeInBytes) !== 0) {
      throw new Error(`File length must be a multiple of ${wordSizeInBytes} bytes`);
    }

    if (!(wordSizeInBytes in SWAP_FUNCTIONS)) {
      throw new Error(`Word size must be one of ${Object.keys(SWAP_FUNCTIONS).join(', ')}`);
    }

    const outputArrayBuffer = new ArrayBuffer(inputArrayBuffer.byteLength);
    const inputDataView = new DataView(inputArrayBuffer);
    const outputDataView = new DataView(outputArrayBuffer);

    SWAP_FUNCTIONS[wordSizeInBytes](inputDataView, outputDataView);

    return outputArrayBuffer;
  }
}
