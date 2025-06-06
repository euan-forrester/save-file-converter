// All values are in bytes
// Not guaranteed to be correct: may have missing/estra values! Most of this is guesses

const PLATFORM_SAVE_SIZES = {
  nes: [
    512,
    1024,
    2048,
    4096,
    8192,
    16384,
    32768, // The usual max size of files that the MiSTer NES core will generate
    65536,
    131072, // The MiSTer NES core and N64 Everdrive NES core will sometimes generate files this big, so maybe some games require them?
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
  segacd: [
    // From https://segaretro.org/CD_BackUp_RAM_Cart
    // The internal backup RAM is fixed at 8kB, the external (cart) backup RAM can be any size
    8192,
    16384,
    32768,
    65536,
    131072,
    262144,
    524288,
  ],
  gamecube: [
    // From https://github.com/dolphin-emu/dolphin/blob/53b54406bd546b507822a3bd30311aa0cd96ee71/Source/Core/Core/HW/GCMemcard/GCMemcard.cpp#L95
    // Offical sizes are listed here: https://en.wikipedia.org/wiki/GameCube#Hardware
    524288, // 4 megabits (59 blocks)
    1048576, // 8 megabits (123 blocks)
    2097152, // 16 megabits (251 blocks)
    4194304, // 32 megabits (507 blocks)
    8388608, // 64 megabits (1019 blocks)
    16777216, // 128 megabits (2043 blocks)
  ],
};

// These are for memory card images and not cartridges
const OMIT_FROM_ALL_SIZES = [
  'segacd',
  'gamecube',
];

const ALL_SIZES_KEYS = Object.keys(PLATFORM_SAVE_SIZES).filter((key) => !OMIT_FROM_ALL_SIZES.includes(key));

const ALL_SIZES = ALL_SIZES_KEYS.reduce((accumulator, currentPlatform) => { accumulator.push(...PLATFORM_SAVE_SIZES[currentPlatform]); return accumulator; }, []);
const ALL_SIZES_NO_DUPLICATES_SORTED = [...new Set(ALL_SIZES)].sort((a, b) => a - b);

PLATFORM_SAVE_SIZES.all = ALL_SIZES_NO_DUPLICATES_SORTED;

export default PLATFORM_SAVE_SIZES;
