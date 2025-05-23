// Taken from https://github.com/slinga-homebrew/Save-Game-BUP-Scripts/blob/main/bup_header.h#L31
const LANGUAGE_DECODE = new Map([
  [0, 'Japanese'],
  [1, 'English'],
  [2, 'French'],
  [3, 'German'],
  [4, 'Spanish'],
  [5, 'Italian'],
]);

const UNKNOWN_LANGUAGE_STRING = 'Unknown';
const UNKNOWN_LANGUAGE_CODE = 0xFF;

const POSSIBLE_LANGUAGE_CODES = Array.from(LANGUAGE_DECODE.keys());

// The epoch for Javascript Dates is Jan 1, 1970. For Saturn dates, it's Jan 1, 1980
const MILLISECONDS_BETWEEN_EPOCHS = 315529200000;

export default class SegaSaturnUtil {
  static getLanguageString(languageEncoded) {
    if (LANGUAGE_DECODE.has(languageEncoded)) {
      return LANGUAGE_DECODE.get(languageEncoded);
    }

    // There are save files where the comment field is too long and stomps on the language and date fields
    // So we have to consider this to be valid

    return UNKNOWN_LANGUAGE_STRING;
  }

  static getLanguageCode(languageString) {
    const languageEncoded = POSSIBLE_LANGUAGE_CODES.find((key) => LANGUAGE_DECODE.get(key) === languageString);

    if (languageEncoded === undefined) {
      return UNKNOWN_LANGUAGE_CODE;
    }

    return languageEncoded;
  }

  static getDate(dateEncoded) {
    // Date conversion from: https://segaxtreme.net/threads/backup-memory-structure.16803/post-156645
    // The Saturn stores the date as the number of minutes since Jan 1, 1980. So to convert to a javascript Date,
    // we multiply to get milliseconds, and add the number of milliseconds between Jan 1, 1970 and Jan 1, 1980

    return new Date((dateEncoded * 60 * 1000) + MILLISECONDS_BETWEEN_EPOCHS);
  }

  static getDateCode(date) {
    return (date.valueOf() - MILLISECONDS_BETWEEN_EPOCHS) / 1000 / 60;
  }
}
