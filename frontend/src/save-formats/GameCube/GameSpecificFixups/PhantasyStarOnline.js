// Taken from https://github.com/dolphin-emu/dolphin/blob/059282df6f5a0f1671611fbd72de645916b526cd/Source/Core/Core/HW/GCMemcard/GCMemcard.cpp#L1123

export default class PhantasyStarOnlineFixups {
  static fixupSaveFile(saveFile /* , headerSerials */) {
    return saveFile;
  }
}
