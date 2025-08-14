/* eslint-disable no-bitwise */

import DreamcastBasics from './Components/Basics';

const { LITTLE_ENDIAN } = DreamcastBasics;

const TIMESTAMP_YEAR_OFFSET = 0;
const TIMESTAMP_MONTH_OFFSET = 2;
const TIMESTAMP_DAY_OFFSET = 3;
const TIMESTAMP_HOUR_OFFSET = 4;
const TIMESTAMP_MINUTE_OFFSET = 5;
const TIMESTAMP_SECOND_OFFSET = 6;
const TIMESTAMP_DAY_OF_WEEK_OFFSET = 7;
const TIMESTAMP_LENGTH = 8;

export default class DreamcastUtil {
  static readTimestamp(arrayBuffer, offset) {
    // Date conversion based on https://mc.pp.se/dc/vms/vmi.html

    const dataView = new DataView(arrayBuffer.slice(offset, offset + TIMESTAMP_LENGTH));

    const year = dataView.getUint16(TIMESTAMP_YEAR_OFFSET, LITTLE_ENDIAN);
    const month = dataView.getUint8(TIMESTAMP_MONTH_OFFSET) - 1; // Dreamcast months are 1-12, Javascript months are 0-11
    const day = dataView.getUint8(TIMESTAMP_DAY_OFFSET);
    const hour = dataView.getUint8(TIMESTAMP_HOUR_OFFSET);
    const minute = dataView.getUint8(TIMESTAMP_MINUTE_OFFSET);
    const second = dataView.getUint8(TIMESTAMP_SECOND_OFFSET);
    const dayOfWeek = dataView.getUint8(TIMESTAMP_DAY_OF_WEEK_OFFSET); // Different files appear to be inconsistent. In some 0 represents Sunday and in some 0 represents Monday. In a Javascript Date, 0 represents Sunday

    const date = new Date(year, month, day, hour, minute, second); // No timezone information is given in the Dreamcast format. This Date object is in the local timezone

    if ((dayOfWeek !== date.getDay()) && (((dayOfWeek + 1) % 7) !== date.getDay())) {
      throw new Error(`Date appears to be corrupted: day of week does not match. Day of week found: ${dayOfWeek}, day of week calculated: ${date.getDay()}`);
    }

    return date;
  }
}
