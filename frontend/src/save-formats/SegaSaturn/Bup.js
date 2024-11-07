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
0x08 - 0x0B: stats: we leave as zero. Details: https://github.com/cafe-alpha/pskai_wtfpl/blob/main/vmem_defs.h#L82
0x0C - 0x0F: unused
0x10 - 0x1B: archive name
0x1C - 0x26: comment
0x27:        language code
0x28 - 0x2B: date code 1: when game was last saved
0x2C - 0x2F: data size in bytes
0x30 - 0x31: data size in blocks: we leave as zero
0x32 - 0x33: padding
0x34 - 0x37: date code 2: when Pseudo Saturn Kai last started
0x38 - 0x3F: unused

The portion from 0x10 - 0x31 inclusive is the official BupDir struct, as detailed here: http://ppcenter.free.fr/satdocs/ST-162-R1-092994.html (page 42)

Note that we are supposed to prefer the first date in the structure (when the game was last saved) over the second date (when Pseudo Saturn Kai last started)
https://github.com/cafe-alpha/pskai_wtfpl/blob/main/vmem_defs.h#L127
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
const DATE_OFFSET_1 = 0x28;
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
      headerDataView.setUint32(DATE_OFFSET_1, saveFile.dateCode, LITTLE_ENDIAN);
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
      const dateCode1 = headerDataView.getUint32(DATE_OFFSET_1, LITTLE_ENDIAN);
      const dateCode2 = headerDataView.getUint32(DATE_OFFSET_2, LITTLE_ENDIAN);
      const saveSize = headerDataView.getUint32(SAVE_SIZE_OFFSET, LITTLE_ENDIAN);

      const dateCode = (dateCode1 !== 0) ? dateCode1 : dateCode2; // See note above about which date to prefer

      if (saveSize !== rawData.byteLength) {
        throw new Error(`Specified save size of ${saveSize} bytes does not match actual save size of ${rawData.byteLength} bytes`);
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
