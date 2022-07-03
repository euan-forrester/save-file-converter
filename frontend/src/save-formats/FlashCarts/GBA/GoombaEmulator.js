// Find it at https://github.com/Dwedit/goombacolor/releases

import EmulatorBase from './EmulatorBase';
import Util from '../../../util/util';
import GbRom from '../../../rom-formats/gb';

const GOOMBA_MAGIC = 0x57A731D8; // Goomba (GB/GBC) save

const GOOMBA_CONFIG_DATA_SIZE_OFFSET = 0;
const GOOMBA_CONFIG_DATA_TYPE_OFFSET = 2;
const GOOMBA_CONFIG_DATA_BORDER_COLOR_OFFSET = 4;
const GOOMBA_CONFIG_DATA_PALETTE_BANK_OFFSET = 5;
const GOOMBA_CONFIG_DATA_SRAM_ROM_CHECKSUM_OFFSET = 8;
const GOOMBA_CONFIG_DATA_RESERVED_OFFSET = 16;
const GOOMBA_CONFIG_DATA_RESERVED_LENGTH = 32;
const GOOMBA_CONFIG_DATA_RESERVED_DATA = 'CFG';
const GOOMBA_CONFIG_DATA_RESERVED_ENCODING = 'US-ASCII';
const GOOMBA_CONFIG_DATA_LENGTH = GOOMBA_CONFIG_DATA_RESERVED_OFFSET + GOOMBA_CONFIG_DATA_RESERVED_LENGTH;

const GOOMBA_CONFIG_DATA_DEFAULT_BORDER_COLOR = 0;
const GOOMBA_CONFIG_DATA_DEFAULT_PALETTE_BANK = 0;

export default class GoombaEmulatorSaveData extends EmulatorBase {
  static getMagic() {
    return GOOMBA_MAGIC;
  }

  static getConfigDataLength() {
    return GOOMBA_CONFIG_DATA_LENGTH;
  }

  static createFromRawData(rawArrayBuffer, romArrayBuffer) {
    const gbRom = new GbRom(romArrayBuffer);

    const romInternalName = gbRom.getInternalName();
    const romChecksum = super.calculateRomChecksum(gbRom.getRomArrayBuffer());

    return super.createFromRawDataInternal(rawArrayBuffer, romInternalName, romChecksum, GoombaEmulatorSaveData);
  }

  static createFromRawDataInternal(rawArrayBuffer, romInternalName, romChecksum) {
    return super.createFromRawDataInternal(rawArrayBuffer, romInternalName, romChecksum, GoombaEmulatorSaveData);
  }

  static createFromFlashCartData(goombaArrayBuffer) {
    return new GoombaEmulatorSaveData(goombaArrayBuffer);
  }

  static requiresRomClass() {
    return GbRom;
  }

  // Based on https://github.com/libertyernie/goombasav/blob/master/goombasav.h#L61
  static createEmptyConfigDataArrayBuffer() {
    const arrayBuffer = new ArrayBuffer(GOOMBA_CONFIG_DATA_LENGTH);
    const dataView = new DataView(arrayBuffer);
    const uint8Array = new Uint8Array(arrayBuffer);

    const textEncoder = new TextEncoder(GOOMBA_CONFIG_DATA_RESERVED_ENCODING);

    uint8Array.fill(0);

    dataView.setUint16(GOOMBA_CONFIG_DATA_SIZE_OFFSET, GOOMBA_CONFIG_DATA_LENGTH, super.LITTLE_ENDIAN);
    dataView.setUint16(GOOMBA_CONFIG_DATA_TYPE_OFFSET, super.TYPE_CONFIG_DATA, super.LITTLE_ENDIAN);
    dataView.setUint8(GOOMBA_CONFIG_DATA_BORDER_COLOR_OFFSET, GOOMBA_CONFIG_DATA_DEFAULT_BORDER_COLOR);
    dataView.setUint8(GOOMBA_CONFIG_DATA_PALETTE_BANK_OFFSET, GOOMBA_CONFIG_DATA_DEFAULT_PALETTE_BANK);
    dataView.setUint32(GOOMBA_CONFIG_DATA_SRAM_ROM_CHECKSUM_OFFSET, 0, super.LITTLE_ENDIAN); // Checksum here gets set to 0 so that the file is "clean"

    const encodedReservedData = textEncoder.encode(GOOMBA_CONFIG_DATA_RESERVED_DATA).slice(0, GOOMBA_CONFIG_DATA_RESERVED_LENGTH - 1);

    uint8Array.set(encodedReservedData, GOOMBA_CONFIG_DATA_RESERVED_LENGTH);

    return arrayBuffer;
  }

  static getPlatformSramRomChecksumFromConfigData(arrayBuffer, currentByte) {
    const dataView = new DataView(arrayBuffer);

    return dataView.getUint32(currentByte + GOOMBA_CONFIG_DATA_SRAM_ROM_CHECKSUM_OFFSET, super.LITTLE_ENDIAN);
  }

  static concatEmulatorArrayBuffer(magicArrayBuffer, stateHeaderArrayBuffer, compressedSaveDataArrayBuffer, configDataArrayBuffer) {
    return Util.concatArrayBuffers([magicArrayBuffer, stateHeaderArrayBuffer, compressedSaveDataArrayBuffer, configDataArrayBuffer]);
  }
}
