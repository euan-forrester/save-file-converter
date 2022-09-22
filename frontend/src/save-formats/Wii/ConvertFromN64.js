// Converts from the N64 format on the Wii NAND to something that's usable by N64 emulators like
// Mupen64Plus.
//
// Based on
// - https://github.com/JanErikGunnar/vcromclaim/blob/master/wiimetadata.py#L505
// - https://github.com/JanErikGunnar/vcromclaim/blob/master/n64save.py
//
// Looks like there's 2 possible save media for N64 games: SRAM and EEPROM, and different rules
// for how to interpret each one into something usable by an emulator

// Check out this list of known saving types for N64 games:
// - http://micro-64.com/database/gamesave.shtml
//
// It lists:
// - Controller Pak: 32kB SRAM
// - 0.5kB EEPROM
// - 2kB EEPROM
// - 32kB SRAM
// - 128kB Flash RAM
// - 96kB SRAM (one game only: Dezaemon 3D, which wasn't on Virtual Console and was Japan-only)

import N64Util from '../../util/N64';

const EEPROM_SIZES = [4 * 1024, 16 * 1024];
const SRAM_SIZES_SRA = [32 * 1024];
const SRAM_SIZES_FLA = [128 * 1024, 256 * 1024];
const SRAM_SIZES = SRAM_SIZES_SRA.concat(SRAM_SIZES_FLA);
const ALL_SIZES = EEPROM_SIZES.concat(SRAM_SIZES);

function convertSram(arrayBuffer) {
  let fileExtension = null;

  // Choose the file extension

  if (SRAM_SIZES_SRA.indexOf(arrayBuffer.byteLength) >= 0) {
    fileExtension = 'sra';
  } else if (SRAM_SIZES_FLA.indexOf(arrayBuffer.byteLength) >= 0) {
    fileExtension = 'fla';
  } else {
    throw new Error(`Unknown N64 SRAM file size = ${arrayBuffer.byteLength} bytes`);
  }

  // Byte swap from big endian to little endian

  return {
    saveData: N64Util.endianSwap(arrayBuffer, 'bigToLittleEndian'),
    fileExtension,
  };
}

function convertEeprom(arrayBuffer) {
  return {
    saveData: arrayBuffer.slice(0, 2048),
    fileExtension: 'eep',
  };
}

export default (arrayBuffer, fileName) => {
  let truncatedArrayBuffer = arrayBuffer;

  // Some N64 saves have this strange internal filename. We need to truncate the file to
  // the nearest legit size:
  // https://forums.dolphin-emu.org/archive/index.php?thread-35067-95.html
  if (fileName === 'RAM_NMFE') {
    for (let i = ALL_SIZES.length - 1; i >= 0; i -= 1) {
      if (ALL_SIZES[i] < arrayBuffer.byteLength) {
        truncatedArrayBuffer = arrayBuffer.slice(0, ALL_SIZES[i]);
        break;
      }
    }
  }

  // In the code we got this from, they decide the type of file based on its size.
  // However, the filename stored inside the Wii save also seems to hint at the type.
  // We're going to use the size for now just because that's how the other code did it,
  // but if it leads to problems then consider keying off the name instead.
  //
  // Hmmm Paper Mario uses Flash RAM, and so needs a .fla extension, but the filename begins with "EEP_".
  // Mario Kart 64 uses a Controller Pak SRAM save, but the filename also begins with "EEP_".

  if (EEPROM_SIZES.indexOf(truncatedArrayBuffer.byteLength) >= 0) {
    return convertEeprom(truncatedArrayBuffer);
  }

  if (SRAM_SIZES.indexOf(truncatedArrayBuffer.byteLength) >= 0) {
    return convertSram(truncatedArrayBuffer);
  }

  throw new Error(`Unknown N64 save type with size = ${arrayBuffer.byteLength} bytes`);
};
