/* eslint-disable no-bitwise */

import PaddingUtil from './Padding';

const LITTLE_ENDIAN = false;

// Genesis raw files can come in various flavours.
//
// SRAM/FRAM saves:
//
// The general idea is that each 8 bit byte is "expanded" out to be 16 bits (because the Genesis reads over a 16 bit bus I guess).
// However, there are several ways of doing this, each of which is "correct":
//
// - Alternate 0x00 bytes: "HELLO" -> " H E L L O" (emulators and Mega Everdrive do this)
// - Alternate 0xFF bytes: "HELLO" -> " H E L L O" (Mega SD does this)
// - Repeat each byte:     "HELLO" -> "HHEELLLLOO" (the Retrode cart reader does this)
//
// EEPROM saves:
//
// Here, it's just the straight data with no byte expanding.
//
// My working theory on identifying EEPROM saves vs a non-byte-expanded SRAM save is that EEPROM saves
// seem to be smaller.

const SMALLEST_GENESIS_SRAM_SAVE = 512; // Final Fantasy Legend on Gameboy is 512B and is SRAM, but I'm not aware of any Genesis SRAM games that small
const BIGGEST_32X_EEPROM_SAVE = 512; // Knuckles Chaotix on 32X is 512B. NBA TE on 32X appears to be at least 256B.

const FILL_BYTE_REPEAT = 'repeat';

export default class GenesisUtil {
  static isEepromSave(inputArrayBuffer) {
    // Hacky check for EEPROM saves that shouldn't be byte expanded
    // Wonder Boy in Monster World's save is 128 bytes. 512 bytes is the smallest SRAM save I've seen (Final Fantasy Legend on Gameboy)
    // This hack may well not work on other Genesis EEPROM games: I have no idea how big their saves are, and looking at the list
    // here https://github.com/euan-forrester/save-file-converter/blob/main/frontend/src/save-formats/Wii/ConvertFromSega.js
    // there are lots of sports games that may need a bunch of space.
    return (inputArrayBuffer.byteLength < SMALLEST_GENESIS_SRAM_SAVE);
  }

  static is32xEepromSave(inputArrayBuffer) {
    // The biggest 32X EEPROM save I've seen is 512 Bytes (Knuckles Chaotix).
    // Unfortunately, some SRAM save files without much data in them may get unpadded to be smaller than 512 bytes
    // (e.g. our example Sonic 3 save), which can lead to false positives here.
    //
    // So, I split out this function into Genesis and 32X variants to at least limit the potential for false positives to just 32X SRAM saves
    // (and the 32X is way less popular)

    console.log(`*** Checking is buffer of length ${inputArrayBuffer.byteLength} is a 32X eeprom save. Biggest eeprom save is ${BIGGEST_32X_EEPROM_SAVE} bytes`);
    return (inputArrayBuffer.byteLength <= BIGGEST_32X_EEPROM_SAVE);
  }

  static isByteExpanded(inputArrayBuffer) {
    const inputDataView = new DataView(inputArrayBuffer);

    for (let i = 0; i < (inputArrayBuffer.byteLength / 2); i += 1) {
      const highByte = inputDataView.getUint8(i * 2);
      const lowByte = inputDataView.getUint8((i * 2) + 1);

      if ((highByte !== lowByte) && (highByte !== 0x00) && (highByte !== 0xFF)) {
        return false;
      }
    }

    return true;
  }

  // fillByte can either be the value you want put into upper byte of each word,
  // or it can be 'repeat'
  static byteExpand(inputArrayBuffer, fillByte) {
    const outputArrayBuffer = new ArrayBuffer(inputArrayBuffer.byteLength * 2);

    const inputDataView = new DataView(inputArrayBuffer);
    const outputDataView = new DataView(outputArrayBuffer);

    const repeatByte = (fillByte === FILL_BYTE_REPEAT);

    for (let i = 0; i < inputDataView.byteLength; i += 1) {
      const inputByte = inputDataView.getUint8(i);
      const highByte = repeatByte ? inputByte : fillByte;

      const outputWord = ((highByte & 0xFF) << 8) | inputByte;

      outputDataView.setUint16(i * 2, outputWord, LITTLE_ENDIAN);
    }

    return outputArrayBuffer;
  }

  static byteCollapse(inputArrayBuffer) {
    const outputArrayBuffer = new ArrayBuffer(inputArrayBuffer.byteLength / 2);

    const inputDataView = new DataView(inputArrayBuffer);
    const outputDataView = new DataView(outputArrayBuffer);

    for (let i = 0; i < (inputArrayBuffer.byteLength / 2); i += 1) {
      const currByte = inputDataView.getUint8((i * 2) + 1);

      outputDataView.setUint8(i, currByte);
    }

    return outputArrayBuffer;
  }

  static changeFillByte(inputArrayBuffer, fillByte) {
    if (GenesisUtil.isEepromSave(inputArrayBuffer)) {
      return inputArrayBuffer;
    }

    const padding = PaddingUtil.getPadFromEndValueAndCount(inputArrayBuffer);

    const needToChangePadding = (fillByte !== FILL_BYTE_REPEAT) && (padding.value !== fillByte); // Check if padding was 0xFF and we're trying to fill with 0x00, or vice versa

    const unpaddedInputArrayBuffer = PaddingUtil.removePaddingFromEnd(inputArrayBuffer, padding.count);

    let byteCollapsedArrayBuffer = unpaddedInputArrayBuffer;

    if (GenesisUtil.isByteExpanded(unpaddedInputArrayBuffer)) {
      byteCollapsedArrayBuffer = GenesisUtil.byteCollapse(unpaddedInputArrayBuffer);
    }

    let outputArrayBuffer = GenesisUtil.byteExpand(byteCollapsedArrayBuffer, fillByte);

    if (needToChangePadding) {
      outputArrayBuffer = PaddingUtil.addPaddingToEnd(outputArrayBuffer, { value: fillByte, count: padding.count });
    } else {
      outputArrayBuffer = PaddingUtil.addPaddingToEnd(outputArrayBuffer, { value: padding.value, count: padding.count }); // Put the padding back
    }

    return outputArrayBuffer;
  }
}
