import path from 'path';
import Encoding from 'encoding-japanese'; // Should we consider splitting this out? Almost every page depends on this file, but very few need japanese encodings

// Comment to trigger build

export default class Util {
  static clampValue(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  static changeFilenameExtension(filename, newExtension) {
    return `${path.basename(filename, path.extname(filename))}.${newExtension}`;
  }

  static removeFilenameExtension(filename) {
    return `${path.basename(filename, path.extname(filename))}`;
  }

  static getFilename(filename) {
    return path.basename(filename);
  }

  static getExtension(filename) {
    return path.extname(filename);
  }

  static appendToFilename(filename, stringToAppend) {
    return `${Util.removeFilenameExtension(filename)}${stringToAppend}${path.extname(filename)}`;
  }

  static convertDescriptionToFilename(description) {
    // First, remove everything but A-Z, a-z, 0-9, dash, underscore, space
    // Then check how many A-Z, a-z, 0-9 there are. If > 0 then done, if 0 then return 'output'
    // This is to prevent a filename of just being a single space, or a dash, etc, if the
    // original description is all japanese characters plus a space, for example

    const descriptionStripped = description.replace(/[^0-9a-z_\- ]/gi, '');
    const descriptionStrippedAlphanumeric = descriptionStripped.replace(/[^0-9a-z]/gi, '');

    if (descriptionStrippedAlphanumeric.length > 0) {
      return descriptionStripped;
    }

    return 'output';
  }

  static bufferToArrayBuffer(b) {
    return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); // https://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer/31394257#31394257
  }

  static concatArrayBuffers(arrayBufferList) {
    const bufferList = arrayBufferList.map((ab) => Buffer.from(ab));

    return Util.bufferToArrayBuffer(Buffer.concat(bufferList));
  }

  static setString(arrayBuffer, offset, string, stringEncoding, maxLengthWhenEncoded) {
    let stringArrayBuffer = null;

    if (stringEncoding === 'shift-jis') {
      const unicodeArray = Encoding.stringToCode(string);

      stringArrayBuffer = Util.bufferToArrayBuffer(new Uint8Array(Encoding.convert(unicodeArray, { to: 'SJIS', from: 'UNICODE' })));
    } else {
      // TextEncoder can actually only encode to UTF8. US-ASCII is a subset of that, so
      // this happens to work when we specify US-ASCII. TextDecoder is able to decode a wide variety of formats
      const textEncoder = new TextEncoder(stringEncoding);

      stringArrayBuffer = Util.bufferToArrayBuffer(textEncoder.encode(string));
    }

    return Util.setArrayBufferPortion(arrayBuffer, stringArrayBuffer, offset, 0, Math.min(stringArrayBuffer.byteLength, maxLengthWhenEncoded));
  }

  static setMagic(arrayBuffer, offset, magic, magicEncoding) {
    return Util.setString(arrayBuffer, offset, magic, magicEncoding, Number.MAX_SAFE_INTEGER);
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
        throw new Error(`Save appears corrupted: found 0x${magicFound.toString(16)} instead of 0x${magic[i].toString(16)}`);
      }
    }
  }

  static setMagicBytes(arrayBuffer, offset, magic) {
    const outputArrayBuffer = Util.copyArrayBuffer(arrayBuffer);
    const dataView = new DataView(outputArrayBuffer);

    for (let i = 0; i < magic.length; i += 1) {
      dataView.setUint8(offset + i, magic[i]);
    }

    return outputArrayBuffer;
  }

  static findMagic(arrayBuffer, magic, magicEncoding, startOffset = 0) {
    const magicTextDecoder = new TextDecoder(magicEncoding);

    for (let offset = startOffset; offset < (arrayBuffer.byteLength - magic.length); offset += 1) {
      const magicFound = magicTextDecoder.decode(arrayBuffer.slice(offset, offset + magic.length));

      if (magicFound === magic) {
        return offset;
      }
    }

    throw new Error(`Save appears corrupted: could not find magic '${magic}'`);
  }

  static trimNull(s) {
    return s.replace(/\0[\s\S]*$/g, ''); // https://stackoverflow.com/questions/22809401/removing-a-null-character-from-a-string-in-javascript
  }

  static getNullTerminatedArray(uint8Array, startOffset, maxLength = -1) {
    let end = uint8Array.length;

    if (maxLength >= 0) {
      end = Math.min(end, startOffset + maxLength);
    }

    for (let i = startOffset; i < end; i += 1) {
      if (uint8Array[i] === 0) {
        return uint8Array.slice(startOffset, i);
      }
    }

    return uint8Array.slice(startOffset, end);
  }

  static readString(uint8Array, startOffset, encoding, length) {
    const textDecoder = new TextDecoder(encoding);

    return textDecoder.decode(uint8Array.slice(startOffset, startOffset + length));
  }

  static readNullTerminatedString(uint8Array, startOffset, encoding, maxLength = -1) {
    const textDecoder = new TextDecoder(encoding);

    return textDecoder.decode(Util.getNullTerminatedArray(uint8Array, startOffset, maxLength));
  }

  static uint8ArrayToHex(uint8Array) {
    return Buffer.from(uint8Array).toString('hex').toUpperCase();
  }

  static copyArrayBuffer(source) {
    const destination = new ArrayBuffer(source.byteLength);

    new Uint8Array(destination).set(new Uint8Array(source));

    return destination;
  }

  static padArrayBuffer(inputArrayBuffer, desiredLength, fillValue) {
    if (inputArrayBuffer.byteLength === desiredLength) {
      return inputArrayBuffer;
    }

    if (inputArrayBuffer.byteLength > desiredLength) {
      throw new Error(`Cannot pad array buffer of length ${inputArrayBuffer.byteLength} to length ${desiredLength}`);
    }

    const outputArrayBuffer = Util.getFilledArrayBuffer(desiredLength, fillValue);

    return Util.setArrayBufferPortion(outputArrayBuffer, inputArrayBuffer, 0, 0, inputArrayBuffer.byteLength);
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

  static getFilledArrayBuffer(length, fillValue) {
    const outputArrayBuffer = new ArrayBuffer(length);
    const outputArray = new Uint8Array(outputArrayBuffer);

    outputArray.fill(fillValue);

    return outputArrayBuffer;
  }

  static fillArrayBuffer(arrayBuffer, fillValue) {
    return Util.getFilledArrayBuffer(arrayBuffer.byteLength, fillValue);
  }

  static arrayBuffersEqual(arrayBuffer1, arrayBuffer2) {
    if (arrayBuffer1.byteLength !== arrayBuffer2.byteLength) {
      return false;
    }

    const u81 = new Uint8Array(arrayBuffer1);
    const u82 = new Uint8Array(arrayBuffer2);

    const unequalIndex = u81.find((element, index) => u81[index] !== u82[index]);

    return (unequalIndex === undefined);
  }

  static allBytesEqual(arrayBuffer, value) {
    const u8 = new Uint8Array(arrayBuffer);

    const unequalIndex = u8.find((element) => element !== value);

    return (unequalIndex === undefined);
  }

  static copyHeaderFromArrayBuffer(sourceArrayBuffer, headerByteCount, destinationArrayBuffer) {
    const headerArrayBuffer = sourceArrayBuffer.slice(0, headerByteCount);
    return Util.concatArrayBuffers([headerArrayBuffer, destinationArrayBuffer]);
  }

  static copyFooterFromArrayBuffer(sourceArrayBuffer, footerByteCount, destinationArrayBuffer) {
    const footerArrayBuffer = sourceArrayBuffer.slice(-footerByteCount);
    return Util.concatArrayBuffers([destinationArrayBuffer, footerArrayBuffer]);
  }
}
