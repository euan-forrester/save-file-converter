/* eslint-disable no-bitwise */

/*
This is based on a description of the Saturn Archive Format from the Saroo repo:
https://github.com/tpunix/SAROO/blob/6f6e18289bbdc9b23b4c91b9da343a1362ed921c/doc/SAROO%E6%8A%80%E6%9C%AF%E7%82%B9%E6%BB%B4.txt#L448
which was translated here:
https://www.reddit.com/r/SegaSaturn/comments/1acty0v/comment/kjz73ft/

Date format from: https://segaxtreme.net/threads/backup-memory-structure.16803/post-156645

Unlike the Sega CD and other consoles like the PS1 and N64, there is no directory at the beginning of the memory. So the entire file must
be parsed to get a list of all of the saves it contains and to get a list of occupied blocks.

The file is divided into equal-sized blocks. Everything is big endian.

The first 2 blocks are reserved. The first block is the string 'BackUpRam Format' repeated over and over. The BIOS writes out 0x40
bytes of this regardless of whether the block size is 0x40 or 0x200 bytes. mednafen manually fills the entire first block (either
0x40 or 0x200 bytes), presumably to allow the reader to infer the block size of the file by counting the number of repetitions of that string.

We determine the block size of the file by looking at the file length.

The second block is all 0x00.

From there, blocks are of 2 types: archive entry blocks begin with 0x80000000, and data entry blocks begin with 0x00000000

For an archive entry block, the format is as follows:
0x00 - 0x03: Block type (0x80000000)
0x04 - 0x0E: Archive name (null-terminated, encoded as US-ASCII)
0x0F: Language flag
0x10 - 0x19: Comment (null-terminated, encoded as shift-jis)
0x1A - 0x1D: Date (encoded as number of minutes since Jan 1, 1980)
0x1E - 0x21: Save size in bytes
0x22 - ????: List of 2-byte block numbers containing save data for this entry. Ends with 0x0000. See notes below.
???? - end:  Beginning of save data for this entry

For a data entry block, the format is as follows:
0x00 - 0x03: Block type (0x00000000)
0x04 - end:  save data

Note that the save size does not include space for the block type flag at the beginning of each block.

Block numbers list notes:
- If the total save data size is < the remaining block size, the marker at 0x22 is set to ARCHIVE_ENTRY_BLOCK_LIST_END.
  Some sources imply that the marker at 0x22 is missing altogether, which is incorrect: the block list is merely empty.

- If the block numbers list doesn't fit within the remaining block size, then it continues at the first, second, etc block specified in the block list.
  i.e. the blocks containing the continuation of the block list are specified as part of the block list. This has the effect of ballooning the size
  of a large save with a small block size: it needs extra blocks to contain the portion of the block list specifying where the block list is.
  At a larger block size, there's more room for the first block to contain the entire block list, which is also in turn shorter because of the larger blocks.
  The blocks containing the block list are regular data blocks with 0x00000000 in bytes 0x00 - 0x03.
*/

import SegaSaturnUtil from './Util';

import Util from '../../util/util';

const LITTLE_ENDIAN = false;

const MAGIC = 'BackUpRam Format';
const MAGIC_ENCODING = 'US-ASCII';
const MIN_LENGTH_OF_REPEATING_MAGIC = 0x40;

const TOTAL_BLOCKS = new Map([ // Total number of blocks in a save file, indexed by block size
  [0x40, 512],
  [0x200, 1024],
]);

const POSSIBLE_BLOCK_SIZES = Array.from(TOTAL_BLOCKS.keys());

const INTERNAL_SAVE_SIZE = TOTAL_BLOCKS.get(POSSIBLE_BLOCK_SIZES[0]) * POSSIBLE_BLOCK_SIZES[0];
const CARTRIDGE_SAVE_SIZE = TOTAL_BLOCKS.get(POSSIBLE_BLOCK_SIZES[1]) * POSSIBLE_BLOCK_SIZES[1];

const RESERVED_BLOCKS = [0, 1];

const BLOCK_TYPE_OFFSET = 0x00;
const BLOCK_TYPE_ARCHIVE_ENTRY = 0x80000000;
const BLOCK_TYPE_DATA = 0x00000000;

const DATA_BLOCK_DATA_OFFSET = 0x04;

const ARCHIVE_ENTRY_NAME_OFFSET = 0x04;
const ARCHIVE_ENTRY_NAME_LENGTH = 11;
const ARCHIVE_ENTRY_NAME_ENCODING = 'US-ASCII';

const ARCHIVE_ENTRY_LANGUAGE_OFFSET = 0x0F;

const ARCHIVE_ENTRY_COMMENT_OFFSET = 0x10;
const ARCHIVE_ENTRY_COMMENT_LENGTH = 10;
const ARCHIVE_ENTRY_COMMENT_ENCODING = 'shift-jis';

const ARCHIVE_ENTRY_DATE_OFFSET = 0x1A;
const ARCHIVE_ENTRY_SAVE_SIZE_OFFSET = 0x1E;

const ARCHIVE_ENTRY_BLOCK_LIST_OFFSET = 0x22;
const ARCHIVE_ENTRY_BLOCK_LIST_END = 0x0000;
const ARCHIVE_ENTRY_BLOCK_LIST_ENTRY_SIZE = 2; // Each entry in the block list is a uint16

function getBlockSizeAndCheckHeader(arrayBuffer) {
  // First block contains the MAGIC repeated for 0x40 bytes or longer
  // Second block is all 0x00

  // First get our block size from looking at the size of the file. This will also check that the file is long
  // enough for our magic check in the next step

  let blockSize = 0;

  switch (arrayBuffer.byteLength) {
    case INTERNAL_SAVE_SIZE: {
      blockSize = POSSIBLE_BLOCK_SIZES[0]; // eslint-disable-line prefer-destructuring
      break;
    }

    case CARTRIDGE_SAVE_SIZE: {
      blockSize = POSSIBLE_BLOCK_SIZES[1]; // eslint-disable-line prefer-destructuring
      break;
    }

    default:
      throw new Error(`Invalid file length of ${arrayBuffer.byteLength}. Cannot infer block size`);
  }

  // Next check that there's the correct magic

  let currentOffset = 0;

  while (currentOffset < MIN_LENGTH_OF_REPEATING_MAGIC) {
    try {
      Util.checkMagic(arrayBuffer, currentOffset, MAGIC, MAGIC_ENCODING);
    } catch (e) {
      break;
    }

    currentOffset += MAGIC.length;
  }

  if (currentOffset === 0) {
    throw new Error('This does not appear to be a valid Sega Saturn save file: couldn\'t find any magic.');
  }

  if (currentOffset < MIN_LENGTH_OF_REPEATING_MAGIC) {
    throw new Error('This does not appear to be a valid Sega Saturn save file: didn\'t find enough magic.');
  }

  // And finally check our second block

  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = blockSize; i < (blockSize * 2); i += 1) {
    if (uint8Array[i] !== 0x00) {
      throw new Error('This does not appear to be a valid Sega Saturn save file: the second block is not all 0x00');
    }
  }

  return blockSize;
}

function getBlock(arrayBuffer, blockSize, blockNumber) {
  return arrayBuffer.slice(blockNumber * blockSize, (blockNumber + 1) * blockSize);
}

function makeEmptyBlock(blockSize) {
  return Util.getFilledArrayBuffer(blockSize, 0x00);
}

function makeSequentialArray(startValue, numValues) {
  return Array(numValues).fill().map((_, index) => index + startValue);
}

function makeReservedBlocks(blockSize) {
  let reservedBlock0 = makeEmptyBlock(blockSize);

  let currentOffset = 0;

  while (currentOffset < reservedBlock0.byteLength) {
    reservedBlock0 = Util.setMagic(reservedBlock0, currentOffset, MAGIC, MAGIC_ENCODING);
    currentOffset += MAGIC.length;
  }

  return [reservedBlock0, makeEmptyBlock(blockSize)];
}

function getVolumeInfo(segaSaturnArrayBuffer, blockSize, usedBlocks) {
  const totalNumBlocks = segaSaturnArrayBuffer.byteLength / blockSize;

  return {
    blockSize,
    totalBytes: segaSaturnArrayBuffer.byteLength,
    totalBlocks: totalNumBlocks - RESERVED_BLOCKS.length,
    usedBlocks: usedBlocks.length,
    freeBlocks: totalNumBlocks - usedBlocks.length - RESERVED_BLOCKS.length,
  };
}

function readSaveFiles(arrayBuffer, blockSize) {
  const totalNumBlocks = (arrayBuffer.byteLength / blockSize);

  const saveFiles = [];

  let usedBlocks = [];
  let searchBlockNumber = RESERVED_BLOCKS.length; // The block number where we are currently searching for an archive entry

  while (searchBlockNumber < totalNumBlocks) {
    let currentBlock = getBlock(arrayBuffer, blockSize, searchBlockNumber);
    let currentBlockUint8Array = new Uint8Array(currentBlock);
    let currentBlockDataView = new DataView(currentBlock);

    if (currentBlockDataView.getUint32(BLOCK_TYPE_OFFSET, LITTLE_ENDIAN) === BLOCK_TYPE_ARCHIVE_ENTRY) {
      usedBlocks.push(searchBlockNumber);

      const name = Util.readNullTerminatedString(currentBlockUint8Array, ARCHIVE_ENTRY_NAME_OFFSET, ARCHIVE_ENTRY_NAME_ENCODING, ARCHIVE_ENTRY_NAME_LENGTH);
      const languageCode = currentBlockDataView.getUint8(ARCHIVE_ENTRY_LANGUAGE_OFFSET);
      const comment = Util.readNullTerminatedString(currentBlockUint8Array, ARCHIVE_ENTRY_COMMENT_OFFSET, ARCHIVE_ENTRY_COMMENT_ENCODING, ARCHIVE_ENTRY_COMMENT_LENGTH);
      const dateCode = currentBlockDataView.getUint32(ARCHIVE_ENTRY_DATE_OFFSET, LITTLE_ENDIAN);
      const saveSize = currentBlockDataView.getUint32(ARCHIVE_ENTRY_SAVE_SIZE_OFFSET, LITTLE_ENDIAN);

      const blockList = [];
      let blockListEntryOffset = ARCHIVE_ENTRY_BLOCK_LIST_OFFSET;
      let nextBlockNumber = currentBlockDataView.getUint16(blockListEntryOffset, LITTLE_ENDIAN); // Note that this is always present, even when the entire save file fits within the starting block. In that case, this value is set to ARCHIVE_ENTRY_BLOCK_LIST_END

      let blockListReadingIndex = 0; // If the block list doesn't fit within the starting block, it continues in the blocks specified in the block list

      while (nextBlockNumber !== ARCHIVE_ENTRY_BLOCK_LIST_END) {
        blockList.push(nextBlockNumber);

        blockListEntryOffset += 2;

        if (blockListEntryOffset >= blockSize) {
          currentBlock = getBlock(arrayBuffer, blockSize, blockList[blockListReadingIndex]);
          blockListReadingIndex += 1;

          currentBlockUint8Array = new Uint8Array(currentBlock);
          currentBlockDataView = new DataView(currentBlock);
          blockListEntryOffset = DATA_BLOCK_DATA_OFFSET;

          const blockType = currentBlockDataView.getUint32(BLOCK_TYPE_OFFSET, LITTLE_ENDIAN);

          if (blockType !== BLOCK_TYPE_DATA) {
            throw new Error(`Found block type 0x${Buffer.from(blockType).toString('hex')} where there should be a data block that continues a block list`);
          }
        }

        nextBlockNumber = currentBlockDataView.getUint16(blockListEntryOffset, LITTLE_ENDIAN);
      }

      usedBlocks = usedBlocks.concat(blockList);

      // The data segments are the remainder of the current block, plus all of the blocks listed in the block list
      // Note that if the last block list entry was right at the end of currentBlock, the slice below will correctly return a zero-length ArrayBuffer

      const dataBlockList = blockList.slice(blockListReadingIndex); // Remove the blocks used to specify the block list

      const dataSegments = [currentBlock.slice(blockListEntryOffset + 2)].concat(dataBlockList.map((blockNumber) => {
        const block = getBlock(arrayBuffer, blockSize, blockNumber);
        const blockDataView = new DataView(block);
        const blockType = blockDataView.getUint32(BLOCK_TYPE_OFFSET, LITTLE_ENDIAN);

        if (blockType !== BLOCK_TYPE_DATA) {
          throw new Error(`Found block type 0x${Buffer.from(blockType).toString('hex')} where there should be a data block`);
        }

        return block.slice(DATA_BLOCK_DATA_OFFSET);
      }));

      const rawData = Util.concatArrayBuffers(dataSegments).slice(0, saveSize); // We may have appended too many bytes by appending the entire final block, so slice it down to the specified size

      saveFiles.push({
        name,
        languageCode,
        language: SegaSaturnUtil.getLanguageString(languageCode),
        comment,
        dateCode,
        date: SegaSaturnUtil.getDate(dateCode),
        blockList,
        saveSize,
        rawData,
      });
    }

    searchBlockNumber += 1;
  }

  const volumeInfo = getVolumeInfo(arrayBuffer, blockSize, usedBlocks);

  return {
    saveFiles,
    volumeInfo,
  };
}

function getNumDataBlocksForSaveFile(saveFile, blockSize) {
  // The difficulty in calculating this is that we need an unknown number of bytes to store the list of blocks,
  // because the block list points to both the blocks that actually store the save data but also to the blocks
  // that store the block list. So, the longer the block list is the more blocks are needed to store it,
  // so the longer the block list is
  // Also, some data fits in the first archive block

  const numDataBytesInArchiveBlock = blockSize - ARCHIVE_ENTRY_BLOCK_LIST_OFFSET;
  const numDataBytesInDataBlock = blockSize - DATA_BLOCK_DATA_OFFSET;

  let blocksAddedForBlockList = 0;
  let numBytesToStoreInDataBlocks = 0; // Our first approximation is that we need no data blocks for this save
  let approxDataSizeInBlocks = 0;

  do {
    const blockListSizeBytes = (approxDataSizeInBlocks + 1) * ARCHIVE_ENTRY_BLOCK_LIST_ENTRY_SIZE; // Need +1 for the end of list entry

    numBytesToStoreInDataBlocks = Math.max(saveFile.rawData.byteLength + blockListSizeBytes - numDataBytesInArchiveBlock, 0);

    const newApproxBlockListSizeInBlocks = Math.ceil(numBytesToStoreInDataBlocks / numDataBytesInDataBlock);

    blocksAddedForBlockList = newApproxBlockListSizeInBlocks - approxDataSizeInBlocks;

    approxDataSizeInBlocks = newApproxBlockListSizeInBlocks;
  } while (blocksAddedForBlockList > 0);

  return approxDataSizeInBlocks;
}

function getBlocksForSaveFile(saveFile, blockSize, startingBlockNumber) {
  // First, fill in all of the fields in the archive entry block

  let archiveEntryBlock = makeEmptyBlock(blockSize);

  archiveEntryBlock = Util.setString(archiveEntryBlock, ARCHIVE_ENTRY_NAME_OFFSET, saveFile.name, ARCHIVE_ENTRY_NAME_ENCODING, ARCHIVE_ENTRY_NAME_LENGTH);
  archiveEntryBlock = Util.setString(archiveEntryBlock, ARCHIVE_ENTRY_COMMENT_OFFSET, saveFile.comment, ARCHIVE_ENTRY_COMMENT_ENCODING, ARCHIVE_ENTRY_COMMENT_LENGTH);

  const archiveEntryBlockDataView = new DataView(archiveEntryBlock);

  archiveEntryBlockDataView.setUint32(BLOCK_TYPE_OFFSET, BLOCK_TYPE_ARCHIVE_ENTRY, LITTLE_ENDIAN);
  archiveEntryBlockDataView.setUint8(ARCHIVE_ENTRY_LANGUAGE_OFFSET, saveFile.languageCode);
  archiveEntryBlockDataView.setUint32(ARCHIVE_ENTRY_DATE_OFFSET, saveFile.dateCode, LITTLE_ENDIAN);
  archiveEntryBlockDataView.setUint32(ARCHIVE_ENTRY_SAVE_SIZE_OFFSET, saveFile.rawData.byteLength, LITTLE_ENDIAN);

  // Now create all of our blocks that contain the block list

  const numDataBlocksRequired = getNumDataBlocksForSaveFile(saveFile, blockSize);
  const saveFileBlocks = [];

  let currentDataBlockIndex = 0;
  let currentBlock = archiveEntryBlock;
  let currentBlockDataView = new DataView(currentBlock);
  let currentBlockOffset = ARCHIVE_ENTRY_BLOCK_LIST_OFFSET;

  while (currentDataBlockIndex < numDataBlocksRequired) {
    currentBlockDataView.setUint16(currentBlockOffset, currentDataBlockIndex + startingBlockNumber + 1, LITTLE_ENDIAN); // +1 because of the archive entry block
    currentBlockOffset += ARCHIVE_ENTRY_BLOCK_LIST_ENTRY_SIZE;

    if (currentBlockOffset >= blockSize) {
      saveFileBlocks.push(currentBlock);
      currentBlock = makeEmptyBlock(blockSize);
      currentBlockDataView = new DataView(currentBlock);
      currentBlockDataView.setUint32(BLOCK_TYPE_OFFSET, BLOCK_TYPE_DATA, LITTLE_ENDIAN);
      currentBlockOffset = DATA_BLOCK_DATA_OFFSET;
    }

    currentDataBlockIndex += 1;
  }

  // Add an end of list marker

  currentBlockDataView.setUint16(currentBlockOffset, ARCHIVE_ENTRY_BLOCK_LIST_END, LITTLE_ENDIAN);
  currentBlockOffset += ARCHIVE_ENTRY_BLOCK_LIST_ENTRY_SIZE;

  // Now create all of the blocks that contain the save data

  let currentOffsetInSaveData = 0;

  while (currentOffsetInSaveData < saveFile.rawData.byteLength) {
    if (currentBlockOffset >= blockSize) {
      saveFileBlocks.push(currentBlock);
      currentBlock = makeEmptyBlock(blockSize);
      currentBlockDataView = new DataView(currentBlock);
      currentBlockDataView.setUint32(BLOCK_TYPE_OFFSET, BLOCK_TYPE_DATA, LITTLE_ENDIAN);
      currentBlockOffset = DATA_BLOCK_DATA_OFFSET;
    }

    const saveFileNumBytesToCopyToBlock = Math.min(saveFile.rawData.byteLength, blockSize - currentBlockOffset);

    currentBlock = Util.setArrayBufferPortion(currentBlock, saveFile.rawData, currentBlockOffset, currentOffsetInSaveData, saveFileNumBytesToCopyToBlock);

    currentOffsetInSaveData += saveFileNumBytesToCopyToBlock;
    currentBlockOffset += saveFileNumBytesToCopyToBlock;
  }

  saveFileBlocks.push(currentBlock);

  // All done!

  return saveFileBlocks;
}

export default class SegaSaturnSaveData {
  static INTERNAL_BLOCK_SIZE = POSSIBLE_BLOCK_SIZES[0];

  static CARTRIDGE_BLOCK_SIZE = POSSIBLE_BLOCK_SIZES[1];

  static INTERNAL_SAVE_SIZE = INTERNAL_SAVE_SIZE

  static CARTRIDGE_SAVE_SIZE = CARTRIDGE_SAVE_SIZE

  static ARCHIVE_ENTRY_NAME_LENGTH = ARCHIVE_ENTRY_NAME_LENGTH;

  static ARCHIVE_ENTRY_NAME_ENCODING = ARCHIVE_ENTRY_NAME_ENCODING;

  static ARCHIVE_ENTRY_COMMENT_LENGTH = ARCHIVE_ENTRY_COMMENT_LENGTH;

  static ARCHIVE_ENTRY_COMMENT_ENCODING = ARCHIVE_ENTRY_COMMENT_ENCODING;

  static createEmptySave(blockSize) {
    return SegaSaturnSaveData.createFromSaveFiles([], blockSize).getArrayBuffer();
  }

  static isCorrectlyFormatted(arrayBuffer) {
    try {
      SegaSaturnSaveData.createFromSegaSaturnData(arrayBuffer);
      return true;
    } catch (e) {
      return false;
    }
  }

  static createWithNewSize(/* segaSaturnSaveData, newSize */) {
    /*
    const newRawSaveData = SegaSaturnUtil.resize(segaSaturnSaveData.getArrayBuffer(), newSize);

    return SegaSaturnSaveData.createFromSegaSaturnData(newRawSaveData);
    */
  }

  static createFromSegaSaturnData(arrayBuffer) {
    const blockSize = getBlockSizeAndCheckHeader(arrayBuffer);

    const { saveFiles, volumeInfo } = readSaveFiles(arrayBuffer, blockSize);

    return new SegaSaturnSaveData(arrayBuffer, saveFiles, volumeInfo);
  }

  static createFromSaveFiles(saveFiles, blockSize) {
    if (POSSIBLE_BLOCK_SIZES.find((possibleBlockSize) => possibleBlockSize === blockSize) === undefined) {
      throw new Error(`Cannot create Saturn save file: ${blockSize} bytes is not a valid block size`);
    }

    // Transform our save files into blocks

    let currentBlockNumber = RESERVED_BLOCKS.length;
    const saveFilesBlocks = saveFiles.map((saveFile) => {
      const blocksForSaveFile = getBlocksForSaveFile(saveFile, blockSize, currentBlockNumber);
      currentBlockNumber += blocksForSaveFile.length;
      return blocksForSaveFile;
    }).flat();

    // Figure out how many blocks we need to use

    const totalNumBlocks = TOTAL_BLOCKS.get(blockSize);

    const blockList = makeReservedBlocks(blockSize).concat(saveFilesBlocks);

    if (blockList.length > totalNumBlocks) {
      throw new Error(`Not enough space to hold all saves. Requires ${saveFilesBlocks.length} blocks and only has space for ${totalNumBlocks - RESERVED_BLOCKS.length} blocks`);
    }

    const usedBlocks = makeSequentialArray(RESERVED_BLOCKS.length, saveFilesBlocks.length);

    // Append empty blocks until we have enough total blocks

    while (blockList.length < totalNumBlocks) {
      blockList.push(makeEmptyBlock(blockSize));
    }

    // Now that we have all of our blocks, we can assemble them to make our save file image

    const segaSaturnArrayBuffer = Util.concatArrayBuffers(blockList);

    const volumeInfo = getVolumeInfo(segaSaturnArrayBuffer, blockSize, usedBlocks);

    return new SegaSaturnSaveData(segaSaturnArrayBuffer, saveFiles, volumeInfo);
  }

  constructor(arrayBuffer, saveFiles, volumeInfo) {
    this.arrayBuffer = arrayBuffer;
    this.saveFiles = saveFiles;
    this.volumeInfo = volumeInfo;
  }

  getSaveFiles() {
    return this.saveFiles;
  }

  getVolumeInfo() {
    return this.volumeInfo;
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
