// Taken from http://www.surugi.com/projects/gcifaq.html
const REGION_DECODE = new Map([
  ['J', 'Japan'],
  ['E', 'North America'],
  ['P', 'Europe'],
]);

const UNKNOWN_REGION_STRING = 'Unknown';
const UNKNOWN_REGION_CODE = 'X';

const POSSIBLE_REGION_CODES = Array.from(REGION_DECODE.keys());

// The epoch for Javascript Dates is Jan 1, 1970. For GameCube dates it's Jan 1, 1980
const MILLISECONDS_BETWEEN_EPOCHS = 946684800000;

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

  static getDate(dateEncoded) {
    // Date conversion from: http://www.surugi.com/projects/gcifaq.html
    // The GameCube stores the date as the number of seconds since Dec 31, 1999 @ 11:59:59 PM. So to convert to a javascript Date,
    // we multiply to get milliseconds, and add the number of milliseconds between Jan 1, 1970 and Dec 31, 1999 @ 11:59:59 PM

    return new Date((dateEncoded * 1000) + MILLISECONDS_BETWEEN_EPOCHS);
  }

  static getDateCode(date) {
    return (date.valueOf() - MILLISECONDS_BETWEEN_EPOCHS) / 1000;
  }
}
