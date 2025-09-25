/* eslint-disable no-bitwise */

/*
Dreamcast system info block

Format taken from https://mc.pp.se/dc/vms/flashmem.html and https://github.com/flyinghead/flycast/blob/33833cfd1ed2d94d907223442fdb8cdafd8d5d80/core/hw/maple/maple_devs.cpp#L510

0x00-0x0f : All these bytes contain 0x55 to indicate a properly formatted card.
0x10      : custom VMS colour (1 = use custom colours below, 0 = standard colour)
0x11      : VMS colour blue component
0x12      : VMS colour green component
0x13      : VMS colour red component
0x14      : VMS colour alpha component (use 100 for semi-transparent, 255 for opaque)
0x15-0x2f : not used (all zeroes)
0x30-0x37 : BCD timestamp (see Directory below)
0x38-0x3f : not used (all zeroes)
0x40-0x41 : largest block number (255): https://github.com/flyinghead/flycast/blob/33833cfd1ed2d94d907223442fdb8cdafd8d5d80/core/hw/maple/maple_devs.cpp#L512
0x42-0x43 : partitian number (0): https://github.com/flyinghead/flycast/blob/33833cfd1ed2d94d907223442fdb8cdafd8d5d80/core/hw/maple/maple_devs.cpp#L514
0x44-0x45 : location of system area block (255): https://github.com/flyinghead/flycast/blob/33833cfd1ed2d94d907223442fdb8cdafd8d5d80/core/hw/maple/maple_devs.cpp#L516
0x46-0x47 : location of FAT block (254)
0x48-0x49 : size of FAT in blocks (1)
0x4a-0x4b : location of directory (253)
0x4c-0x4d : size of directory in blocks (13)
0x4e-0x4f : icon shape for this VMS (0-123) (this is described as one byte for volume icon and one byte reserved here: https://github.com/flyinghead/flycast/blob/33833cfd1ed2d94d907223442fdb8cdafd8d5d80/core/hw/maple/maple_devs.cpp#L525)
0x50-0x51 : number of user blocks (200)
0x52-0x53 : number of save blocks (31) (unsure what this means): https://github.com/flyinghead/flycast/blob/33833cfd1ed2d94d907223442fdb8cdafd8d5d80/core/hw/maple/maple_devs.cpp#L531
0x54-0x57 : reserved (something for execution files?): https://github.com/flyinghead/flycast/blob/33833cfd1ed2d94d907223442fdb8cdafd8d5d80/core/hw/maple/maple_devs.cpp#L533
*/

import Util from '../../../util/util';

import DreamcastBasics from './Basics';
import DreamcastUtil from '../Util';

const {
  LITTLE_ENDIAN,
} = DreamcastBasics;

const MAGIC_OFFSET = 0;
const MAGIC_LENGTH = 0x10;
const MAGIC_VALUE = 0x55;
const MAGIC_BYTES = new Uint8Array(Util.getFilledArrayBuffer(MAGIC_LENGTH, MAGIC_VALUE));

const USE_CUSTOM_COLOR_OFFSET = 0x10;
const CUSTOM_COLOR_BLUE_OFFSET = 0x11;
const CUSTOM_COLOR_GREEN_OFFSET = 0x12;
const CUSTOM_COLOR_RED_OFFSET = 0x13;
const CUSTOM_COLOR_ALPHA_OFFSET = 0x14;
const TIMESTAMP_OFFSET = 0x30;
const LARGEST_BLOCK_NUMBER_OFFSET = 0x40;
const PARTITION_NUMBER_OFFSET = 0x42;
const SYSTEM_INFO_BLOCK_NUMBER_OFFSET = 0x44;
const FILE_ALLOCATION_TABLE_BLOCK_NUMBER_OFFSET = 0x46;
const FILE_ALLOCATION_TABLE_SIZE_IN_BLOCKS_OFFSET = 0x48;
const DIRECTORY_BLOCK_NUMBER_OFFSET = 0x4A;
const DIRECTORY_SIZE_IN_BLOCKS_OFFSET = 0x4C;
const ICON_SHAPE_OFFSET = 0x4E;
const SAVE_AREA_SIZE_IN_BLOCKS_OFFSET = 0x50;
const NUMBER_OF_SAVE_BLOCKS_OFFSET = 0x52;
const RESERVED_OFFSET = 0x54;

const DEFAULT_PARTITION_NUMBER = 0; // I'm not sure what this number represents, but it appears to be set to 0 in the files I've seen
const DEFAULT_RESERVED_VALUE = 0x800000; // I'm not sure what this number represents. This is the only value that I've seen

const PADDING_VALUE = 0x00;

export default class DreamcastSystemInfo {
  static writeSystemInfo(volumeInfo) {
    // Many of the fields within the system are set to fixed, hardcoded, values in real VMU data.
    // So we don't require them to be set in the volumeInfo that we're passed

    let arrayBuffer = Util.getFilledArrayBuffer(DreamcastBasics.BLOCK_SIZE, PADDING_VALUE);

    arrayBuffer = Util.setMagicBytes(arrayBuffer, MAGIC_OFFSET, MAGIC_BYTES);
    arrayBuffer = DreamcastUtil.writeBcdTimestamp(arrayBuffer, TIMESTAMP_OFFSET, volumeInfo.timestamp);

    const dataView = new DataView(arrayBuffer);

    dataView.setUint8(USE_CUSTOM_COLOR_OFFSET, volumeInfo.useCustomColor ? 1 : 0);

    if (Object.hasOwn(volumeInfo, 'customColor')) {
      dataView.setUint8(CUSTOM_COLOR_BLUE_OFFSET, volumeInfo.customColor.blue);
      dataView.setUint8(CUSTOM_COLOR_GREEN_OFFSET, volumeInfo.customColor.green);
      dataView.setUint8(CUSTOM_COLOR_RED_OFFSET, volumeInfo.customColor.red);
      dataView.setUint8(CUSTOM_COLOR_ALPHA_OFFSET, volumeInfo.customColor.alpha);
    } else {
      dataView.setUint8(CUSTOM_COLOR_BLUE_OFFSET, 0);
      dataView.setUint8(CUSTOM_COLOR_GREEN_OFFSET, 0);
      dataView.setUint8(CUSTOM_COLOR_RED_OFFSET, 0);
      dataView.setUint8(CUSTOM_COLOR_ALPHA_OFFSET, 0);
    }

    dataView.setUint16(LARGEST_BLOCK_NUMBER_OFFSET, DreamcastBasics.NUM_BLOCKS - 1, LITTLE_ENDIAN);
    dataView.setUint16(PARTITION_NUMBER_OFFSET, DEFAULT_PARTITION_NUMBER, LITTLE_ENDIAN);
    dataView.setUint16(SYSTEM_INFO_BLOCK_NUMBER_OFFSET, DreamcastBasics.SYSTEM_INFO_BLOCK_NUMBER, LITTLE_ENDIAN);

    dataView.setUint16(FILE_ALLOCATION_TABLE_BLOCK_NUMBER_OFFSET, DreamcastBasics.FILE_ALLOCATION_TABLE_BLOCK_NUMBER, LITTLE_ENDIAN);
    dataView.setUint16(FILE_ALLOCATION_TABLE_SIZE_IN_BLOCKS_OFFSET, DreamcastBasics.FILE_ALLOCATION_TABLE_SIZE_IN_BLOCKS, LITTLE_ENDIAN);

    dataView.setUint16(DIRECTORY_BLOCK_NUMBER_OFFSET, DreamcastBasics.DIRECTORY_BLOCK_NUMBER, LITTLE_ENDIAN);
    dataView.setUint16(DIRECTORY_SIZE_IN_BLOCKS_OFFSET, DreamcastBasics.DIRECTORY_SIZE_IN_BLOCKS, LITTLE_ENDIAN);

    dataView.setUint16(ICON_SHAPE_OFFSET, volumeInfo.iconShape, LITTLE_ENDIAN);

    dataView.setUint16(SAVE_AREA_SIZE_IN_BLOCKS_OFFSET, DreamcastBasics.SAVE_AREA_SIZE_IN_BLOCKS, LITTLE_ENDIAN);
    dataView.setUint16(NUMBER_OF_SAVE_BLOCKS_OFFSET, DreamcastBasics.NUMBER_OF_SAVE_BLOCKS, LITTLE_ENDIAN);

    dataView.setUint32(RESERVED_OFFSET, DEFAULT_RESERVED_VALUE, LITTLE_ENDIAN);

    return arrayBuffer;
  }

  static readSystemInfo(arrayBuffer) {
    Util.checkMagicBytes(arrayBuffer, MAGIC_OFFSET, MAGIC_BYTES);

    const dataView = new DataView(arrayBuffer);

    const useCustomColor = (dataView.getUint8(USE_CUSTOM_COLOR_OFFSET) !== 0);
    const customColor = {
      blue: dataView.getUint8(CUSTOM_COLOR_BLUE_OFFSET),
      green: dataView.getUint8(CUSTOM_COLOR_GREEN_OFFSET),
      red: dataView.getUint8(CUSTOM_COLOR_RED_OFFSET),
      alpha: dataView.getUint8(CUSTOM_COLOR_ALPHA_OFFSET),
    };

    const timestamp = DreamcastUtil.readBcdTimestamp(arrayBuffer, TIMESTAMP_OFFSET);

    const largestBlockNumber = dataView.getUint16(LARGEST_BLOCK_NUMBER_OFFSET, LITTLE_ENDIAN);
    const partitionNumber = dataView.getUint16(PARTITION_NUMBER_OFFSET, LITTLE_ENDIAN);
    const systemInfoBlockNumber = dataView.getUint16(SYSTEM_INFO_BLOCK_NUMBER_OFFSET, LITTLE_ENDIAN);

    const fileAllocationTableBlockNumber = dataView.getUint16(FILE_ALLOCATION_TABLE_BLOCK_NUMBER_OFFSET, LITTLE_ENDIAN);
    const fileAllocationTableSizeInBlocks = dataView.getUint16(FILE_ALLOCATION_TABLE_SIZE_IN_BLOCKS_OFFSET, LITTLE_ENDIAN);

    const directoryBlockNumber = dataView.getUint16(DIRECTORY_BLOCK_NUMBER_OFFSET, LITTLE_ENDIAN);
    const directorySizeInBlocks = dataView.getUint16(DIRECTORY_SIZE_IN_BLOCKS_OFFSET, LITTLE_ENDIAN);

    const iconShape = dataView.getUint16(ICON_SHAPE_OFFSET, LITTLE_ENDIAN);

    const saveAreaSizeInBlocks = dataView.getUint16(SAVE_AREA_SIZE_IN_BLOCKS_OFFSET, LITTLE_ENDIAN);
    const numberOfSaveBlocks = dataView.getUint16(NUMBER_OF_SAVE_BLOCKS_OFFSET, LITTLE_ENDIAN);

    const reserved = dataView.getUint32(RESERVED_OFFSET, LITTLE_ENDIAN);

    return {
      useCustomColor,
      customColor,
      timestamp,
      largestBlockNumber,
      partitionNumber,
      systemInfo: {
        blockNumber: systemInfoBlockNumber,
        sizeInBlocks: DreamcastBasics.SYSTEM_INFO_SIZE_IN_BLOCKS,
      },
      fileAllocationTable: {
        blockNumber: fileAllocationTableBlockNumber,
        sizeInBlocks: fileAllocationTableSizeInBlocks,
      },
      directory: {
        blockNumber: directoryBlockNumber,
        sizeInBlocks: directorySizeInBlocks,
      },
      iconShape,
      saveArea: {
        blockNumber: DreamcastBasics.SAVE_AREA_BLOCK_NUMBER,
        sizeInBlocks: saveAreaSizeInBlocks,
        numberOfSaveBlocks,
      },
      reserved,
    };
  }
}
