import GenesisBase from './GenesisBase';

const MEGA_SD_NEW_STYLE_PADDING_BYTE_SRAM = 0x00; // 3/4 of the new style files I was given were padded with 0x00 but one was 0xFF
const MEGA_SD_NEW_STYLE_PADDING_BYTE_EEPROM = 0xFF; // The example new style eeprom save was padded with 0xFF

const PLATFORM_INFO = {
  padding: {
    sram: MEGA_SD_NEW_STYLE_PADDING_BYTE_SRAM,
    eeprom: MEGA_SD_NEW_STYLE_PADDING_BYTE_EEPROM,
  },
};

export default class GenesisMegaSdGenesisFlashCartSaveData extends GenesisBase {
  static createFromRawData(rawArrayBuffer) {
    return super.createFromRawData(rawArrayBuffer, PLATFORM_INFO);
  }

  static createFromFlashCartData(flashCartArrayBuffer) {
    return super.createFromFlashCartData(flashCartArrayBuffer);
  }

  static createWithNewSize(flashCartSaveData, newSize) {
    return super.createWithNewSize(flashCartSaveData, newSize, PLATFORM_INFO);
  }
}
