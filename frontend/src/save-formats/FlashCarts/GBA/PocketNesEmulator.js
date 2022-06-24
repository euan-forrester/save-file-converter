// Find it at https://github.com/Dwedit/PocketNES/releases

import EmulatorBase from './EmulatorBase';
import NesRom from '../../../rom-formats/nes';

const POCKETNES_MAGIC = 0x57A731D7; // Pocket NES save

const POCKETNES_CONFIG_DATA_SIZE_OFFSET = 0;
const POCKETNES_CONFIG_DATA_TYPE_OFFSET = 2;
const POCKETNES_CONFIG_DATA_DISPLAY_TYPE_OFFSET = 4;
const POCKETNES_CONFIG_DATA_SRAM_ROM_CHECKSUM_OFFSET = 8;
const POCKETNES_CONFIG_DATA_RESERVED_OFFSET = 16;
const POCKETNES_CONFIG_DATA_RESERVED_LENGTH = 32;
const POCKETNES_CONFIG_DATA_RESERVED_DATA = 'CFG';
const POCKETNES_CONFIG_DATA_RESERVED_ENCODING = 'US-ASCII';
const POCKETNES_CONFIG_DATA_LENGTH = POCKETNES_CONFIG_DATA_RESERVED_OFFSET + POCKETNES_CONFIG_DATA_RESERVED_LENGTH;

const POCKETNES_CONFIG_DATA_DEFAULT_DISPLAY_TYPE = 0;

const GAME_TITLE = 'SAVE'; // No game title is listed in an NES ROM, so everything is just called this

export default class PocketNesEmulatorSaveData extends EmulatorBase {
  static GAME_TITLE = GAME_TITLE;

  static getMagic() {
    return POCKETNES_MAGIC;
  }

  static getConfigDataLength() {
    return POCKETNES_CONFIG_DATA_LENGTH;
  }

  static createFromRawData(rawArrayBuffer, romArrayBuffer) {
    return super.createFromRawData(rawArrayBuffer, romArrayBuffer, PocketNesEmulatorSaveData);
  }

  static createFromRawDataInternal(rawArrayBuffer, romChecksum) {
    return super.createFromRawDataInternal(rawArrayBuffer, GAME_TITLE, romChecksum, PocketNesEmulatorSaveData);
  }

  static createFromFlashCartData(pocketNesArrayBuffer) {
    return new PocketNesEmulatorSaveData(pocketNesArrayBuffer);
  }

  // Based on https://github.com/libertyernie/POCKETNESsav/blob/master/POCKETNESsav.h#L73
  static createEmptyConfigDataArrayBuffer() {
    const arrayBuffer = new ArrayBuffer(POCKETNES_CONFIG_DATA_LENGTH);
    const dataView = new DataView(arrayBuffer);
    const uint8Array = new Uint8Array(arrayBuffer);

    const textEncoder = new TextEncoder(POCKETNES_CONFIG_DATA_RESERVED_ENCODING);

    uint8Array.fill(0);

    dataView.setUint16(POCKETNES_CONFIG_DATA_SIZE_OFFSET, POCKETNES_CONFIG_DATA_LENGTH, super.LITTLE_ENDIAN);
    dataView.setUint16(POCKETNES_CONFIG_DATA_TYPE_OFFSET, super.TYPE_CONFIG_DATA, super.LITTLE_ENDIAN);
    dataView.setUint8(POCKETNES_CONFIG_DATA_DISPLAY_TYPE_OFFSET, POCKETNES_CONFIG_DATA_DEFAULT_DISPLAY_TYPE);
    dataView.setUint32(POCKETNES_CONFIG_DATA_SRAM_ROM_CHECKSUM_OFFSET, 0, super.LITTLE_ENDIAN); // Checksum here gets set to 0 so that the file is "clean"

    const encodedReservedData = textEncoder.encode(POCKETNES_CONFIG_DATA_RESERVED_DATA).slice(0, POCKETNES_CONFIG_DATA_RESERVED_LENGTH - 1);

    uint8Array.set(encodedReservedData, POCKETNES_CONFIG_DATA_RESERVED_LENGTH);

    return arrayBuffer;
  }

  static getPlatformSramRomChecksumFromConfigData(arrayBuffer, currentByte) {
    const dataView = new DataView(arrayBuffer);

    return dataView.getUint32(currentByte + POCKETNES_CONFIG_DATA_SRAM_ROM_CHECKSUM_OFFSET, super.LITTLE_ENDIAN);
  }

  static calculateRomChecksum(romArrayBuffer) {
    // It's tricky to determine where the ROM "starts":
    //
    // When the emulator returns a pointer to the ROM, it includes the romheader struct: https://github.com/Dwedit/PocketNES/blob/master/src/rommenu.c#L281
    // When the emulator calculates the checksum of the ROM, it moves past the romheader struct, plus 16 bytes (which is the length of the header in the ROM file): https://github.com/Dwedit/PocketNES/blob/master/src/sram.c#L495
    //
    // So here we will calculate the checksum of the file after the header

    const nesRom = new NesRom(romArrayBuffer);

    return super.calculateRomChecksum(nesRom.getRomArrayBufferWithoutHeader());
  }
}
