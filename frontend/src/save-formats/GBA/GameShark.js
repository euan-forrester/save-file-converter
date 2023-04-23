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

import GbaRom from '../../rom-formats/gba';
import Util from '../../util/util';
import SaveFilesUtil from '../../util/SaveFiles';

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

  copyTo.fill(0);

  for (let i = 0; i < Math.min(copyFrom.length, maxLength); i += 1) {
    copyTo[i] = copyFrom[i];
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
    romComplimentCheck: dataView.getUint8(SECOND_HEADER_INTERNAL_NAME_LENGTH + 2),
    maker: dataView.getUint8(SECOND_HEADER_INTERNAL_NAME_LENGTH + 3),
    flag: dataView.getUint8(SECOND_HEADER_INTERNAL_NAME_LENGTH + 4),
  };
}

function createSecondHeaderFromRom(romArrayBuffer) {
  const gbaRom = new GbaRom(romArrayBuffer);

  const secondHeader = {
    gameInternalName: gbaRom.getInternalName(),
    romChecksum: gbaRom.getChecksum(),
    romComplimentCheck: gbaRom.getComplimentCheck(),
    maker: gbaRom.getMaker(),
    flag: 1,
  };

  return secondHeader;
}

function createSecondHeaderArrayBuffer(secondHeader, textEncoder) {
  const headerArrayBuffer = new ArrayBuffer(SECOND_HEADER_LENGTH);
  const headerDataView = new DataView(headerArrayBuffer);
  const headerUint8Array = new Uint8Array(headerArrayBuffer);

  const encodedInternalName = textEncoder.encode(secondHeader.gameInternalName);
  const encodedInternalNameMaxLength = copyUint8ArrayUpToMaxLength(encodedInternalName, SECOND_HEADER_INTERNAL_NAME_LENGTH);

  headerUint8Array.set(encodedInternalNameMaxLength, 0);
  headerDataView.setUint16(SECOND_HEADER_INTERNAL_NAME_LENGTH, secondHeader.romChecksum, LITTLE_ENDIAN);
  headerDataView.setUint8(SECOND_HEADER_INTERNAL_NAME_LENGTH + 2, secondHeader.romComplimentCheck);
  headerDataView.setUint8(SECOND_HEADER_INTERNAL_NAME_LENGTH + 3, secondHeader.maker);
  headerDataView.setUint8(SECOND_HEADER_INTERNAL_NAME_LENGTH + 4, secondHeader.flag);

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

  static createWithNewSize(gameSharkSaveData, newSize) {
    // Sometimes we may need to change the size of our raw buffer. This is because it's very difficult to determine
    // what the save game size is for a particular game and so some emulators get this wrong and there are many files
    // floating around the Internet that are the wrong size.
    //
    // So we can either truncate them (most likely), or pad them with zeros to make them the size
    // that the game/emulator actually expects.
    //
    // More information:
    // - https://zork.net/~st/jottings/GBA_saves.html
    // - https://dillonbeliveau.com/2020/06/05/GBA-FLASH.html

    const newRawSaveData = SaveFilesUtil.resizeRawSave(gameSharkSaveData.getRawSaveData(), newSize);

    return GameSharkSaveData.createFromEmulatorDataAndSecondHeader(
      newRawSaveData,
      gameSharkSaveData.getTitle(),
      gameSharkSaveData.getDate(),
      gameSharkSaveData.getNotes(),
      gameSharkSaveData.getSecondHeader(),
    );
  }

  static createFromEmulatorData(emulatorArrayBuffer, title, date, notes, romArrayBuffer) {
    const secondHeader = createSecondHeaderFromRom(romArrayBuffer);

    return GameSharkSaveData.createFromEmulatorDataAndSecondHeader(emulatorArrayBuffer, title, date, notes, secondHeader);
  }

  static createFromEmulatorDataAndSecondHeader(emulatorArrayBuffer, title, date, notes, secondHeader) {
    // A bit inefficient to promptly go and re-parse the save data, but this
    // has the nice benefit of verifying that we put everything in the correct endianness
    // and got everything in the right spot. Yes I suppose that should be a test instead.

    const textEncoder = new TextEncoder('US-ASCII'); // The name can contain 0x00 characters that we need to interpret correctly

    // Create the first header

    const firstHeaderLength = 4 + SHARK_PORT_SAVE.length + 4 + 4 + title.length + 4 + date.length + 4 + notes.length + 4;
    const firstHeaderArrayBuffer = new ArrayBuffer(firstHeaderLength);
    const firstHeaderUint8Array = new Uint8Array(firstHeaderArrayBuffer);
    const firstHeaderDataView = new DataView(firstHeaderArrayBuffer);

    let currentByte = 0;

    firstHeaderDataView.setUint32(currentByte, SHARK_PORT_SAVE.length, LITTLE_ENDIAN);
    currentByte += 4;

    firstHeaderUint8Array.set(textEncoder.encode(SHARK_PORT_SAVE), currentByte);
    currentByte += SHARK_PORT_SAVE.length;

    firstHeaderDataView.setUint32(currentByte, CODE_GBA, LITTLE_ENDIAN);
    currentByte += 4;

    firstHeaderDataView.setUint32(currentByte, title.length, LITTLE_ENDIAN);
    currentByte += 4;

    firstHeaderUint8Array.set(textEncoder.encode(title), currentByte);
    currentByte += title.length;

    firstHeaderDataView.setUint32(currentByte, date.length, LITTLE_ENDIAN);
    currentByte += 4;

    firstHeaderUint8Array.set(textEncoder.encode(date), currentByte);
    currentByte += date.length;

    firstHeaderDataView.setUint32(currentByte, notes.length, LITTLE_ENDIAN);
    currentByte += 4;

    firstHeaderUint8Array.set(textEncoder.encode(notes), currentByte);
    currentByte += notes.length;

    firstHeaderDataView.setUint32(currentByte, emulatorArrayBuffer.byteLength + SECOND_HEADER_LENGTH, LITTLE_ENDIAN);
    currentByte += 4;

    // Create the second header, and concat it with the raw save then calculate the CRC of that

    const secondHeaderAndRawSave = new ArrayBuffer(emulatorArrayBuffer.byteLength + SECOND_HEADER_LENGTH);
    const secondHeaderAndRawSaveUint8Array = new Uint8Array(secondHeaderAndRawSave);

    const secondHeaderArrayBuffer = createSecondHeaderArrayBuffer(secondHeader, textEncoder);

    const secondHeaderUint8Array = new Uint8Array(secondHeaderArrayBuffer);
    const emulatorUint8Array = new Uint8Array(emulatorArrayBuffer);

    secondHeaderAndRawSaveUint8Array.set(secondHeaderUint8Array, 0);
    secondHeaderAndRawSaveUint8Array.set(emulatorUint8Array, SECOND_HEADER_LENGTH);

    const calculatedCrc = calculateCrc(secondHeaderAndRawSave);

    // And now we concat everything together: first header + second header + raw save + crc

    const crcArrayBuffer = new ArrayBuffer(4);
    const crcDataView = new DataView(crcArrayBuffer);

    crcDataView.setUint32(0, calculatedCrc, LITTLE_ENDIAN);

    const gameSharkArrayBuffer = Util.concatArrayBuffers([firstHeaderArrayBuffer, secondHeaderArrayBuffer, emulatorArrayBuffer, crcArrayBuffer]);

    return new GameSharkSaveData(gameSharkArrayBuffer);
  }

  // This constructor creates a new object from a binary representation of a GameShark save data file
  constructor(arrayBuffer) {
    this.arrayBuffer = arrayBuffer;
    const dataView = new DataView(arrayBuffer);
    const textDecoder = new TextDecoder('US-ASCII'); // The name can contain 0x00 characters that we need to interpret correctly

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
      throw new Error('This does not appear to be a GBA GameShark file');
    }

    try {
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
    } catch (e) {
      // The header length is variable, so having bad values for the length of the various strings
      // results in a file that isn't readable
      throw new Error('This file appears to be corrupted');
    }
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
