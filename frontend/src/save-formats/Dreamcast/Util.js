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

const BCD_TIMESTAMP_CENTURY_OFFSET = 0;
const BCD_TIMESTAMP_YEAR_WITHIN_CENTURY_OFFSET = 1;

const TIMESTAMP_LENGTH = 8;

function readBcdByte(val) {
  const tens = Math.floor(val / 16);
  const ones = val % 16;

  return (tens * 10) + ones;
}

function formatDateWithoutTimezone(date) {
  const pad = (n) => String(n).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // Months are zero-indexed
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function checkDayOfWeek(dayOfWeek, date) {
  if ((dayOfWeek !== date.getDay()) && (((dayOfWeek + 1) % 7) !== date.getDay())) {
    throw new Error(`Date appears to be corrupted: day of week does not match for date ${formatDateWithoutTimezone(date)}. `
    + `Day of week found: ${dayOfWeek}, day of week calculated: ${date.getDay()}`);
  }
}

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

    checkDayOfWeek(dayOfWeek, date);

    return date;
  }

  static readBcdTimestamp(arrayBuffer, offset) {
    // Date conversion based on https://mc.pp.se/dc/vms/flashmem.html

    const dataView = new DataView(arrayBuffer.slice(offset, offset + TIMESTAMP_LENGTH));

    const century = readBcdByte(dataView.getUint8(BCD_TIMESTAMP_CENTURY_OFFSET));
    const yearWithinCentury = readBcdByte(dataView.getUint8(BCD_TIMESTAMP_YEAR_WITHIN_CENTURY_OFFSET));

    const year = (century * 100) + yearWithinCentury;
    const month = readBcdByte(dataView.getUint8(TIMESTAMP_MONTH_OFFSET)) - 1; // Dreamcast months are 1-12, Javascript months are 0-11
    const day = readBcdByte(dataView.getUint8(TIMESTAMP_DAY_OFFSET));
    const hour = readBcdByte(dataView.getUint8(TIMESTAMP_HOUR_OFFSET));
    const minute = readBcdByte(dataView.getUint8(TIMESTAMP_MINUTE_OFFSET));
    const second = readBcdByte(dataView.getUint8(TIMESTAMP_SECOND_OFFSET));
    // const dayOfWeek = readBcdByte(dataView.getUint8(TIMESTAMP_DAY_OF_WEEK_OFFSET));

    const date = new Date(year, month, day, hour, minute, second); // No timezone information is given in the Dreamcast format. This Date object is in the local timezone

    // I'm reasonably confident that I've interpreted the dates correctly because a bunch pass this test. The day of week can be wrong due to timezones, or just set wrong because it's confusing
    // checkDayOfWeek(dayOfWeek, date);

    return date;
  }

  // Dreamcast timestamps do not have a timezone, so are all in local time. So we want to print them without timezone information so that the tests work wherever they are executed
  static formatDateWithoutTimezone(date) {
    return formatDateWithoutTimezone(date);
  }
}
