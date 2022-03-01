// Converts from the Sega Genesis and Master System format on the Wii NAND to something that can
// be used by an emulator like Gens/Kega Fusion
//
// Based on:
// - // https://github.com/JanErikGunnar/vcromclaim/blob/master/gensave.py
//
// The format is:
// 4 bytes: 'VCSD'
// 4 bytes: total size
// 4 or 5 bytes: magic number relating to the specific game the save is for
// 4 bytes: 'SRAM'
// 4 bytes: inner size
// if next bytes are 'compound data':
//   4 bytes: 'SRAM'
//   4 bytes: inner inner size
//   4 bytes: size of the save
// else the inner size above is the size of the save
// N bytes: save data
//
// The Genesis and Master System output is slightly different: just whether it's written out as
// shorts or bytes

const MAGIC = 'VCSD';
const SRAM = 'SRAM';
const COMPOUND_DATA = 'compound data'.concat(String.fromCharCode(0, 0, 0));
const CHARSET = 'US-ASCII';
const LITTLE_ENDIAN = true; // Little endian file inside a big endian file (the original Wii file written to an SD card)
const GENESIS_LITTLE_ENDIAN = false; // Big endian file inside a little endian file inside a big endian file :)

function seekEndOfString(desiredString, arrayBuffer, startingByteOffset, textDecoder) {
  let currentByte = startingByteOffset;

  while ((currentByte + desiredString.length) < arrayBuffer.byteLength) {
    const textArray = new Uint8Array(arrayBuffer.slice(currentByte, currentByte + desiredString.length));
    const text = textDecoder.decode(textArray);

    if (text === desiredString) {
      return currentByte + desiredString.length;
    }

    currentByte += 1;
  }

  return -1;
}

export default (arrayBuffer, platformType, saveType = 'SRAM') => {
  const textDecoder = new TextDecoder(CHARSET);
  const dataView = new DataView(arrayBuffer);
  let currentByte = 0;

  // First look for our MAGIC string

  currentByte = seekEndOfString(MAGIC, arrayBuffer, currentByte, textDecoder);

  if (currentByte < 0) {
    throw new Error(`Save appears corrupted: could not find magic string ${MAGIC}`);
  }

  // Then the total size

  const totalSize = dataView.getUint32(currentByte, LITTLE_ENDIAN);
  currentByte += 4;

  // Next is the SRAM string, which skips over the game-specific magic head value which may be 4 or 5 bytes

  const endOfSramByte = seekEndOfString(SRAM, arrayBuffer, currentByte, textDecoder);

  if (endOfSramByte < 0) {
    throw new Error(`Save appears corrupted: could not find string ${SRAM}`);
  }

  const headSize = endOfSramByte - currentByte - SRAM.length;
  currentByte = endOfSramByte;

  // Then is the inner size,

  const innerSize = dataView.getUint32(currentByte, LITTLE_ENDIAN);
  currentByte += 4;

  if (innerSize !== (totalSize - headSize - 4)) {
    throw new Error(`Save appears corrupted: found inner size ${innerSize} but total size found was ${totalSize} and head size was ${headSize}`);
  }

  let saveSize = innerSize;

  // Next may be the "compound data" block which is another series of sizes. If it's missing,
  // the inner size above is the actual save size and the save data is next

  const endOfCompoundDataByte = seekEndOfString(COMPOUND_DATA, arrayBuffer, currentByte, textDecoder);

  if (endOfCompoundDataByte >= 0) {
    currentByte = endOfCompoundDataByte;

    // We found a compound data block, so next we have the SRAM string again

    const endOfSram2Byte = seekEndOfString(SRAM, arrayBuffer, currentByte, textDecoder);

    if (endOfSram2Byte < 0) {
      throw new Error(`Save appears corrupted: could not find string ${SRAM} inside compound data`);
    }

    currentByte = endOfSram2Byte;

    // Then the inner inner size

    const innerInnerSize = dataView.getUint32(currentByte, LITTLE_ENDIAN);
    currentByte += 4;

    if (innerInnerSize !== (innerSize - COMPOUND_DATA.length - SRAM.length - 4)) {
      throw new Error(`Save appears corrupted: found inner inner size ${innerInnerSize} but inner size was ${innerSize}`);
    }

    // Then the actual save size

    saveSize = dataView.getUint32(currentByte, LITTLE_ENDIAN);
    currentByte += 4;

    if (saveSize !== (innerInnerSize - 4)) {
      throw new Error(`Save appears corrupted: found save size ${saveSize} but inner inner size was ${innerInnerSize}`);
    }
  }

  // Next we have the actual save data
  // Only read the number of bytes specified, because the actual file length may be padded out considerably

  if ((currentByte + saveSize) > arrayBuffer.byteLength) {
    throw new Error(`Save appears corrupted: found save size of ${saveSize} but there are only ${currentByte - arrayBuffer.byteLength} bytes remaining in file`);
  }

  // Master system data is as-is

  if (platformType === 'VC-SMS') {
    return {
      saveData: arrayBuffer.slice(currentByte, currentByte + saveSize),
      fileExtension: 'sav',
    };
  }

  // Genesis data may need a bit more finessing

  // Genesis SRAM/FRAM data needs to be converted from bytes into shorts
  // Genesis EEPROM data does not.

  let saveData = null;

  if ((saveType === 'SRAM') || (saveType === 'FRAM')) {
    saveData = new ArrayBuffer(saveSize * 2);

    const saveDataView = new DataView(saveData);

    for (let i = 0; i < saveSize; i += 1) {
      const n = dataView.getUint8(i + currentByte);
      saveDataView.setUint16(i * 2, n, GENESIS_LITTLE_ENDIAN);
    }
  } else {
    saveData = arrayBuffer.slice(currentByte, currentByte + saveSize);
  }

  return {
    saveData,
    fileExtension: 'srm',
  };
};
