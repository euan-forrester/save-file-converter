export default class Util {
  static resizeRawSave(arrayBuffer, newSize) {
    let newArrayBuffer = arrayBuffer;

    if (newSize < arrayBuffer.byteLength) {
      newArrayBuffer = arrayBuffer.slice(0, newSize);
    } else if (newSize > arrayBuffer.byteLength) {
      newArrayBuffer = new ArrayBuffer(newSize);

      const newArray = new Uint8Array(newArrayBuffer);
      const oldArray = new Uint8Array(arrayBuffer);

      newArray.fill(0); // Redundant but let's be explicit
      newArray.set(oldArray, 0);
    }

    return newArrayBuffer;
  }
}
