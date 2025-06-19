const GAME_SERIAL_CODE_MEDIA_INDEX = 0;
const GAME_SERIAL_CODE_REGION_INDEX = 3;

// Taken from https://github.com/bryc/mempak/blob/master/js/codedb.js#L88
const REGION_CODE_TO_NAME = {
  A: 'All regions',
  B: 'Brazil', // Unlicensed?
  C: 'China', // Unused?
  D: 'Germany',
  E: 'North America',
  F: 'France',
  G: 'Gateway 64 (NTSC)',
  H: 'Netherlands', // Unused. GC/Wii only.
  I: 'Italy',
  J: 'Japan',
  K: 'South Korea', // Unused. GC/Wii only.
  L: 'Gateway 64 (PAL)',
  P: 'Europe',
  R: 'Russia', // Unused. Wii only.
  S: 'Spain',
  U: 'Australia', // Although some AU games used standard P codes.
  W: 'Taiwan', // Unused. GC/Wii only.
  X: 'Europe', // Alternative PAL version (Other languages)
  Y: 'Europe', // Alternative PAL version (Other languages)
  Z: 'Europe', // Unused. Alternative PAL version 3. Possibly Wii only.
};

const GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE = '\x3B\xAD\xD1\xE5';
const GAMESHARK_ACTIONREPLAY_CART_SAVE_PUBLISHER_CODE = '\xFA\xDE';
const BLACKBAG_CART_SAVE_GAME_SERIAL_CODE = '\xDE\xAD\xBE\xEF'; // #cute
const BLACKBAG_CART_SAVE_PUBLISHER_CODE = '\x12\x34'; // #cute

export default class N64GameSerialCodeUtil {
  static GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE = GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE;

  static GAMESHARK_ACTIONREPLAY_CART_SAVE_PUBLISHER_CODE = GAMESHARK_ACTIONREPLAY_CART_SAVE_PUBLISHER_CODE;

  static GAMESHARK_ACTIONREPLAY_CART_SAVE_REGION_CODE = N64GameSerialCodeUtil.getRegionCode(GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE);

  static GAMESHARK_ACTIONREPLAY_CART_SAVE_MEDIA_CODE = N64GameSerialCodeUtil.getMediaCode(GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE);

  static BLACKBAG_CART_SAVE_GAME_SERIAL_CODE = BLACKBAG_CART_SAVE_GAME_SERIAL_CODE;

  static BLACKBAG_CART_SAVE_PUBLISHER_CODE = BLACKBAG_CART_SAVE_PUBLISHER_CODE;

  static BLACKBAG_CART_SAVE_REGION_CODE = N64GameSerialCodeUtil.getRegionCode(BLACKBAG_CART_SAVE_GAME_SERIAL_CODE);

  static BLACKBAG_CART_SAVE_MEDIA_CODE = N64GameSerialCodeUtil.getMediaCode(BLACKBAG_CART_SAVE_GAME_SERIAL_CODE);

  static getRegionCode(gameSerialCode) {
    return gameSerialCode.charAt(GAME_SERIAL_CODE_REGION_INDEX);
  }

  static getMediaCode(gameSerialCode) {
    return gameSerialCode.charAt(GAME_SERIAL_CODE_MEDIA_INDEX);
  }

  static getRegionName(gameSerialCode) {
    const regionCode = N64GameSerialCodeUtil.getRegionCode(gameSerialCode);

    if (regionCode in REGION_CODE_TO_NAME) {
      return REGION_CODE_TO_NAME[regionCode];
    }

    return 'Unknown region';
  }

  static isCartSave(saveFile) {
    return ((saveFile.gameSerialCode === GAMESHARK_ACTIONREPLAY_CART_SAVE_GAME_SERIAL_CODE) || (saveFile.gameSerialCode === BLACKBAG_CART_SAVE_GAME_SERIAL_CODE));
  }
}
