export default class SaveFilesUtil {
  static resizeRawSave(arrayBuffer, newSize, fillValue = 0) {
    let newArrayBuffer = arrayBuffer;

    if (newSize < arrayBuffer.byteLength) {
      newArrayBuffer = arrayBuffer.slice(0, newSize);
    } else if (newSize > arrayBuffer.byteLength) {
      newArrayBuffer = new ArrayBuffer(newSize);

      const newArray = new Uint8Array(newArrayBuffer);
      const oldArray = new Uint8Array(arrayBuffer);

      newArray.fill(fillValue);
      newArray.set(oldArray, 0);
    }

    return newArrayBuffer;
  }

  static getEraseCartridgeSave(arrayBuffer) {
    // Just a new ArrayBuffer that's the same size as the known-working save, just filled with zeros

    const newArrayBuffer = new ArrayBuffer(arrayBuffer.byteLength);
    const newArray = new Uint8Array(newArrayBuffer);

    newArray.fill(0); // Redundant but let's be explicit

    return newArrayBuffer;
  }
}
