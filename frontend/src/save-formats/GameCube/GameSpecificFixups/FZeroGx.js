/* eslint-disable no-bitwise */

// Taken from https://github.com/dolphin-emu/dolphin/blob/059282df6f5a0f1671611fbd72de645916b526cd/Source/Core/Core/HW/GCMemcard/GCMemcard.cpp#L1068

import GameCubeBasics from '../Components/Basics';

const { BLOCK_SIZE, LITTLE_ENDIAN } = GameCubeBasics;

const CHECKSUM_OFFSET = 0;
const CHECKSUM_LENGTH = 2;

export default class FZeroGxFixups {
  static fixupSaveFile(saveFile, headerSerials) {
    // Make sure that we've got the right file and it's the right length

    if (saveFile.fileName !== 'f_zero.dat') {
      return saveFile;
    }

    if (Math.ceil(saveFile.rawData.byteLength / BLOCK_SIZE) !== 4) {
      return saveFile;
    }

    // We've got the right file, so let's begin fixing it up

    const saveFileRawDataView = new DataView(saveFile.rawData);
    const saveFileRawDataUint8Array = new Uint8Array(saveFile.rawData);

    // Set the new serial numbers

    saveFileRawDataView.setUint16(1 * BLOCK_SIZE + 0x0066, (headerSerials.serial1 >> 16) & 0XFFFF, LITTLE_ENDIAN); // Deconstruct the offsets to make it easier to check this code against Dolphin's
    saveFileRawDataView.setUint16(3 * BLOCK_SIZE + 0x1580, (headerSerials.serial2 >> 16) & 0XFFFF, LITTLE_ENDIAN);
    saveFileRawDataView.setUint16(1 * BLOCK_SIZE + 0x0060, headerSerials.serial1 & 0xFFFF, LITTLE_ENDIAN);
    saveFileRawDataView.setUint16(1 * BLOCK_SIZE + 0x0200, headerSerials.serial2 & 0xFFFF, LITTLE_ENDIAN);

    // Calculate a new 16 bit checksum

    let checksum = 0xFFFF;

    for (let i = CHECKSUM_OFFSET + CHECKSUM_LENGTH; i < saveFile.rawData.byteLength; i += 1) {
      checksum ^= saveFileRawDataUint8Array[i];

      for (let j = 8; j > 0; j -= 1) {
        if ((checksum & 1) !== 0) {
          checksum = (checksum >> 1) ^ 0x8408;
        } else {
          checksum >>= 1;
        }
      }
    }

    // Set the new checksum

    saveFileRawDataView.setUint16(CHECKSUM_OFFSET, (~checksum) & 0xFFFF, LITTLE_ENDIAN);

    return saveFile;
  }
}
