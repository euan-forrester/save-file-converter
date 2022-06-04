import EmulatorBase from './EmulatorBase';

const GOOMBA_MAGIC = 0x57A731D8; // Goomba (GB/GBC) save

export default class GoombaEmulatorSaveData extends EmulatorBase {
  static getMagic() {
    return GOOMBA_MAGIC;
  }

  static createFromRawData(rawArrayBuffer, romArrayBuffer) {
    return super.createFromRawData(rawArrayBuffer, romArrayBuffer, GoombaEmulatorSaveData);
  }

  static createFromRawDataInternal(rawArrayBuffer, romInternalName, romChecksum) {
    return super.createFromRawDataInternal(rawArrayBuffer, romInternalName, romChecksum, GoombaEmulatorSaveData);
  }

  static createFromFlashCartData(goombaArrayBuffer) {
    return new GoombaEmulatorSaveData(goombaArrayBuffer);
  }
}
