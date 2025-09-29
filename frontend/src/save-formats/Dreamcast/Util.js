/* eslint-disable no-bitwise */

import DreamcastBasics from './Components/Basics';

import Util from '../../util/util';

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

function writeBcdByte(val) {
  const highByte = Math.floor(val / 10);
  const lowByte = val % 10;

  return (highByte << 4) | lowByte;
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
    // For the day of week, different files appear to be inconsistent. In some 0 represents Sunday and in some 0 represents Monday.
    // The official dreamcast docs say that 0 represents Sunday. In a Javascript Date, 0 represents Sunday
    // https://mc.pp.se/dc/vms/vmi.html says that Sunday is 0

    const date = new Date(year, month, day, hour, minute, second); // No timezone information is given in the Dreamcast format. This Date object is in the local timezone

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
    // For the day of week, different files appear to be inconsistent. In some 0 represents Sunday and in some 0 represents Monday.
    // The official dreamcast docs say that 0 represents Sunday. In a Javascript Date, 0 represents Sunday
    // https://mc.pp.se/dc/vms/flashmem.html says that Monday is 0

    const date = new Date(year, month, day, hour, minute, second); // No timezone information is given in the Dreamcast format. This Date object is in the local timezone

    return date;
  }

  static writeBcdTimestamp(arrayBuffer, offset, date) {
    const timestampArrayBuffer = new ArrayBuffer(TIMESTAMP_LENGTH);
    const dataView = new DataView(timestampArrayBuffer);

    const century = Math.floor(date.getFullYear() / 100);
    const yearWithinCentury = date.getFullYear() % 100;

    dataView.setUint8(BCD_TIMESTAMP_CENTURY_OFFSET, writeBcdByte(century));
    dataView.setUint8(BCD_TIMESTAMP_YEAR_WITHIN_CENTURY_OFFSET, writeBcdByte(yearWithinCentury));
    dataView.setUint8(TIMESTAMP_MONTH_OFFSET, writeBcdByte(date.getMonth() + 1)); // Dreamcast months are 1-12, Javascript months are 0-11
    dataView.setUint8(TIMESTAMP_DAY_OFFSET, writeBcdByte(date.getDate()));
    dataView.setUint8(TIMESTAMP_HOUR_OFFSET, writeBcdByte(date.getHours()));
    dataView.setUint8(TIMESTAMP_MINUTE_OFFSET, writeBcdByte(date.getMinutes()));
    dataView.setUint8(TIMESTAMP_SECOND_OFFSET, writeBcdByte(date.getSeconds()));
    dataView.setUint8(TIMESTAMP_DAY_OF_WEEK_OFFSET, writeBcdByte(date.getDay())); // The official docs say that Dreamcast Sunday is 0, and JavaScript Sunday is 0 so we're going with that. https://mc.pp.se/dc/vms/flashmem.html says that Monday is 0

    return Util.setArrayBufferPortion(arrayBuffer, timestampArrayBuffer, offset, 0, TIMESTAMP_LENGTH);
  }

  // Dreamcast timestamps do not have a timezone, so are all in local time. So we want to print them without timezone information so that the tests work wherever they are executed
  static formatDateWithoutTimezone(date) {
    return formatDateWithoutTimezone(date);
  }
}
