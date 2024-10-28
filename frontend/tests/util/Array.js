export default class ArrayUtil {
  static arraysEqual(a1, a2) {
    if (a1.length !== a2.length) {
      return false;
    }

    for (let i = 0; i < a1.length; i += 1) {
      if (a1[i] !== a2[i]) {
        return false;
      }
    }

    return true;
  }

  static createSequentialArray(startValue, endValue) {
    return Array(endValue - startValue + 1).fill().map((_, index) => index + startValue);
  }
}
