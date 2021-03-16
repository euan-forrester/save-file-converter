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
- First 16 bytes: Game internal name
- Next 2 bytes: ROM checksum
- Next 1 byte: ROM compliment check
- Next 1 byte: "Maker" (unsure what this is, often seems to be 0x30)
- Next 1 byte: 0x1 (for 1 save?)
- Next 7 bytes: 0x0
(see https://github.com/visualboyadvance-m/visualboyadvance-m/blob/master/src/gba/GBA.cpp#L1168)
*/

const LITTLE_ENDIAN = true;
const SHARK_PORT_SAVE = 'SharkPortSave';
const CODE_GBA = 0x000f0000;
const SECOND_HEADER_LENGTH = 0x1C;

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

function parseSecondHeader(arrayBuffer, textDecoder) {
  const dataView = new DataView(arrayBuffer);

  const gameInternalNameBuffer = arrayBuffer.slice(0, 16);
  const gameInternalNameArray = new Uint8Array(gameInternalNameBuffer);

  return {
    gameInternalName: textDecoder.decode(gameInternalNameArray),
    romChecksum: dataView.getUint16(16, LITTLE_ENDIAN),
    maker: dataView.getUint8(18),
    flag: dataView.getUint8(19),
  };
}

function calculateCrc(arrayBuffer) {
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

  static createFromEmulatorData(/* emulatorArrayBuffer */) {
    // A bit inefficient to promptly go and decompress and re-CRC32 the save data, but this
    // has the nice benefit of verifying that we put everything in the correct endianness
    // and got everything in the right spot. Yes I suppose that should be a test instead.

    // return new GameSharkSaveData(retron5ArrayBuffer);
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
      throw new Error(`This does not appear to be a GameShark save file: found '${sharkPortSaveInfo.text}' instead of '${SHARK_PORT_SAVE}'`);
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
