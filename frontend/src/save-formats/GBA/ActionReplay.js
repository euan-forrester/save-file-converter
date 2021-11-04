/*
The Action Replay data format is just a raw file with no header or footer.
*/

export default class ActionReplaySaveData {
  static createFromActionReplayData(actionReplayArrayBuffer) {
    return new ActionReplaySaveData(actionReplayArrayBuffer);
  }

  static createFromEmulatorData(emulatorArrayBuffer) {
    return new ActionReplaySaveData(emulatorArrayBuffer);
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
