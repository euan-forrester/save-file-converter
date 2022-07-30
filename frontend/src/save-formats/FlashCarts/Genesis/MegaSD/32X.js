import GenesisBase from './GenesisBase';
import GenesisUtil from '../../../../util/Genesis';

const MEGA_SD_NEW_STYLE_PADDING_BYTE_SRAM = 0x00; // Smaller sample size with the 32X files I was given, but all of them were padded with 0x00
const MEGA_SD_NEW_STYLE_PADDING_BYTE_EEPROM = 0x00;

const PLATFORM_INFO = {
  padding: {
    sram: MEGA_SD_NEW_STYLE_PADDING_BYTE_SRAM,
    eeprom: MEGA_SD_NEW_STYLE_PADDING_BYTE_EEPROM,
  },
  isEepromSave: GenesisUtil.is32xEepromSave,
};

export default class GenesisMegaSd32xFlashCartSaveData extends GenesisBase {
  static createFromRawData(rawArrayBuffer) {
    return super.createFromRawData(rawArrayBuffer, PLATFORM_INFO);
  }

  static createFromFlashCartData(flashCartArrayBuffer) {
    return super.createFromFlashCartData(flashCartArrayBuffer, PLATFORM_INFO);
  }

  static createWithNewSize(flashCartSaveData, newSize) {
    return super.createWithNewSize(flashCartSaveData, newSize, PLATFORM_INFO);
  }
}
