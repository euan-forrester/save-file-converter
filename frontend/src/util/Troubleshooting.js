/* eslint no-bitwise: ["error", { "allow": ["&", ">>=", "<<"] }] */

export default class Troubleshooting {
  static attemptFix(testSaveArrayBuffer, brokenSaveArrayBuffer) {
    // First, temporarily remove any padding from the start of the 2 saves

    const testSavePadding = Troubleshooting.getPadValueAndCount(testSaveArrayBuffer);
    const brokenSavePadding = Troubleshooting.getPadValueAndCount(brokenSaveArrayBuffer);

    const testSaveNoPaddingAtStart = Troubleshooting.removePaddingFromStart(testSaveArrayBuffer, testSavePadding.count);
    const brokenSaveNoPaddingAtStart = Troubleshooting.removePaddingFromStart(brokenSaveArrayBuffer, brokenSavePadding.count);

    // Now make the remainder of the broken save be the same length as the remainder of the good save

    let brokenSaveNoPaddingAtStartCorrectLength = brokenSaveNoPaddingAtStart;

    if (brokenSaveNoPaddingAtStart.byteLength < testSaveNoPaddingAtStart.byteLength) {
      const endPadding = {
        value: 0x00,
        count: testSaveNoPaddingAtStart.byteLength - brokenSaveNoPaddingAtStart.byteLength,
      };

      brokenSaveNoPaddingAtStartCorrectLength = Troubleshooting.addPaddingToEnd(brokenSaveNoPaddingAtStart, endPadding);
    } else if (brokenSaveNoPaddingAtStart.byteLength > testSaveNoPaddingAtStart.byteLength) {
      brokenSaveNoPaddingAtStartCorrectLength = Troubleshooting.removePaddingFromEnd(brokenSaveNoPaddingAtStart, brokenSaveNoPaddingAtStart.byteLength - testSaveNoPaddingAtStart.byteLength);
    }

    // Now add back any padding to the start that was present in the good save

    const brokenSaveFixed = Troubleshooting.addPaddingToStart(brokenSaveNoPaddingAtStartCorrectLength, testSavePadding);

    return brokenSaveFixed;
  }

  static getPadValueAndCount(arrayBuffer) {
    const pad00Count = Troubleshooting.countPadding(arrayBuffer, 0x00);
    const padFFCount = Troubleshooting.countPadding(arrayBuffer, 0xFF);

    let value = 0x00;
    let count = pad00Count;

    if (padFFCount > 0) {
      value = 0xFF;
      count = padFFCount;
    }

    // Most raw save files (for cartridges anyway) have sizes that are a power of 2,
    // because it's stored on a chip of one type or another and that's how they're manufactured.
    //
    // So, if we see apparent padding that seems to take our size below a power of 2 it's probable that
    // some of that "padding" was legit data so we don't want to trim it.

    const apparentRemainingSize = arrayBuffer.byteLength - count;
    const realRemainingSize = Troubleshooting.getNextLargestPowerOf2(apparentRemainingSize);

    count -= (realRemainingSize - apparentRemainingSize);

    return {
      value,
      count,
    };
  }

  static removePaddingFromStart(arrayBuffer, paddingCount) {
    return arrayBuffer.slice(paddingCount);
  }

  static removePaddingFromEnd(arrayBuffer, paddingCount) {
    return arrayBuffer.slice(0, arrayBuffer.byteLength - paddingCount);
  }

  static addPaddingToStart(arrayBuffer, padding) {
    const newArrayBuffer = new ArrayBuffer(arrayBuffer.byteLength + padding.count);
    const newUint8Array = new Uint8Array(newArrayBuffer);
    const oldUint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < padding.count; i += 1) {
      newUint8Array[i] = padding.value;
    }

    newUint8Array.set(oldUint8Array, padding.count);

    return newArrayBuffer;
  }

  static addPaddingToEnd(arrayBuffer, padding) {
    const newArrayBuffer = new ArrayBuffer(arrayBuffer.byteLength + padding.count);
    const newUint8Array = new Uint8Array(newArrayBuffer);
    const oldUint8Array = new Uint8Array(arrayBuffer);

    newUint8Array.set(oldUint8Array, 0);

    for (let i = 0; i < padding.count; i += 1) {
      newUint8Array[arrayBuffer.byteLength + i] = padding.value;
    }

    return newArrayBuffer;
  }

  static countPadding(arrayBuffer, padValue) {
    const uint8Array = new Uint8Array(arrayBuffer);
    let count = 0;

    for (let i = 0; i < uint8Array.length; i += 1) {
      if (uint8Array[i] !== padValue) {
        break;
      }
      count += 1;
    }

    if (count === arrayBuffer.byteLength) {
      count = 0;
    }

    return count;
  }

  static getNextLargestPowerOf2(n) {
    // Input values shouldn't be negative
    if (n <= 0) {
      return 0;
    }

    // Is the value already a power of 2?
    if ((n & (n - 1)) === 0) {
      return n;
    }

    // Keep removing bits until we're left with 0
    let count = 0;
    let x = n;

    while (x !== 0) {
      x >>= 1;
      count += 1;
    }

    return 1 << count;
  }
}
