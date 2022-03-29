/* eslint no-bitwise: ["error", { "allow": ["&", ">>=", "<<", ">>", ">>>"] }] */

export default class MathUtil {
  static getNextLargestPowerOf2(n) {
    // Input values shouldn't be negative
    if (n <= 0) {
      return 0;
    }

    if (MathUtil.isPowerOf2(n)) {
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

  static isPowerOf2(n) {
    if (n <= 0) {
      return false;
    }

    return ((n & (n - 1)) === 0);
  }

  static getNextMultipleOf16(n) {
    // Input values shouldn't be negative
    if (n <= 0) {
      return 0;
    }

    return ((n + 0xF) >>> 4) << 4;
  }

  static roundUpToNearest64Bytes(num) {
    if (num < 0) {
      return 0;
    }

    return (((num + 0x3F) >>> 6) << 6);
  }
}
