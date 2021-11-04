/*
The GameShark SP data format header contains a header then the raw save.
The header is of fixed length. The full format doesn't appear to be known, so we can currently only do the conversion one way (extracting the raw save).

- Bytes 0-7: "ADVSAVEG"
- Bytes 8-11: Unknown
- Bytes 12-23: Name of the ROM this file is for
- Bytes 24-43: Unknown
- Bytes 44-1067: Notes
- Bytes 1068-1071: 0x12345678 ("xV4\x12" as it's referred to in VBA below)
- Bytes 1072-EOF: Raw save

(see https://github.com/visualboyadvance-m/visualboyadvance-m/blob/master/src/gba/GBA.cpp#L1078)
*/

const LITTLE_ENDIAN = true;
const HEADER_START_MARKER = 'ADVSAVEG';
const HEADER_START_MARKER_POS = 0;
const TITLE_START_POS = 12;
const TITLE_LENGTH = 12;
const NOTES_START_POS = 44;
const NOTES_LENGTH = 1023;
const HEADER_END_MARKER = 0x12345678;
const HEADER_END_MARKER_POS = 1068;
const HEADER_LENGTH = 1072;

function getText(arrayBuffer, startPos, length, textDecoder) {
  const textArrayBuffer = arrayBuffer.slice(startPos, startPos + length);
  const textUint8Array = new Uint8Array(textArrayBuffer);

  return textDecoder.decode(textUint8Array);
}

export default class GameSharkSpSaveData {
  static createFromGameSharkSpData(gameSharkSpArrayBuffer) {
    return new GameSharkSpSaveData(gameSharkSpArrayBuffer);
  }

  // This constructor creates a new object from a binary representation of a GameShark SP save data file
  constructor(arrayBuffer) {
    this.arrayBuffer = arrayBuffer;
    const dataView = new DataView(arrayBuffer);
    const textDecoder = new TextDecoder('US-ASCII');

    //
    // First make sure that the stuff in the header all makes sense
    //

    // Read the header start marker

    const startMarker = getText(arrayBuffer, HEADER_START_MARKER_POS, HEADER_START_MARKER.length, textDecoder);

    if (startMarker !== HEADER_START_MARKER) {
      throw new Error(`This does not appear to be a GameShark SP file: found ${startMarker} instead of ${HEADER_START_MARKER} at start of header`);
    }

    // Read the header end marker

    const endMarker = dataView.getUint32(HEADER_END_MARKER_POS, LITTLE_ENDIAN);

    if (endMarker !== HEADER_END_MARKER) {
      throw new Error(`This does not appear to be a GameShark SP file: found 0x${endMarker.toString(16)} instead of 0x${HEADER_END_MARKER.toString(16)} at end of header`);
    }

    // Read the game title and notes
    this.title = getText(arrayBuffer, TITLE_START_POS, TITLE_LENGTH, textDecoder);
    this.notes = getText(arrayBuffer, NOTES_START_POS, NOTES_LENGTH, textDecoder);
    this.rawSaveData = arrayBuffer.slice(HEADER_LENGTH);
  }

  getTitle() {
    return this.title;
  }

  getNotes() {
    return this.notes;
  }

  getRawSaveData() {
    return this.rawSaveData;
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
