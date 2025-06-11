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

export default class N64GameSerialCodeUtil {
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
}
