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
import DreamcastUtil from '../Util';
import Util from '../../../util/util';

const { LITTLE_ENDIAN } = DreamcastBasics;

const ENCODING = 'US-ASCII';

// const PADDING = 0x00;

// Based on https://mc.pp.se/dc/vms/vmi.html
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

// Based on https://github.com/bucanero/dc-save-converter/blob/a19fc3361805358d474acd772cdb20a328453d5b/dcvmu.cpp#L428
function calculateChecksum(resourceName) {
  let checksum = 0;
  let currentChar = 0;

  do {
    checksum *= 0x100; // Move 2 digits to the left
    checksum |= (resourceName.charCodeAt(currentChar) & CHECKSUM_MASK.charCodeAt(currentChar));
    currentChar += 1;
  } while (currentChar < CHECKSUM_MASK.length);

  return checksum;
}

export default class DreamcastVmiVmsSaveData {
  // Based on https://github.com/bucanero/dc-save-converter/blob/a19fc3361805358d474acd772cdb20a328453d5b/dcvmu.cpp#L388
  static convertIndividualSaveToSaveFile(vmiArrayBuffer, vmsArrayBuffer) {
    if (vmiArrayBuffer.byteLength !== HEADER_LENGTH) {
      throw new Error('This does not appear to be a Dreamcast individual save: header is the wrong size');
    }

    const vmiDataView = new DataView(vmiArrayBuffer);
    const vmiUint8Array = new Uint8Array(vmiArrayBuffer);

    const checksum = vmiDataView.getUint32(CHECKSUM_OFFSET, CHECKSUM_LITTLE_ENDIAN);
    const description = Util.readNullTerminatedString(vmiUint8Array, DESCRIPTION_OFFSET, ENCODING, DESCRIPTION_LENGTH);
    const copyright = Util.readNullTerminatedString(vmiUint8Array, COPYRIGHT_OFFSET, ENCODING, COPYRIGHT_LENGTH);
    const timestamp = DreamcastUtil.readTimestamp(vmiArrayBuffer, TIMESTAMP_OFFSET);
    const version = vmiDataView.getUint16(VERSION_OFFSET, LITTLE_ENDIAN);
    const fileNumber = vmiDataView.getUint16(FILE_NUMBER_OFFSET, LITTLE_ENDIAN);
    const resourceName = Util.readNullTerminatedString(vmiUint8Array, RESOURCE_NAME_OFFSET, ENCODING, RESOURCE_NAME_LENGTH);
    const fileName = Util.readNullTerminatedString(vmiUint8Array, FILE_NAME_OFFSET, ENCODING, FILE_NAME_LENGTH);
    const fileMode = vmiDataView.getUint16(FILE_MODE_OFFSET, LITTLE_ENDIAN);
    const fileSize = vmiDataView.getUint32(FILE_SIZE_OFFSET, LITTLE_ENDIAN);

    const calculatedChecksum = calculateChecksum(resourceName);

    if (checksum !== calculatedChecksum) {
      throw new Error(`This does not appear to be a Dreamcast individual save: checksum 0x${checksum.toString(16)} does not match `
      + `calculated checksum of 0x${calculatedChecksum.toString(16)} for resource name ${resourceName}`);
    }

    if (fileSize !== vmsArrayBuffer.byteLength) {
      throw new Error(`This does not appear to be a Dreamcast individual save: file size in header ${fileSize} does not match .VMS file size ${vmsArrayBuffer.byteLength}`);
    }

    return {
      checksum,
      description,
      copyright,
      timestamp,
      version,
      fileNumber,
      resourceName,
      fileName,
      fileMode,
      fileSize,
      rawData: vmsArrayBuffer,
    };
  }
}
