// All values are in bytes
// Not guaranteed to be correct: may have missing/estra values! Most of this is guesses

export default {
  nes: [
    512,
    1024,
    2048,
    4096,
    8192,
    16384,
    32768, // The usual max size of files that the MiSTer NES core will generate
    65536,
    131072, // The MiSTer NES core will sometimes generate files this big, so maybe some games require them?
  ],
  snes: [
    512,
    1024,
    2048,
    4096,
    8192,
    16384,
    32768,
    65536,
    131072,
  ],
  n64: [
    // From http://micro-64.com/database/gamesave.shtml
    512,
    2048,
    32768,
    131072,
    786432, // Dezaemon 3D
  ],
  gb: [
    512,
    1024,
    2048,
    4096,
    8192,
    16384,
    32768,
    65536,
  ],
  gba: [
    512,
    8192,
    16384,
    32768,
    65536,
    131072,
  ],
  gamegear: [
    512,
    1024,
    2048,
    4096,
    8192,
    16384,
    32768,
    65536,
  ],
  sms: [
    512,
    1024,
    2048,
    4096,
    8192,
    16384,
    32768,
    65536,
  ],
  genesis: [
    64, // On the Mega SD, Wonder Boy in Monster World only uses this much data (although it's padded out to be much larger)
    128, // Wonder Boy in Monster World (uses EEPROM to save). Files created by the GenesisPlus emulator and Mega Everdrive Pro are this big
    256,
    512,
    1024,
    2048,
    4096,
    8192,
    16384,
    32768,
    65536, // Genesis files on the MiSTer are all padded out to be 64k, so maybe that's the max size?
    131072, // But if we byte-expand that largest file inappropriately we end up with sometyhing this big, and we shouldn't show blank in the output size dropdown
  ],
};
