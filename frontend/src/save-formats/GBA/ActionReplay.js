/*
The Action Replay data format is just a raw file with no header or footer.
*/

import SaveFilesUtil from '../../util/SaveFiles';

export default class ActionReplaySaveData {
  static createFromActionReplayData(actionReplayArrayBuffer) {
    return new ActionReplaySaveData(actionReplayArrayBuffer);
  }

  static createFromEmulatorData(emulatorArrayBuffer) {
    return new ActionReplaySaveData(emulatorArrayBuffer);
  }

  static createWithNewSize(actionReplaySaveData, newSize) {
    // Sometimes we may need to change the size of our raw buffer. This is because it's very difficult to determine
    // what the save game size is for a particular game and so some emulators get this wrong and there are many files
    // floating around the Internet that are the wrong size.
    //
    // So we can either truncate them (most likely), or pad them with zeros to make them the size
    // that the game/emulator actually expects.
    //
    // More information:
    // - https://zork.net/~st/jottings/GBA_saves.html
    // - https://dillonbeliveau.com/2020/06/05/GBA-FLASH.html

    const newRawSaveData = SaveFilesUtil.resizeRawSave(actionReplaySaveData.getRawSaveData(), newSize);

    return ActionReplaySaveData.createFromEmulatorData(newRawSaveData);
  }

  // This constructor creates a new object from a binary representation of a Action Replay save data file
  constructor(arrayBuffer) {
    this.rawSaveData = arrayBuffer;
  }

  getRawSaveData() {
    return this.rawSaveData;
  }

  getArrayBuffer() {
    return this.rawSaveData;
  }
}
