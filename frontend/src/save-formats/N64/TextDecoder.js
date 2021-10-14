/* eslint-disable object-property-newline */

import { invert } from 'lodash-es';

// The N64 uses a custom character encoding
// Taken from https://github.com/bryc/mempak/blob/master/js/parser.js#L35
// Also listed here: http://n64devkit.square7.ch/n64man/nos/nosLoadFont.htm
const CHARACTER_CODE_LOOKUP = {
  0: '', 15: ' ', 16: '0',
  17: '1', 18: '2', 19: '3', 20: '4',
  21: '5', 22: '6', 23: '7', 24: '8',
  25: '9', 26: 'A', 27: 'B', 28: 'C',
  29: 'D', 30: 'E', 31: 'F', 32: 'G',
  33: 'H', 34: 'I', 35: 'J', 36: 'K',
  37: 'L', 38: 'M', 39: 'N', 40: 'O',
  41: 'P', 42: 'Q', 43: 'R', 44: 'S',
  45: 'T', 46: 'U', 47: 'V', 48: 'W',
  49: 'X', 50: 'Y', 51: 'Z', 52: '!',
  53: '"', 54: '#', 55: '\'', 56: '*',
  57: '+', 58: ',', 59: '-', 60: '.',
  61: '/', 62: ':', 63: '=', 64: '?',
  65: '@', 66: '。', 67: '゛', 68: '゜',
  69: 'ァ', 70: 'ィ', 71: 'ゥ', 72: 'ェ',
  73: 'ォ', 74: 'ッ', 75: 'ャ', 76: 'ュ',
  77: 'ョ', 78: 'ヲ', 79: 'ン', 80: 'ア',
  81: 'イ', 82: 'ウ', 83: 'エ', 84: 'オ',
  85: 'カ', 86: 'キ', 87: 'ク', 88: 'ケ',
  89: 'コ', 90: 'サ', 91: 'シ', 92: 'ス',
  93: 'セ', 94: 'ソ', 95: 'タ', 96: 'チ',
  97: 'ツ', 98: 'テ', 99: 'ト', 100: 'ナ',
  101: 'ニ', 102: 'ヌ', 103: 'ネ', 104: 'ノ',
  105: 'ハ', 106: 'ヒ', 107: 'フ', 108: 'ヘ',
  109: 'ホ', 110: 'マ', 111: 'ミ', 112: 'ム',
  113: 'メ', 114: 'モ', 115: 'ヤ', 116: 'ユ',
  117: 'ヨ', 118: 'ラ', 119: 'リ', 120: 'ル',
  121: 'レ', 122: 'ロ', 123: 'ワ', 124: 'ガ',
  125: 'ギ', 126: 'グ', 127: 'ゲ', 128: 'ゴ',
  129: 'ザ', 130: 'ジ', 131: 'ズ', 132: 'ゼ',
  133: 'ゾ', 134: 'ダ', 135: 'ヂ', 136: 'ヅ',
  137: 'デ', 138: 'ド', 139: 'バ', 140: 'ビ',
  141: 'ブ', 142: 'ベ', 143: 'ボ', 144: 'パ',
  145: 'ピ', 146: 'プ', 147: 'ペ', 148: 'ポ',
};

const CHARACTER_LOOKUP = invert(CHARACTER_CODE_LOOKUP);

export default class N64TextDecoder {
  static decode(uint8array) {
    let output = '';

    for (let i = 0; i < uint8array.length; i += 1) {
      const char = CHARACTER_CODE_LOOKUP[uint8array[i]];
      output += (char || '');
    }

    return output;
  }

  static encode(string, encodedLength) {
    const output = new Uint8Array(encodedLength);

    output.fill(0);

    for (let i = 0; i < Math.min(string.length, encodedLength); i += 1) {
      const char = string.charAt(i);

      if (char in CHARACTER_LOOKUP) {
        output[i] = CHARACTER_LOOKUP[char];
      } else {
        output[i] = 0;
      }
    }

    return output;
  }
}
