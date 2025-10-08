/* eslint-disable no-bitwise */

/*
The standard format for individual saves on the Dreamcast appears to be the .VMI/.VMS file pair. The .VMI file contains
the file metadata while the .VMS file contains the actual file data

.VMI file structure
0x00-0x03: Checksum
0x04-0x23: Description (padded with spaces)
0x24-0x43: Copyright (padded with spaces)
0x44-0x4B: Timestamp
0x4C-0x4D: Version
0x4E-0x4F: File number
0x50-0x57: Resource name
0x58-0x63: Filename
0x64-0x65: File mode
0x66-0x67: Padding
0x68-0x6B: File size
*/

import DreamcastBasics from '../Components/Basics';
import DreamcastDirectoryEntry from '../Components/DirectoryEntry';
import DreamcastUtil from '../Util';
import Util from '../../../util/util';

const {
  LITTLE_ENDIAN,
  BLOCK_SIZE,
  FILE_TYPE_DATA,
  FILE_TYPE_GAME,
} = DreamcastBasics;

const ENCODING = 'shift-jis'; // https://github.com/gyrovorbis/libevmu/blob/9d1bf63983d40b81b03ac0bcf887a9a3c114ed86/lib/api/evmu/fs/evmu_vmi.h#L80

// Based on https://mc.pp.se/dc/vms/vmi.html
// Same struct found here: https://github.com/gyrovorbis/libevmu/blob/libgimbal-refactor/lib/api/evmu/fs/evmu_vmi.h#L86
// Same struct found here: https://github.com/bucanero/dc-save-converter/blob/master/vmufs.h#L44
// Same struct found here: https://github.com/DC-SWAT/DreamShell/blob/0eb2ebe888b31438a131f20ec15abdd66964505a/applications/vmu_manager/modules/module.c#L149

const HEADER_LENGTH = 108;

const CHECKSUM_OFFSET = 0;
const CHECKSUM_LITTLE_ENDIAN = false; // The checksum isn't really a number per se, but instead the combination of 2 strings so it's better read from left to right
const CHECKSUM_MASK = 'SEGA';
const DESCRIPTION_OFFSET = 0x04;
const DESCRIPTION_LENGTH = 32;
const COPYRIGHT_OFFSET = 0x24;
const COPYRIGHT_LENGTH = 32;
const TIMESTAMP_OFFSET = 0x44;
const VERSION_OFFSET = 0x4C;
const FILE_NUMBER_OFFSET = 0x4E;
const RESOURCE_NAME_OFFSET = 0x50;
const RESOURCE_NAME_LENGTH = 8;
const FILE_NAME_OFFSET = 0x58;
const FILE_NAME_LENGTH = 12;
const FILE_MODE_OFFSET = 0x64;
const FILE_SIZE_OFFSET = 0x68;

const FILE_MODE_GAME = 0x02;
const FILE_MODE_COPY_PROTECTED = 0x01;

const DEFAULT_HEADER_FILL_VALUE = 0x00;

const DEFAULT_VERSION = 0; // Not sure what this represents. Most files I've seen have 0 here
const DEFAULT_FILE_NUMBER = 1; // Not sure what this represents. Most files I've seen have 1 here

const DEFAULT_FIRST_BLOCK_NUMBER = 0; // Doesn't matter: the concept of where the save is located doesn't mean anything in this format

const HEADER_BLOCK_NUMBER_FOR_DATA = 0; // For save data, the header block is the first one
const HEADER_BLOCK_NUMBER_FOR_GAME = 1; // But for minigames it's in block 1 because "block 0 of mini games had to have IRQ code so it can’t have that header": https://github.com/gyrovorbis/libevmu/blob/libgimbal-refactor/lib/api/evmu/fs/evmu_fs_utils.h#L76

// Based on https://github.com/bucanero/dc-save-converter/blob/a19fc3361805358d474acd772cdb20a328453d5b/dcvmu.cpp#L428
function calculateChecksum(resourceName) {
  let checksum = 0;
  let currentChar = 0;

  do {
    checksum <<= 8;
    checksum |= (resourceName.charCodeAt(currentChar) & CHECKSUM_MASK.charCodeAt(currentChar));
    currentChar += 1;
  } while (currentChar < CHECKSUM_MASK.length);

  return checksum;
}

export default class DreamcastVmiVmsSaveData {
  static FILE_MODE_GAME = FILE_MODE_GAME;

  static FILE_MODE_COPY_PROTECTED = FILE_MODE_COPY_PROTECTED;

  // saveFile needs to set the additional fields:
  // - description
  // - copyright
  // - resourceName
  static convertSaveFileToVmiVms(saveFile) {
    let vmiArrayBuffer = Util.getFilledArrayBuffer(HEADER_LENGTH, DEFAULT_HEADER_FILL_VALUE);
    const vmsArrayBuffer = saveFile.rawData;

    vmiArrayBuffer = Util.setString(vmiArrayBuffer, DESCRIPTION_OFFSET, saveFile.description, ENCODING, DESCRIPTION_LENGTH);
    vmiArrayBuffer = Util.setString(vmiArrayBuffer, COPYRIGHT_OFFSET, saveFile.copyright, ENCODING, COPYRIGHT_LENGTH);
    vmiArrayBuffer = Util.setString(vmiArrayBuffer, RESOURCE_NAME_OFFSET, saveFile.resourceName, ENCODING, RESOURCE_NAME_LENGTH);
    vmiArrayBuffer = Util.setString(vmiArrayBuffer, FILE_NAME_OFFSET, saveFile.filename, ENCODING, FILE_NAME_LENGTH);
    vmiArrayBuffer = DreamcastUtil.writeTimestamp(vmiArrayBuffer, TIMESTAMP_OFFSET, saveFile.fileCreationTime);

    const vmiDataView = new DataView(vmiArrayBuffer);

    const checksum = calculateChecksum(saveFile.resourceName);

    let fileMode = 0;

    if (saveFile.copyProtected) {
      fileMode |= FILE_MODE_COPY_PROTECTED;
    }

    if (saveFile.fileType === FILE_TYPE_GAME) {
      fileMode |= FILE_MODE_GAME;
    }

    vmiDataView.setUint32(CHECKSUM_OFFSET, checksum, CHECKSUM_LITTLE_ENDIAN);
    vmiDataView.setUint16(VERSION_OFFSET, DEFAULT_VERSION, LITTLE_ENDIAN);
    vmiDataView.setUint16(FILE_NUMBER_OFFSET, DEFAULT_FILE_NUMBER, LITTLE_ENDIAN);
    vmiDataView.setUint16(FILE_MODE_OFFSET, fileMode, LITTLE_ENDIAN);
    vmiDataView.setUint32(FILE_SIZE_OFFSET, vmsArrayBuffer.byteLength, LITTLE_ENDIAN);

    return {
      vmiArrayBuffer,
      vmsArrayBuffer,
    };
  }

  // Based on https://github.com/bucanero/dc-save-converter/blob/a19fc3361805358d474acd772cdb20a328453d5b/dcvmu.cpp#L388
  static convertIndividualSaveToSaveFile(vmiArrayBuffer, vmsArrayBuffer) {
    if (vmiArrayBuffer.byteLength !== HEADER_LENGTH) {
      throw new Error('This does not appear to be a Dreamcast individual save: header is the wrong size');
    }

    const vmiDataView = new DataView(vmiArrayBuffer);
    const vmiUint8Array = new Uint8Array(vmiArrayBuffer);

    // Read what's stored in the file

    const checksum = vmiDataView.getUint32(CHECKSUM_OFFSET, CHECKSUM_LITTLE_ENDIAN);
    const description = Util.readNullTerminatedString(vmiUint8Array, DESCRIPTION_OFFSET, ENCODING, DESCRIPTION_LENGTH);
    const copyright = Util.readNullTerminatedString(vmiUint8Array, COPYRIGHT_OFFSET, ENCODING, COPYRIGHT_LENGTH);
    const fileCreationTime = DreamcastUtil.readTimestamp(vmiArrayBuffer, TIMESTAMP_OFFSET);
    const version = vmiDataView.getUint16(VERSION_OFFSET, LITTLE_ENDIAN);
    const fileNumber = vmiDataView.getUint16(FILE_NUMBER_OFFSET, LITTLE_ENDIAN);
    const resourceName = Util.readNullTerminatedString(vmiUint8Array, RESOURCE_NAME_OFFSET, ENCODING, RESOURCE_NAME_LENGTH);
    const filename = Util.readNullTerminatedString(vmiUint8Array, FILE_NAME_OFFSET, ENCODING, FILE_NAME_LENGTH);
    const fileMode = vmiDataView.getUint16(FILE_MODE_OFFSET, LITTLE_ENDIAN);
    const fileSize = vmiDataView.getUint32(FILE_SIZE_OFFSET, LITTLE_ENDIAN);

    if (fileSize !== vmsArrayBuffer.byteLength) {
      throw new Error(`This does not appear to be a Dreamcast individual save: file size in header ${fileSize} does not match .VMS file size ${vmsArrayBuffer.byteLength}`);
    }

    // Calculate the parts common to all dreamcast saves

    const isGame = ((fileMode & FILE_MODE_GAME) !== 0);

    const fileSizeInBlocks = Math.ceil(fileSize / BLOCK_SIZE);
    const firstBlockNumber = DEFAULT_FIRST_BLOCK_NUMBER;
    const fileType = isGame ? FILE_TYPE_GAME : FILE_TYPE_DATA;
    const copyProtected = ((fileMode & FILE_MODE_COPY_PROTECTED) !== 0);
    const fileHeaderBlockNumber = isGame ? HEADER_BLOCK_NUMBER_FOR_GAME : HEADER_BLOCK_NUMBER_FOR_DATA;
    const comments = DreamcastDirectoryEntry.getComments(fileHeaderBlockNumber, vmsArrayBuffer);

    return {
      // These parts are specific to the .vmi/.vms format
      checksum,
      description,
      copyright,
      version,
      fileNumber,
      resourceName,
      fileMode,
      fileSize,

      // These parts are common to all dreamcast saves
      filename,
      fileType,
      fileCreationTime,
      copyProtected,
      fileSizeInBlocks,
      firstBlockNumber,
      fileHeaderBlockNumber,
      ...comments,
      rawData: vmsArrayBuffer,
    };
  }
}
