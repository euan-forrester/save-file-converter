/* eslint-disable no-bitwise */

/*
The standard format for individual saves on the Saturn appears to be the .BUP format. It contains all the stuff found in the header
for each save in the files created by the Saturn's BIOS, plus some other extra stuff.

The format is described here: https://github.com/slinga-homebrew/Save-Game-BUP-Scripts/blob/main/bup_header.h#L94
And here is some code that populates all of the fields: https://github.com/slinga-homebrew/Save-Game-BUP-Scripts/blob/main/bup_parse.py#L248

Like the code above, we're going to ignore some of the fields like stats and block size.

Here's the structure as assembled from reading https://github.com/slinga-homebrew/Save-Game-BUP-Scripts/blob/main/bup_parse.py#L248
0x00 - 0x03: Magic
0x04 - 0x07: Save ID
0x08 - 0x0B: "stats": unsure what this is, we leave as zero
0x0C - 0x0F: unused
0x10 - 0x1B: archive name
0x1C - 0x26: comment
0x27:        language code
0x28 - 0x2B: date code
0x2C - 0x2F: data size
0x30 - 0x31: block size: we leave as zero
0x32 - 0x33: padding
0x34 - 0x37: date code repeated
0x38 - 0x3F: unused
*/

import SegaSaturnSaveData from './SegaSaturn';
import SegaSaturnUtil from './Util';

import Util from '../../util/util';

const LITTLE_ENDIAN = false;

const HEADER_SIZE = 64;

const MAGIC = 'Vmem';
const MAGIC_OFFSET = 0x00;
const MAGIC_ENCODING = 'US-ASCII';

const SAVE_ID_OFFSET = 0x04;

const SAVE_NAME_OFFSET = 0x10;
const SAVE_NAME_LENGTH = SegaSaturnSaveData.ARCHIVE_ENTRY_NAME_LENGTH + 1; // +1 to hold a NULL at the end

const COMMENT_OFFSET = 0x1C;
const COMMENT_LENGTH = SegaSaturnSaveData.ARCHIVE_ENTRY_COMMENT_LENGTH + 1; // +1 to hold a NULL at the end

const LANGUAGE_OFFSET = 0x27;
const DATE_OFFSET = 0x28;
const SAVE_SIZE_OFFSET = 0x2C;
const DATE_OFFSET_2 = 0x34;

export default class SegaSaturnBupSaveData {
  // We take in a list of save files so that we can assign a unique ID to each BUP file that we return
  static convertSaveFilesToBups(saveFiles) {
    return saveFiles.map((saveFile, index) => {
      let headerArrayBuffer = Util.getFilledArrayBuffer(HEADER_SIZE, 0x00); // In the BUP header structure there's lots of padding and also fields that we don't need to fill in

      headerArrayBuffer = Util.setMagic(headerArrayBuffer, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);
      headerArrayBuffer = Util.setString(headerArrayBuffer, SAVE_NAME_OFFSET, saveFile.name, SegaSaturnSaveData.ARCHIVE_ENTRY_NAME_ENCODING, SAVE_NAME_LENGTH - 1);
      headerArrayBuffer = Util.setString(headerArrayBuffer, COMMENT_OFFSET, saveFile.comment, SegaSaturnSaveData.ARCHIVE_ENTRY_COMMENT_ENCODING, COMMENT_LENGTH - 1);

      const headerDataView = new DataView(headerArrayBuffer);

      headerDataView.setUint32(SAVE_ID_OFFSET, index, LITTLE_ENDIAN);
      headerDataView.setUint8(LANGUAGE_OFFSET, saveFile.languageCode);
      headerDataView.setUint32(DATE_OFFSET, saveFile.dateCode, LITTLE_ENDIAN);
      headerDataView.setUint32(SAVE_SIZE_OFFSET, saveFile.saveSize, LITTLE_ENDIAN);
      headerDataView.setUint32(DATE_OFFSET_2, saveFile.dateCode, LITTLE_ENDIAN);

      return Util.concatArrayBuffers([headerArrayBuffer, saveFile.rawData]);
    });
  }

  static convertBupsToSaveFiles(arrayBuffers) {
    return arrayBuffers.map((arrayBuffer) => {
      const headerArrayBuffer = arrayBuffer.slice(0, HEADER_SIZE);
      const headerDataView = new DataView(headerArrayBuffer);
      const headerUint8Array = new Uint8Array(headerArrayBuffer);

      const rawData = arrayBuffer.slice(HEADER_SIZE);

      Util.checkMagic(headerArrayBuffer, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);

      const languageCode = headerDataView.getUint8(LANGUAGE_OFFSET);
      const dateCode = headerDataView.getUint32(DATE_OFFSET, LITTLE_ENDIAN);
      const dateCode2 = headerDataView.getUint32(DATE_OFFSET_2, LITTLE_ENDIAN);
      const saveSize = headerDataView.getUint32(SAVE_SIZE_OFFSET, LITTLE_ENDIAN);

      if (saveSize !== rawData.byteLength) {
        throw new Error(`Specified save size of ${saveSize} bytes does not match actual save size of ${rawData.byteLength} bytes`);
      }

      if (dateCode !== dateCode2) {
        throw new Error(`Dates do not match: found ${SegaSaturnUtil.getDate(dateCode)} and ${SegaSaturnUtil.getDate(dateCode2)}`);
      }

      return {
        name: Util.readNullTerminatedString(headerUint8Array, SAVE_NAME_OFFSET, SegaSaturnSaveData.ARCHIVE_ENTRY_NAME_ENCODING, SAVE_NAME_LENGTH - 1),
        languageCode,
        language: SegaSaturnUtil.getLanguageString(languageCode),
        comment: Util.readNullTerminatedString(headerUint8Array, COMMENT_OFFSET, SegaSaturnSaveData.ARCHIVE_ENTRY_COMMENT_ENCODING, COMMENT_LENGTH - 1),
        dateCode,
        date: SegaSaturnUtil.getDate(dateCode),
        saveSize,
        rawData,
      };
    });
  }
}
