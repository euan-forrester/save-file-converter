// Based on https://github.com/hrydgard/ppsspp/blob/master/Core/ELF/ParamSFO.cpp

// The overall format is:
// - Header
// - N index table entries
// - Key table (all the keys, one after another)
// - Value table (all the values, one after another)

// Some interesting info regarding the 'REGION' key/value pair, which always seems to be set to 32768: https://github.com/hrydgard/ppsspp/issues/12639

import Util from '../../util/util';

const LITTLE_ENDIAN = true;

const MAGIC = '\x00PSF';
const MAGIC_ENCODING = 'US-ASCII';

const EXPECTED_VERSION = 0x00000101; // v1.1

// Header information -- all offsets from the start of the file
const MAGIC_OFFSET = 0;
const VERSION_OFFSET = 4;
const KEY_TABLE_START_OFFSET = 8;
const VALUE_TABLE_START_OFFSET = 12;
const NUM_INDEX_TABLE_ENTRIES_OFFSET = 16;
const FIRST_INDEX_TABLE_ENTRY_OFFSET = 20;

// Index table entry -- all offsets from the start of that entry
const INDEX_TABLE_KEY_OFFSET = 0;
const INDEX_TABLE_VALUE_FORMAT_OFFSET = 2;
const INDEX_TABLE_VALUE_LENGTH_OFFSET = 4;
const INDEX_TABLE_VALUE_MAX_LENGTH_OFFSET = 8;
const INDEX_TABLE_VALUE_OFFSET = 12;
const INDEX_TABLE_ENTRY_SIZE = 16;

const VALUE_FORMAT_UINT32 = 0x0404;
const VALUE_FORMAT_UTF8_STRING = 0x0204;
const VALUE_FORMAT_SPECIAL_UTF8_STRING = 0x0004;

const KEY_ENCODING = 'US-ASCII';
const VALUE_ENCODING_UTF8 = 'UTF-8';

function getErrorMessage(fileVersion) {
  if (fileVersion === EXPECTED_VERSION) {
    return 'Encountered error parsing PARAM.SFO. File was expected version.';
  }

  return `Encountered error parsing PARAM.SFO. Found file version 0x${fileVersion.toString(16)}, but expected file version 0x${EXPECTED_VERSION.toString(16)}`;
}

export default class PspParamSfo {
  constructor(arrayBuffer) {
    const fileSize = arrayBuffer.byteLength;

    Util.checkMagic(arrayBuffer, MAGIC_OFFSET, MAGIC, MAGIC_ENCODING);

    const fileDataView = new DataView(arrayBuffer);
    const fileUint8Array = new Uint8Array(arrayBuffer);

    const fileVersion = fileDataView.getUint32(VERSION_OFFSET, LITTLE_ENDIAN);
    const keyTableStart = fileDataView.getUint32(KEY_TABLE_START_OFFSET, LITTLE_ENDIAN);
    const valueTableStart = fileDataView.getUint32(VALUE_TABLE_START_OFFSET, LITTLE_ENDIAN);
    const numIndexTableEntries = fileDataView.getUint32(NUM_INDEX_TABLE_ENTRIES_OFFSET, LITTLE_ENDIAN);

    if ((keyTableStart > fileSize) || (valueTableStart > fileSize)) {
      throw new Error(getErrorMessage(fileVersion));
    }

    this.keyValuePairs = {};

    for (let i = 0; i < numIndexTableEntries; i += 1) {
      // We're iterating through an array of these index table entries in memory, so make
      // a slice of our original arraybuffer to make everything a little easier to read
      const indexTableEntryOffset = FIRST_INDEX_TABLE_ENTRY_OFFSET + (i * INDEX_TABLE_ENTRY_SIZE);
      const indexTableEntryArrayBuffer = arrayBuffer.slice(indexTableEntryOffset, indexTableEntryOffset + INDEX_TABLE_ENTRY_SIZE);
      const indexTableEntryDataView = new DataView(indexTableEntryArrayBuffer);

      const keyOffset = keyTableStart + indexTableEntryDataView.getUint16(INDEX_TABLE_KEY_OFFSET, LITTLE_ENDIAN);
      const valueOffset = valueTableStart + indexTableEntryDataView.getUint32(INDEX_TABLE_VALUE_OFFSET, LITTLE_ENDIAN);

      if ((keyOffset > fileSize) || (valueOffset > fileSize)) {
        throw new Error(getErrorMessage(fileVersion));
      }

      const key = Util.readNullTerminatedString(fileUint8Array, keyOffset, KEY_ENCODING);
      let value = null;

      const valueFormat = indexTableEntryDataView.getUint16(INDEX_TABLE_VALUE_FORMAT_OFFSET, LITTLE_ENDIAN);
      const valueLength = indexTableEntryDataView.getUint32(INDEX_TABLE_VALUE_LENGTH_OFFSET, LITTLE_ENDIAN);
      const valueMaxLength = indexTableEntryDataView.getUint32(INDEX_TABLE_VALUE_MAX_LENGTH_OFFSET, LITTLE_ENDIAN);

      switch (valueFormat) {
        case VALUE_FORMAT_UINT32: {
          value = fileDataView.getUint32(valueOffset, LITTLE_ENDIAN);
          break;
        }

        case VALUE_FORMAT_UTF8_STRING: {
          value = Util.readNullTerminatedString(fileUint8Array, valueOffset, VALUE_ENCODING_UTF8, valueMaxLength);
          break;
        }

        case VALUE_FORMAT_SPECIAL_UTF8_STRING: {
          value = fileUint8Array.slice(valueOffset, valueOffset + valueLength); // I'm not sure what this is for, but PPSSPP stores it as a copy of the raw data: https://github.com/hrydgard/ppsspp/blob/309dcb295268af657ee186dc57d825512ad8091c/Core/ELF/ParamSFO.cpp#L260
          break;
        }

        default: {
          break;
        }
      }

      if (value !== null) {
        this.keyValuePairs[key] = value;
      }
    }
  }

  getValue(key) {
    return this.keyValuePairs[key];
  }
}
