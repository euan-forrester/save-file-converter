// Taken from http://www.surugi.com/projects/gcifaq.html
const REGION_DECODE = new Map([
  ['J', 'Japan'],
  ['E', 'North America'],
  ['P', 'Europe'],
]);

const UNKNOWN_REGION_STRING = 'Unknown';
const UNKNOWN_REGION_CODE = 'X';

const POSSIBLE_REGION_CODES = Array.from(REGION_DECODE.keys());

// Taken from https://github.com/dolphin-emu/dolphin/blob/ee27f03a4387baca6371a06068274135ff9547a5/Source/Core/Core/HW/GCMemcard/GCMemcard.h#L186
const ENCODING_DECODE = new Map([
  [0, 'US-ASCII'],
  [1, 'shift-jis'],
]);

const UNKNOWN_ENCODING_STRING = 'Unknown';
const UNKNOWN_ENCODING_CODE = -1;

const POSSIBLE_ENCODING_CODES = Array.from(ENCODING_DECODE.keys());

// The epoch for Javascript Dates is Jan 1, 1970. For GameCube dates it's Jan 1, 1980: https://github.com/dolphin-emu/dolphin/blob/4f210df86a2d2362ef8087cf81b817b18c3d32e9/Source/Core/Core/HW/EXI/EXI_DeviceIPL.h#L27
const MILLISECONDS_BETWEEN_EPOCHS = 946684800000;

// Numbers to turn a OSTime into a regular time
// Bus operates at 162 MHz. Read games read from address 0x800000F8: https://github.com/doldecomp/melee/blob/aa123d0cefebc03046794e5ebc712551fa9b36fa/src/dolphin/os/OSTime.h#L29
// Which contains the value 162000000: https://www.gc-forever.com/yagcd/chap4.html
const OS_BUS_CLOCK = 162000000n; // https://github.com/doldecomp/melee/blob/aa123d0cefebc03046794e5ebc712551fa9b36fa/src/dolphin/os/OSTime.h#L31
const OS_TIMER_CLOCK = OS_BUS_CLOCK / 4n; // https://github.com/doldecomp/melee/blob/aa123d0cefebc03046794e5ebc712551fa9b36fa/src/dolphin/os/OSTime.h#L32

export default class GameCubeUtil {
  static getRegionString(regionCode) {
    if (REGION_DECODE.has(regionCode)) {
      return REGION_DECODE.get(regionCode);
    }

    return UNKNOWN_REGION_STRING;
  }

  static getRegionCode(regionString) {
    const regionCode = POSSIBLE_REGION_CODES.find((key) => REGION_DECODE.get(key) === regionString);

    if (regionCode === undefined) {
      return UNKNOWN_REGION_CODE;
    }

    return regionCode;
  }

  static getEncodingString(encodingCode) {
    if (ENCODING_DECODE.has(encodingCode)) {
      return ENCODING_DECODE.get(encodingCode);
    }

    return UNKNOWN_ENCODING_STRING;
  }

  static getEncodingCode(encodingString) {
    const encodingCode = POSSIBLE_ENCODING_CODES.find((key) => ENCODING_DECODE.get(key) === encodingString);

    if (encodingCode === undefined) {
      return UNKNOWN_ENCODING_CODE;
    }

    return encodingCode;
  }

  static getDate(dateEncoded) {
    // Date conversion from: http://www.surugi.com/projects/gcifaq.html
    // The GameCube stores the date as the number of seconds since Dec 31, 1999 @ 11:59:59 PM. So to convert to a javascript Date,
    // we multiply to get milliseconds, and add the number of milliseconds between Jan 1, 1970 and Dec 31, 1999 @ 11:59:59 PM

    return new Date((dateEncoded * 1000) + MILLISECONDS_BETWEEN_EPOCHS);
  }

  static getDateCode(date) {
    return (date.valueOf() - MILLISECONDS_BETWEEN_EPOCHS) / 1000;
  }

  static getDateFromOsTime(osTime) {
    // OSTime is a 64 bit BigInt, so can't mix calculations with a Number
    const secondsFromEpoch = osTime / OS_TIMER_CLOCK; // https://github.com/doldecomp/melee/blob/aa123d0cefebc03046794e5ebc712551fa9b36fa/src/dolphin/os/OSTime.h#L33
    return GameCubeUtil.getDate(Number(secondsFromEpoch));
  }

  static getOsTimeFromDate(date) {
    const dateCode = GameCubeUtil.getDateCode(date);
    return BigInt(dateCode) * OS_TIMER_CLOCK;
  }
}
