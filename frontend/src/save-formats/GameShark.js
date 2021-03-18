/* eslint no-bitwise: ["error", { "allow": ["&", ">>>", "<<"] }] */

/*
The GameShark data format header contains a header, the raw save, then a CRC.
The header contains a number of strings, so it's of variable length:

- First 4 bytes: 0x0000000d (length of "SharkPortSave")
- Next 13 bytes: "SharkPortSave"
- Next 4 bytes: Platform (GBA is 0x000f0000)
- Next 4 bytes: Length of title
- Next N bytes: Title
- Next 4 bytes: Length of date
- Next N bytes: Date
- Next 4 bytes: Length of notes
- Next N bytes: Notes
- Next 4 bytes: Length of raw save (including 0x1c bytes of a second header)
- Next 0x1C bytes: Second header
- Next N bytes: Raw save
- Next 4 bytes: CRC of second header + raw save

The second header is information from the ROM of the game the save is for:
- First 16 bytes: Game internal name (this is checked by some emulators, so we need to set it correctly)
- Next 2 bytes: ROM checksum
- Next 1 byte: ROM compliment check
- Next 1 byte: "Maker" (unsure what this is, often seems to be 0x30)
- Next 1 byte: 0x1 (for 1 save?)
- Next 7 bytes: 0x0
(see https://github.com/visualboyadvance-m/visualboyadvance-m/blob/master/src/gba/GBA.cpp#L1168)
*/

import GbaRom from '../rom-formats/gba';

const LITTLE_ENDIAN = true;
const SHARK_PORT_SAVE = 'SharkPortSave';
const CODE_GBA = 0x000f0000;
const SECOND_HEADER_LENGTH = 0x1C;
const SECOND_HEADER_INTERNAL_NAME_LENGTH = 0x10;

function getText(arrayBuffer, dataView, textDecoder, currentByte) {
  // The format for text in the header is 4 bytes to give the length, then a string of that length

  let newCurrentByte = currentByte;
  const textLength = dataView.getUint32(newCurrentByte, LITTLE_ENDIAN);
  newCurrentByte += 4;

  const textArrayBuffer = arrayBuffer.slice(newCurrentByte, newCurrentByte + textLength);
  newCurrentByte += textLength;

  const textUint8Array = new Uint8Array(textArrayBuffer);
  const text = textDecoder.decode(textUint8Array);

  return {
    text,
    nextByte: newCurrentByte,
  };
}

function copyUint8ArrayUpToMaxLength(copyFrom, maxLength) {
  const copyTo = new Uint8Array(maxLength);

  let i = 0;

  while (i < Math.min(copyFrom.length, maxLength)) {
    copyTo[i] = copyFrom[i];
    i += 1;
  }

  while (i < maxLength) {
    copyTo[i] = 0;
    i += 1;
  }

  return copyTo;
}

function parseSecondHeader(arrayBuffer, textDecoder) {
  const dataView = new DataView(arrayBuffer);

  const gameInternalNameBuffer = arrayBuffer.slice(0, SECOND_HEADER_INTERNAL_NAME_LENGTH);
  const gameInternalNameArray = new Uint8Array(gameInternalNameBuffer);

  return {
    gameInternalName: textDecoder.decode(gameInternalNameArray),
    romChecksum: dataView.getUint16(SECOND_HEADER_INTERNAL_NAME_LENGTH, LITTLE_ENDIAN),
    maker: dataView.getUint8(SECOND_HEADER_INTERNAL_NAME_LENGTH + 2),
    flag: dataView.getUint8(SECOND_HEADER_INTERNAL_NAME_LENGTH + 3),
  };
}

function createSecondHeader(romArrayBuffer, textEncoder) {
  const gbaRom = new GbaRom(romArrayBuffer);

  const headerArrayBuffer = new ArrayBuffer(SECOND_HEADER_LENGTH);
  const headerDataView = new DataView(headerArrayBuffer);
  const headerUint8Array = new Uint8Array(headerArrayBuffer);

  const encodedInternalName = textEncoder.encode(gbaRom.getInternalName());
  const encodedInternalNameMaxLength = copyUint8ArrayUpToMaxLength(encodedInternalName, SECOND_HEADER_INTERNAL_NAME_LENGTH);

  headerUint8Array.set(encodedInternalNameMaxLength, 0);
  headerDataView.setUint16(SECOND_HEADER_INTERNAL_NAME_LENGTH, gbaRom.getChecksum(), LITTLE_ENDIAN);
  headerDataView.setUint8(SECOND_HEADER_INTERNAL_NAME_LENGTH + 2, gbaRom.getMaker());
  headerDataView.setUint8(SECOND_HEADER_INTERNAL_NAME_LENGTH + 3, gbaRom.getFlag());

  return headerArrayBuffer;
}

function calculateCrc(arrayBuffer) {
  // Not a standard CRC algorithm as far as I know.
  // Taken from https://github.com/visualboyadvance-m/visualboyadvance-m/blob/master/src/gba/GBA.cpp#L1180

  const dataView = new DataView(arrayBuffer);

  let crc = 0;

  for (let i = 0; i < arrayBuffer.byteLength; i += 1) {
    crc += ((dataView.getUint8(i) << (crc % 18)) >>> 0);
    if (crc >= 2 ** 32) {
      crc -= 2 ** 32;
    }
  }

  return crc;
}

export default class GameSharkSaveData {
  static createFromGameSharkData(gameSharkArrayBuffer) {
    return new GameSharkSaveData(gameSharkArrayBuffer);
  }

  static createFromEmulatorData(emulatorArrayBuffer, title, date, notes, romArrayBuffer) {
    // A bit inefficient to promptly go and re-parse the save data, but this
    // has the nice benefit of verifying that we put everything in the correct endianness
    // and got everything in the right spot. Yes I suppose that should be a test instead.

    const textEncoder = new TextEncoder('utf-8');

    // Create the first header

    const firstHeaderLength = 4 + SHARK_PORT_SAVE.length + 4 + 4 + title.length + 4 + date.length + 4 + notes.length + 4;
    const firstHeaderArrayBuffer = new ArrayBuffer(firstHeaderLength);
    const firstHeaderUint8Array = new Uint8Array(firstHeaderArrayBuffer);
    const firstHeaderDataView = new DataView(firstHeaderArrayBuffer);

    let currentByte = 0;

    firstHeaderDataView.setUint32(0, SHARK_PORT_SAVE.length);
    currentByte += 4;

    firstHeaderUint8Array.set(textEncoder.encode(SHARK_PORT_SAVE), currentByte);
    currentByte += SHARK_PORT_SAVE.length;

    firstHeaderDataView.setUint32(currentByte, CODE_GBA);
    currentByte += 4;

    firstHeaderDataView.setUint32(currentByte, title.length);
    currentByte += 4;

    firstHeaderUint8Array.set(textEncoder.encode(title), currentByte);
    currentByte += title.length;

    firstHeaderDataView.setUint32(currentByte, date.length);
    currentByte += 4;

    firstHeaderUint8Array.set(textEncoder.encode(date), currentByte);
    currentByte += date.length;

    firstHeaderDataView.setUint32(currentByte, notes.length);
    currentByte += 4;

    firstHeaderUint8Array.set(textEncoder.encode(notes), currentByte);
    currentByte += notes.length;

    firstHeaderDataView.setUint32(emulatorArrayBuffer.byteLength + SECOND_HEADER_LENGTH);
    currentByte += 4;

    // Create the second header, and concat it with the raw save then calculate the CRC of that

    const secondHeaderAndRawSave = new ArrayBuffer(emulatorArrayBuffer.byteLength + SECOND_HEADER_LENGTH);
    const secondHeaderAndRawSaveUint8Array = new Uint8Array(secondHeaderAndRawSave);

    const secondHeaderArrayBuffer = createSecondHeader(romArrayBuffer, textEncoder);

    const secondHeaderUint8Array = new Uint8Array(secondHeaderArrayBuffer);
    const emulatorUint8Array = new Uint8Array(emulatorArrayBuffer);

    secondHeaderAndRawSaveUint8Array.set(secondHeaderUint8Array, 0);
    secondHeaderAndRawSaveUint8Array.set(emulatorUint8Array, SECOND_HEADER_LENGTH);

    const calculatedCrc = calculateCrc(secondHeaderAndRawSave);

    // And now we concat everything together: first header + second header + raw save + crc

    const gameSharkArrayBuffer = new ArrayBuffer(firstHeaderLength + SECOND_HEADER_LENGTH + emulatorArrayBuffer.byteLength + 4);
    const gameSharkUint8Array = new Uint8Array(gameSharkArrayBuffer);
    const gameSharkDataView = new DataView(gameSharkArrayBuffer);

    gameSharkUint8Array.set(firstHeaderUint8Array, 0);
    gameSharkUint8Array.set(secondHeaderUint8Array, firstHeaderLength);
    gameSharkUint8Array.set(emulatorUint8Array, firstHeaderLength + SECOND_HEADER_INTERNAL_NAME_LENGTH);
    gameSharkDataView.setUint32(firstHeaderLength + SECOND_HEADER_LENGTH + emulatorArrayBuffer.byteLength, calculatedCrc, LITTLE_ENDIAN);

    return new GameSharkSaveData(gameSharkArrayBuffer);
  }

  // This constructor creates a new object from a binary representation of a GameShark save data file
  constructor(arrayBuffer) {
    this.arrayBuffer = arrayBuffer;
    const dataView = new DataView(arrayBuffer);
    const textDecoder = new TextDecoder('utf-8');

    //
    // First make sure that the stuff in the header all makes sense
    //

    let currentByte = 0;

    // Read "SharkPortSave"

    const sharkPortSaveInfo = getText(arrayBuffer, dataView, textDecoder, currentByte);

    if (sharkPortSaveInfo.text !== SHARK_PORT_SAVE) {
      throw new Error('This does not appear to be a GameShark save file');
    }

    currentByte = sharkPortSaveInfo.nextByte;

    // Read the platform

    const platformCode = dataView.getUint32(currentByte, LITTLE_ENDIAN);
    currentByte += 4;

    if (platformCode !== CODE_GBA) {
      throw new Error(`This does not appear to be a GBA GameShark file: found '${platformCode}' instead of '${CODE_GBA}'`);
    }

    // Read the title

    const titleInfo = getText(arrayBuffer, dataView, textDecoder, currentByte);

    this.title = titleInfo.text;
    currentByte = titleInfo.nextByte;

    // Read the date

    const dateInfo = getText(arrayBuffer, dataView, textDecoder, currentByte);

    this.date = dateInfo.text;
    currentByte = dateInfo.nextByte;

    // Read the notes

    const notesInfo = getText(arrayBuffer, dataView, textDecoder, currentByte);

    this.notes = notesInfo.text;
    currentByte = notesInfo.nextByte;

    // Next grab the second header and raw save

    const secondHeaderAndRawSaveLength = dataView.getUint32(currentByte, LITTLE_ENDIAN);
    currentByte += 4;

    const secondHeaderAndRawSave = arrayBuffer.slice(currentByte, currentByte + secondHeaderAndRawSaveLength);

    const rawSaveLength = secondHeaderAndRawSaveLength - SECOND_HEADER_LENGTH;

    const secondHeaderData = arrayBuffer.slice(currentByte, currentByte + SECOND_HEADER_LENGTH);
    currentByte += SECOND_HEADER_LENGTH;

    this.secondHeader = parseSecondHeader(secondHeaderData, textDecoder);

    const rawSaveData = arrayBuffer.slice(currentByte, currentByte + rawSaveLength);
    currentByte += 4;

    // And lastly the CRC

    this.crcFromFile = dataView.getUint32(currentByte, LITTLE_ENDIAN);
    currentByte += 4;

    this.calculatedCrc = calculateCrc(secondHeaderAndRawSave);

    // Some files found on the Internet do not set the CRC (e.g. its 0x00000000 or oxFFFFFFFF) so there's
    // no point in rejecting a file if the CRC doesn't match.

    // Everything looks good

    this.rawSaveData = rawSaveData;
  }

  getTitle() {
    return this.title;
  }

  getDate() {
    return this.date;
  }

  getNotes() {
    return this.notes;
  }

  getSecondHeader() {
    return this.secondHeader;
  }

  getCrc() {
    return this.crc;
  }

  getCalculatedCrc() {
    return this.calculatedCrc;
  }

  getRawSaveData() {
    return this.rawSaveData;
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
