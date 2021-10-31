import path from 'path';

export default class Util {
  static changeFilenameExtension(filename, newExtension) {
    return `${path.basename(filename, path.extname(filename))}.${newExtension}`;
  }

  static removeFilenameExtension(filename) {
    return `${path.basename(filename, path.extname(filename))}`;
  }

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

  static bufferToArrayBuffer(b) {
    return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); // https://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer/31394257#31394257
  }

  static concatArrayBuffers(arrayBufferList) {
    const bufferList = arrayBufferList.map((ab) => Buffer.from(ab));

    return Util.bufferToArrayBuffer(Buffer.concat(bufferList));
  }

  // Check magic that's provided by a nice, human-readable string
  static checkMagic(arrayBuffer, offset, magic, magicEncoding) {
    const magicTextDecoder = new TextDecoder(magicEncoding);
    const magicFound = magicTextDecoder.decode(arrayBuffer.slice(offset, offset + magic.length));

    if (magicFound !== magic) {
      throw new Error(`Save appears corrupted: found '${magicFound}' instead of '${magic}'`);
    }
  }

  // Check magic that contains problematic bytes that aren't human-readable
  static checkMagicBytes(arrayBuffer, offset, magic) {
    const dataView = new DataView(arrayBuffer);

    for (let i = 0; i < magic.length; i += 1) {
      const magicFound = dataView.getUint8(offset + i);
      if (magicFound !== magic[i]) {
        throw new Error(`Save appears corrupted: found '${magicFound}' instead of '${magic[i]}'`);
      }
    }
  }

  static trimNull(s) {
    return s.replace(/\0[\s\S]*$/g, ''); // https://stackoverflow.com/questions/22809401/removing-a-null-character-from-a-string-in-javascript
  }

  static setArrayBufferPortion(destination, source, destinationOffset, sourceOffset, length) {
    const destinationArray = new Uint8Array(destination);
    const sourceArray = new Uint8Array(source.slice(sourceOffset, sourceOffset + length));

    const output = new ArrayBuffer(destination.byteLength);
    const outputArray = new Uint8Array(output);

    outputArray.set(destinationArray);
    outputArray.set(sourceArray, destinationOffset);

    return output;
  }

  static fillArrayBufferPortion(arrayBuffer, startIndex, length, fillValue) {
    const outputArrayBuffer = new ArrayBuffer(arrayBuffer.byteLength);
    const outputArray = new Uint8Array(outputArrayBuffer);
    const inputArray = new Uint8Array(arrayBuffer);

    outputArray.set(inputArray);
    outputArray.fill(fillValue, startIndex, startIndex + length);

    return outputArrayBuffer;
  }

  static fillArrayBuffer(arrayBuffer, fillValue) {
    const outputArrayBuffer = new ArrayBuffer(arrayBuffer.byteLength);
    const outputArray = new Uint8Array(outputArrayBuffer);

    outputArray.fill(fillValue);

    return outputArrayBuffer;
  }
}
