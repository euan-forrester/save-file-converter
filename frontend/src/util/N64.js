export default class N64Util {
  static endianSwap(inputArrayBuffer, inputEndianness) {
    const inputLittleEndian = inputEndianness === 'littleToBigEndian';
    const outputLittleEndian = !inputLittleEndian;

    const outputArrayBuffer = new ArrayBuffer(inputArrayBuffer.byteLength);
    const inputDataView = new DataView(inputArrayBuffer);
    const outputDataView = new DataView(outputArrayBuffer);

    if ((inputDataView.byteLength % 4) !== 0) {
      throw new Error('N64 file size must be a multiple of 4 bytes');
    }

    for (let i = 0; i < inputDataView.byteLength / 4; i += 1) {
      const n = inputDataView.getUint32(i * 4, inputLittleEndian);
      outputDataView.setUint32(i * 4, n, outputLittleEndian);
    }

    return outputArrayBuffer;
  }
}
