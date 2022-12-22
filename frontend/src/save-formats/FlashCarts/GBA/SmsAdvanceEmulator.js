/* eslint-disable no-bitwise */

// Find it at https://archive.org/details/smsadvance-25-bin

import EmulatorBase from './EmulatorBase';
import SmsRom from '../../../rom-formats/sms';
import Util from '../../../util/util';

const SMSADVANCE_MAGIC = 0x57A731DC; // SMS Advance save

const SMSADVANCE_CONFIG_DATA_SIZE_OFFSET = 0;
const SMSADVANCE_CONFIG_DATA_TYPE_OFFSET = 2;
const SMSADVANCE_CONFIG_DATA_DISPLAY_TYPE_OFFSET = 4;
const SMSADVANCE_CONFIG_DATA_GAMMA_VALUE_OFFSET = 5;
const SMSADVANCE_CONFIG_DATA_REGION_OFFSET = 6;
const SMSADVANCE_CONFIG_DATA_SLEEP_FLICK_OFFSET = 7;
const SMSADVANCE_CONFIG_DATA_CONFIG_OFFSET = 8;
const SMSADVANCE_CONFIG_DATA_BORDER_COLOR_OFFSET = 9;
const SMSADVANCE_CONFIG_DATA_SRAM_ROM_CHECKSUM_OFFSET = 12;
const SMSADVANCE_CONFIG_DATA_RESERVED_OFFSET = 20;
const SMSADVANCE_CONFIG_DATA_RESERVED_LENGTH = 32;
const SMSADVANCE_CONFIG_DATA_RESERVED_DATA = 'CFG';
const SMSADVANCE_CONFIG_DATA_RESERVED_ENCODING = 'US-ASCII';
const SMSADVANCE_CONFIG_DATA_LENGTH = SMSADVANCE_CONFIG_DATA_RESERVED_OFFSET + SMSADVANCE_CONFIG_DATA_RESERVED_LENGTH;

// These all read from sample save files
const SMSADVANCE_CONFIG_DATA_DEFAULT_DISPLAY_TYPE = 3;
const SMSADVANCE_CONFIG_DATA_DEFAULT_GAMMA_VALUE = 2;
const SMSADVANCE_CONFIG_DATA_DEFAULT_REGION = 0;
const SMSADVANCE_CONFIG_DATA_DEFAULT_SLEEP_FLICK = 0;
const SMSADVANCE_CONFIG_DATA_DEFAULT_CONFIG = 0x40;
const SMSADVANCE_CONFIG_DATA_DEFAULT_BORDER_COLOR = 0;

const GAME_TITLE = 'Made with savefileconverter.com'; // No game title is listed in an SMS ROM. The emulator appears to insert a filename of the ROM here, either when running in standalone mode or when integrated into the GBA OS

export default class SmsAdvanceEmulatorSaveData extends EmulatorBase {
  static GAME_TITLE = GAME_TITLE;

  static getMagic() {
    return SMSADVANCE_MAGIC;
  }

  static getConfigDataLength() {
    return SMSADVANCE_CONFIG_DATA_LENGTH;
  }

  static getFlashCartFileExtension() {
    return 'srm';
  }

  static getRawFileExtension() {
    return 'srm';
  }

  static createFromRawData(rawArrayBuffer, romArrayBuffer) {
    const romChecksum = super.calculateRomChecksum(romArrayBuffer);

    return super.createFromRawDataInternal(rawArrayBuffer, GAME_TITLE, romChecksum, SmsAdvanceEmulatorSaveData);
  }

  static createFromRawDataInternal(rawArrayBuffer, romChecksum) { // es-lint-disable  no-dupe-class-members (bug in eslint?)
    return super.createFromRawDataInternal(rawArrayBuffer, GAME_TITLE, romChecksum, SmsAdvanceEmulatorSaveData);
  }

  static createFromFlashCartData(flashCartArrayBuffer) {
    return new SmsAdvanceEmulatorSaveData(flashCartArrayBuffer);
  }

  static requiresRom() {
    return {
      clazz: SmsRom,
      requiredToConvert: ['convertToFormat'],
    };
  }

  // Based on https://github.com/libertyernie/goombasav/blob/master/goombasav.h#L85
  static createEmptyConfigDataArrayBuffer() {
    const arrayBuffer = new ArrayBuffer(SMSADVANCE_CONFIG_DATA_LENGTH);
    const dataView = new DataView(arrayBuffer);
    const uint8Array = new Uint8Array(arrayBuffer);

    const textEncoder = new TextEncoder(SMSADVANCE_CONFIG_DATA_RESERVED_ENCODING);

    uint8Array.fill(0);

    dataView.setUint16(SMSADVANCE_CONFIG_DATA_SIZE_OFFSET, SMSADVANCE_CONFIG_DATA_LENGTH, super.LITTLE_ENDIAN);
    dataView.setUint16(SMSADVANCE_CONFIG_DATA_TYPE_OFFSET, super.TYPE_CONFIG_DATA, super.LITTLE_ENDIAN);

    dataView.setUint8(SMSADVANCE_CONFIG_DATA_DISPLAY_TYPE_OFFSET, SMSADVANCE_CONFIG_DATA_DEFAULT_DISPLAY_TYPE);
    dataView.setUint8(SMSADVANCE_CONFIG_DATA_GAMMA_VALUE_OFFSET, SMSADVANCE_CONFIG_DATA_DEFAULT_GAMMA_VALUE);
    dataView.setUint8(SMSADVANCE_CONFIG_DATA_REGION_OFFSET, SMSADVANCE_CONFIG_DATA_DEFAULT_REGION);
    dataView.setUint8(SMSADVANCE_CONFIG_DATA_SLEEP_FLICK_OFFSET, SMSADVANCE_CONFIG_DATA_DEFAULT_SLEEP_FLICK);
    dataView.setUint8(SMSADVANCE_CONFIG_DATA_CONFIG_OFFSET, SMSADVANCE_CONFIG_DATA_DEFAULT_CONFIG);
    dataView.setUint8(SMSADVANCE_CONFIG_DATA_BORDER_COLOR_OFFSET, SMSADVANCE_CONFIG_DATA_DEFAULT_BORDER_COLOR);

    dataView.setUint32(SMSADVANCE_CONFIG_DATA_SRAM_ROM_CHECKSUM_OFFSET, 0, super.LITTLE_ENDIAN); // Checksum here gets set to 0 so that the file is "clean"

    const encodedReservedData = textEncoder.encode(SMSADVANCE_CONFIG_DATA_RESERVED_DATA).slice(0, SMSADVANCE_CONFIG_DATA_RESERVED_LENGTH - 1);

    uint8Array.set(encodedReservedData, SMSADVANCE_CONFIG_DATA_RESERVED_LENGTH);

    return arrayBuffer;
  }

  static getPlatformSramRomChecksumFromConfigData(arrayBuffer, currentByte) {
    const dataView = new DataView(arrayBuffer);

    return dataView.getUint32(currentByte + SMSADVANCE_CONFIG_DATA_SRAM_ROM_CHECKSUM_OFFSET, super.LITTLE_ENDIAN);
  }

  static concatEmulatorArrayBuffer(magicArrayBuffer, stateHeaderArrayBuffer, compressedSaveDataArrayBuffer, configDataArrayBuffer) {
    // From the test files I've made, when in standalone mode running ROMs directly from the GBA OS, the sections are arranged like this:
    // When running in bundled mode,where you create a .gba file on your PC that has all the ROMs bundled into it, it has the confi data after the magic
    return Util.concatArrayBuffers([magicArrayBuffer, stateHeaderArrayBuffer, compressedSaveDataArrayBuffer, configDataArrayBuffer]);
  }

  getUncompressedSize() {
    return this.rawArrayBuffer.byteLength; // Unlike PocketNES and Goomba, SMSAdvance stores the compressed size in the state header rather than the uncompressed size. So override this to return the correct number
  }
}
