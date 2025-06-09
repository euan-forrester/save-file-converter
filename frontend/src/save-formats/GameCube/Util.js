/* eslint-disable no-bitwise */

import GameCubeBasics from './Components/Basics';

const {
  BLOCK_SIZE,
  NUM_RESERVED_BLOCKS,
  LITTLE_ENDIAN,
} = GameCubeBasics;

// Taken from http://www.surugi.com/projects/gcifaq.html and the FAQ from https://gc-saves.com/
const REGION_DECODE = new Map([
  ['J', 'Japan'],
  ['E', 'North America'],
  ['P', 'Europe'],
  ['D', 'Germany'],
  ['F', 'France'],
  ['H', 'Netherlands'],
  ['I', 'Italy'],
  ['S', 'Spain'],
  ['K', 'Korea'],
  ['U', 'Korea'],
]);

const UNKNOWN_REGION_STRING = 'Unknown';
const UNKNOWN_REGION_CODE = 'X';

// Taken from https://github.com/dolphin-emu/dolphin/blob/ee27f03a4387baca6371a06068274135ff9547a5/Source/Core/Core/HW/GCMemcard/GCMemcard.h#L186
const ENCODING_DECODE = new Map([
  [0, 'US-ASCII'],
  [1, 'shift-jis'],
]);

const UNKNOWN_ENCODING_STRING = 'Unknown';
const UNKNOWN_ENCODING_CODE = -1;

// Taken from https://www.gc-forever.com/yagcd/chap10.html#sec10.5
const LANGUAGE_DECODE = new Map([
  [0, 'English'],
  [1, 'German'],
  [2, 'French'],
  [3, 'Spanish'],
  [4, 'Italian'],
  [5, 'Dutch'],
]);

const UNKNOWN_LANGUAGE_STRING = 'Unknown';
const UNKNOWN_LANGUAGE_CODE = -1;

// The epoch for Javascript Dates is Jan 1, 1970. For GameCube dates it's Jan 1, 2000: https://github.com/dolphin-emu/dolphin/blob/4f210df86a2d2362ef8087cf81b817b18c3d32e9/Source/Core/Core/HW/EXI/EXI_DeviceIPL.h#L27
const MILLISECONDS_BETWEEN_EPOCHS = 946684800000;

// Numbers to turn a OSTime into a regular time
// Bus operates at 162 MHz. Read games read this value from address 0x800000F8: https://github.com/doldecomp/melee/blob/aa123d0cefebc03046794e5ebc712551fa9b36fa/src/dolphin/os/OSTime.h#L29
// which contains the number 162000000: https://www.gc-forever.com/yagcd/chap4.html
const OS_BUS_CLOCK = 162000000n; // https://github.com/doldecomp/melee/blob/aa123d0cefebc03046794e5ebc712551fa9b36fa/src/dolphin/os/OSTime.h#L31
const OS_TIMER_CLOCK = OS_BUS_CLOCK / 4n; // https://github.com/doldecomp/melee/blob/aa123d0cefebc03046794e5ebc712551fa9b36fa/src/dolphin/os/OSTime.h#L32

function getString(code, decodeMap, unknownString) {
  if (decodeMap.has(code)) {
    return decodeMap.get(code);
  }

  return unknownString;
}

function getCode(string, decodeMap, unknownCode) {
  const possibleCodes = Array.from(decodeMap.keys());

  const code = possibleCodes.find((key) => decodeMap.get(key) === string);

  if (code === undefined) {
    return unknownCode;
  }

  return code;
}

export default class GameCubeUtil {
  static getRegionString(regionCode) {
    return getString(regionCode, REGION_DECODE, UNKNOWN_REGION_STRING);
  }

  static getRegionCode(regionString) {
    return getCode(regionString, REGION_DECODE, UNKNOWN_REGION_CODE);
  }

  static getEncodingString(encodingCode) {
    return getString(encodingCode, ENCODING_DECODE, UNKNOWN_ENCODING_STRING);
  }

  static getEncodingCode(encodingString) {
    return getCode(encodingString, ENCODING_DECODE, UNKNOWN_ENCODING_CODE);
  }

  static getLanguageString(languageCode) {
    return getString(languageCode, LANGUAGE_DECODE, UNKNOWN_LANGUAGE_STRING);
  }

  static getLanguageCode(languageString) {
    return getCode(languageString, LANGUAGE_DECODE, UNKNOWN_LANGUAGE_CODE);
  }

  static getDate(dateEncoded) {
    // Date conversion from: http://www.surugi.com/projects/gcifaq.html
    // The GameCube stores the date as the number of seconds since Jan 1, 2000. So to convert to a javascript Date,
    // we multiply to get milliseconds, and add the number of milliseconds between Jan 1, 1970 and Jan 1, 2000

    return new Date((dateEncoded * 1000) + MILLISECONDS_BETWEEN_EPOCHS);
  }

  static getDateCode(date) {
    return Math.floor((date.valueOf() - MILLISECONDS_BETWEEN_EPOCHS) / 1000);
  }

  static getDateFromOsTime(osTime) {
    // OSTime is a 64 bit BigInt, so can't mix calculations with a Number
    const secondsFromEpoch = osTime / OS_TIMER_CLOCK; // https://github.com/doldecomp/melee/blob/aa123d0cefebc03046794e5ebc712551fa9b36fa/src/dolphin/os/OSTime.h#L33
    return GameCubeUtil.getDate(Number(secondsFromEpoch));
  }

  static getOsTimeFromDate(date) {
    const dateCode = GameCubeUtil.getDateCode(date);
    // BigInt is not defined in our default javascript eslint rules. Doing this properly by making a .eslintrc file specifying using newer rules leads to an awful mess of having to make a giant .eslintrc file to deal with error after error
    return BigInt(dateCode) * OS_TIMER_CLOCK; // eslint-disable-line no-undef
  }

  // Taken from https://github.com/dolphin-emu/dolphin/blob/4f210df86a2d2362ef8087cf81b817b18c3d32e9/Source/Core/Core/HW/GCMemcard/GCMemcard.cpp#L328
  static calculateChecksums(arrayBuffer, beginOffset, length) {
    let checksum = 0;
    let checksumInverse = 0;

    const dataView = new DataView(arrayBuffer);

    for (let i = 0; i < length; i += 2) {
      checksum += dataView.getUint16(beginOffset + i, LITTLE_ENDIAN);
      checksumInverse += dataView.getUint16(beginOffset + i, LITTLE_ENDIAN) ^ 0xFFFF;

      // Need to make sure we're always constrained to 16 bits
      checksum &= 0xFFFF;
      checksumInverse &= 0xFFFF;
    }

    if (checksum === 0xFFFF) {
      checksum = 0;
    }

    if (checksumInverse === 0xFFFF) {
      checksumInverse = 0;
    }

    return {
      checksum,
      checksumInverse,
    };
  }

  static megabitsToBytes(numMegabits) {
    return ((numMegabits / 8) * 1024 * 1024);
  }

  static bytesToMegabits(numBytes) {
    return (numBytes / (1024 * 1024)) * 8;
  }

  static getTotalSizes(numMegabits) {
    const numTotalBytes = GameCubeUtil.megabitsToBytes(numMegabits);

    return {
      numTotalBytes,
      numTotalBlocks: (numTotalBytes / BLOCK_SIZE) - NUM_RESERVED_BLOCKS,
    };
  }
}
