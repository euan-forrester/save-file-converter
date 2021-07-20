// Converts from the N64 format on the Wii NAND to something that's usable by N64 emulators like
// Mupen64Plus.
//
// Based on
// - https://github.com/JanErikGunnar/vcromclaim/blob/master/wiimetadata.py#L505
// - https://github.com/JanErikGunnar/vcromclaim/blob/master/n64save.py
//
// Looks like there's 2 possible save media for N64 games: SRAM and EEPROM, and different rules
// for how to interpret each one into something usable by an emulator

const EEPROM_SIZES = [4 * 1024, 16 * 1024];
const SRAM_SIZES_SRA = [32 * 1024];
const SRAM_SIZES_FLA = [128 * 1024, 256 * 1024];
const SRAM_SIZES = SRAM_SIZES_SRA.concat(SRAM_SIZES_FLA);

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
  const outputArrayBuffer = new ArrayBuffer(arrayBuffer.byteLength);
  const inputDataView = new DataView(arrayBuffer);
  const outputDataView = new DataView(outputArrayBuffer);

  if ((inputDataView.byteLength % 4) !== 0) {
    // Our check above should have already verified this, but adding it here as well
    // for defensiveness in case something changes
    throw new Error('N64 file size must be a multiple of 4 bytes');
  }

  for (let i = 0; i < inputDataView.byteLength / 4; i += 1) {
    const n = inputDataView.getUint32(i * 4, false);
    outputDataView.setUint32(i * 4, n, true);
  }

  return {
    saveData: outputArrayBuffer,
    fileExtension,
  };
}

function convertEeprom(arrayBuffer) {
  return {
    saveData: arrayBuffer.slice(2048),
    fileExtension: 'eep',
  };
}

export default (arrayBuffer) => {
  if (EEPROM_SIZES.indexOf(arrayBuffer.byteLength) >= 0) {
    return convertEeprom(arrayBuffer);
  }

  if (SRAM_SIZES.indexOf(arrayBuffer.byteLength) >= 0) {
    return convertSram(arrayBuffer);
  }

  throw new Error(`Unknown N64 save type with size = ${arrayBuffer.byteLength} bytes`);
};
