/* eslint-disable no-bitwise */

// Taken from https://github.com/dolphin-emu/dolphin/blob/059282df6f5a0f1671611fbd72de645916b526cd/Source/Core/Core/HW/GCMemcard/GCMemcard.cpp#L1123

import GameCubeBasics from '../Components/Basics';

import Util from '../../../util/util';

const { BLOCK_SIZE, LITTLE_ENDIAN } = GameCubeBasics;

const FILENAME_TO_EXTRA_CHECKSUM_LENGTH = new Map([
  ['PSO_SYSTEM', 0],
  ['PSO3_SYSTEM', 0x10],
]);

const CRC32_LOOK_UP_TABLE_SIZE = 256;
const CRC32_LOOK_UP_TABLE = new Array(CRC32_LOOK_UP_TABLE_SIZE);

function initializeCrc32LookUpTable() {
  let checksum = 0;

  for (let i = 0; i < CRC32_LOOK_UP_TABLE_SIZE; i += 1) {
    checksum = i;
    for (let j = 8; j > 0; j -= 1) {
      if ((checksum & 1) !== 0) {
        checksum = (checksum >> 1) ^ 0xEDB88320;
      } else {
        checksum >>= 1;
      }
    }

    CRC32_LOOK_UP_TABLE[i] = checksum;
  }
}

initializeCrc32LookUpTable();

export default class PhantasyStarOnlineFixups {
  static fixupSaveFile(saveFile, headerSerials) {
    // Make sure that we've got the right file

    if (!FILENAME_TO_EXTRA_CHECKSUM_LENGTH.has(saveFile.fileName)) {
      return saveFile;
    }

    // We've got the right file, so let's begin fixing it up

    const fixedSaveFile = {
      ...saveFile,
      rawData: Util.copyArrayBuffer(saveFile.rawData),
    };

    const saveFileRawDataView = new DataView(fixedSaveFile.rawData);
    const saveFileRawDataUint8Array = new Uint8Array(fixedSaveFile.rawData);

    // Set the new serial numbers

    saveFileRawDataView.setUint32(1 * BLOCK_SIZE + 0x0158, headerSerials.serial1, LITTLE_ENDIAN); // Deconstruct the offsets to make it easier to check this code against Dolphin's
    saveFileRawDataView.setUint32(1 * BLOCK_SIZE + 0x015C, headerSerials.serial2, LITTLE_ENDIAN);

    // Calculate our new checksum

    const extraChecksumLength = FILENAME_TO_EXTRA_CHECKSUM_LENGTH.get(fixedSaveFile.fileName);

    let checksum = 0xDEBB20E3;

    for (let i = 0x004C; i < (0x0164 + extraChecksumLength); i += 1) {
      checksum = ((checksum >> 8) & 0xFFFFFF) ^ CRC32_LOOK_UP_TABLE[(checksum ^ saveFileRawDataUint8Array[1 * BLOCK_SIZE + i]) % CRC32_LOOK_UP_TABLE_SIZE];
    }

    saveFileRawDataView.setUint32(1 * BLOCK_SIZE + 0x0048, checksum & 0xFFFFFFFF, LITTLE_ENDIAN);

    return fixedSaveFile;
  }
}
