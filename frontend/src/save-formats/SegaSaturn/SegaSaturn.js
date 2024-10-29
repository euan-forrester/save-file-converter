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

The first 2 blocks are reserved. The first block is the string 'BackUpRam Format' repeated over and over, and you can infer the block size of the file
by counting the number of repetitions of that string. The second block is all 0x00.

From there, blocks are of 2 types: archive entry blocks begin with 0x80000000, and data entry blocks begin with 0x00000000

For an archive entry block, the format is as follows:
0x00 - 0x03: Block type (0x80000000)
0x04 - 0x0E: Archive name
0x0F: Language flag
0x10 - 0x19: Comment (encoded as shift-jis)
0x1A - 0x1D: Date (encoded as number of minutes since Jan 1, 1980)
0x1E - 0x21: Save size in bytes
0x22 - ????: List of 2-byte block numbers containing save data for this entry. Ends with 0x0000. Note that some sources imply that this list is missing if the total save data size is < the remaining block size. This is incorrect: the end of list marker is still present here
???? - end:  Beginning of save data for this entry

For a data entry block, the format is as follows:
0x00 - 0x03: Block type (0x00000000)
0x04 - end:  save data

Note that the save size does not include space for the block type flag at the beginning of each block.
*/

import Util from '../../util/util';
import CompressionGzip from '../../util/CompressionGzip';

const LITTLE_ENDIAN = false;

const MAGIC = 'BackUpRam Format';
const MAGIC_ENCODING = 'US-ASCII';

const RESERVED_BLOCKS = [0, 1];

const BLOCK_TYPE_OFFSET = 0x00;
const BLOCK_TYPE_ARCHIVE_ENTRY = 0x80000000;
const BLOCK_TYPE_DATA = 0x00000000;

const DATA_BLOCK_DATA_OFFSET = 0x04;

const ARCHIVE_ENTRY_NAME_OFFSET = 0x04;
const ARCHIVE_ENTRY_NAME_LENGTH = 11;
const ARCHIVE_ENTRY_NAME_ENCODING = 'US-ASCII';

const ARCHIVE_ENTRY_LANGUAGE_OFFSET = 0x0F;

// Taken from https://github.com/slinga-homebrew/Save-Game-BUP-Scripts/blob/main/bup_header.h#L31
const LANGUAGE_DECODE = {
  0: 'Japanese',
  1: 'English',
  2: 'French',
  3: 'German',
  4: 'Spanish',
  5: 'Italian',
};

const ARCHIVE_ENTRY_COMMENT_OFFSET = 0x10;
const ARCHIVE_ENTRY_COMMENT_LENGTH = 10;
const ARCHIVE_ENTRY_COMMENT_ENCODING = 'shift-jis';

const ARCHIVE_ENTRY_DATE_OFFSET = 0x1A;
const ARCHIVE_ENTRY_SAVE_SIZE_OFFSET = 0x1E;

const ARCHIVE_ENTRY_BLOCK_LIST_OFFSET = 0x22;
const ARCHIVE_ENTRY_BLOCK_LIST_END = 0x0000;

function getBlockSizeAndCheckHeader(arrayBuffer) {
  // First block is the MAGIC repeated. We can infer the block size of the file by counting the number of times it's repeated
  // Second block is all 0x00

  let currentOffset = 0;

  while (currentOffset < arrayBuffer.byteLength) {
    try {
      Util.checkMagic(arrayBuffer, currentOffset, MAGIC, MAGIC_ENCODING);
    } catch (e) {
      break;
    }

    currentOffset += MAGIC.length;
  }

  const blockSize = currentOffset;

  if (blockSize === 0) {
    throw new Error('This does not appear to be a valid Sega Saturn save file: couldn\'t find any magic.');
  }

  if (((blockSize / MAGIC.length) % 2) !== 0) {
    throw new Error('This does not appear to be a valid Sega Saturn save file: found an odd number of magic.');
  }

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

function getDate(dateEncoded) {
  // Date conversion from: https://segaxtreme.net/threads/backup-memory-structure.16803/post-156645
  // The Saturn stores the date as the number of minutes since Jan 1, 1980. So to convert to a javascript Date,
  // we multiply to get milliseconds, and add the number of milliseconds between Jan 1, 1970 and Jan 1, 1980

  return new Date((dateEncoded * 60 * 1000) + 315529200000);
}

function getLanguageString(languageEncoded) {
  if (Object.hasOwn(LANGUAGE_DECODE, languageEncoded)) {
    return LANGUAGE_DECODE[languageEncoded];
  }

  throw new Error(`Language code ${languageEncoded} is not a valid language`);
}

function readSaveFiles(arrayBuffer, blockSize) {
  const totalNumBlocks = (arrayBuffer.byteLength / blockSize);

  const saveFiles = [];

  let usedBlocks = [];
  let currentBlockNumber = RESERVED_BLOCKS.length;

  while (currentBlockNumber < totalNumBlocks) {
    let currentBlock = getBlock(arrayBuffer, blockSize, currentBlockNumber);
    let currentBlockUint8Array = new Uint8Array(currentBlock);
    let currentBlockDataView = new DataView(currentBlock);

    if (currentBlockDataView.getUint32(BLOCK_TYPE_OFFSET, LITTLE_ENDIAN) === BLOCK_TYPE_ARCHIVE_ENTRY) {
      usedBlocks.push(currentBlockNumber);

      const name = Util.readNullTerminatedString(currentBlockUint8Array, ARCHIVE_ENTRY_NAME_OFFSET, ARCHIVE_ENTRY_NAME_ENCODING, ARCHIVE_ENTRY_NAME_LENGTH);
      const languageCode = currentBlockDataView.getUint8(ARCHIVE_ENTRY_LANGUAGE_OFFSET);
      const comment = Util.readNullTerminatedString(currentBlockUint8Array, ARCHIVE_ENTRY_COMMENT_OFFSET, ARCHIVE_ENTRY_COMMENT_ENCODING, ARCHIVE_ENTRY_COMMENT_LENGTH);
      const dateCode = currentBlockDataView.getUint32(ARCHIVE_ENTRY_DATE_OFFSET, LITTLE_ENDIAN);
      const saveSize = currentBlockDataView.getUint32(ARCHIVE_ENTRY_SAVE_SIZE_OFFSET, LITTLE_ENDIAN);

      const blockList = [];
      let blockListEntryOffset = ARCHIVE_ENTRY_BLOCK_LIST_OFFSET;
      let nextBlockNumber = currentBlockDataView.getUint16(blockListEntryOffset, LITTLE_ENDIAN); // Note that this is always present, even when the entire save file fits within the starting block. In that case, this value is set to ARCHIVE_ENTRY_BLOCK_LIST_END

      while (nextBlockNumber !== ARCHIVE_ENTRY_BLOCK_LIST_END) {
        blockList.push(nextBlockNumber);

        blockListEntryOffset += 2;

        if (blockListEntryOffset > blockSize) {
          // FIXME: Is this code ever called? We need a test for this
          console.log('***** Found a block list that overran our previous block!!!');
          currentBlockNumber += 1;
          currentBlock = getBlock(arrayBuffer, blockSize, currentBlockNumber);
          currentBlockUint8Array = new Uint8Array(currentBlock);
          currentBlockDataView = new DataView(currentBlock);
          blockListEntryOffset = DATA_BLOCK_DATA_OFFSET;
          usedBlocks.push(currentBlockNumber);

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

      const dataSegments = [currentBlock.slice(blockListEntryOffset + 2)].concat(blockList.map((blockNumber) => {
        const block = getBlock(arrayBuffer, blockSize, blockNumber);
        const blockDataView = new DataView(block);
        const blockType = blockDataView.getUint32(BLOCK_TYPE_OFFSET, LITTLE_ENDIAN);

        if (blockType !== BLOCK_TYPE_DATA) {
          throw new Error(`Found block type 0x${Buffer.from(blockType).toString('hex')} where there should be a data block`);
        }

        return block.slice(DATA_BLOCK_DATA_OFFSET);
      }));

      const saveData = Util.concatArrayBuffers(dataSegments).slice(0, saveSize); // We may have appended too many bytes by appending the entire final block, so slice it down to the specified size

      saveFiles.push({
        name,
        languageCode,
        language: getLanguageString(languageCode),
        comment,
        dateCode,
        date: getDate(dateCode),
        blockList,
        saveSize,
        saveData,
      });
    }

    currentBlockNumber += 1;
  }

  const volumeInfo = {
    blockSize,
    totalBytes: arrayBuffer.byteLength,
    totalBlocks: totalNumBlocks - RESERVED_BLOCKS.length,
    usedBlocks: usedBlocks.length,
    freeBlocks: totalNumBlocks - usedBlocks.length - RESERVED_BLOCKS.length,
  };

  return {
    saveFiles,
    volumeInfo,
  };
}

export default class SegaSaturnSaveData {
  static createWithNewSize(/* segaSaturnSaveData, newSize */) {
    /*
    const newRawSaveData = SegaSaturnUtil.resize(segaSaturnSaveData.getArrayBuffer(), newSize);

    return SegaSaturnSaveData.createFromSegaSaturnData(newRawSaveData);
    */
  }

  static createFromSegaSaturnData(arrayBuffer) {
    // Cartridge saves from mednafen are compressed using gzip, but internal saves are not
    let uncompressedArrayBuffer = null;

    try {
      uncompressedArrayBuffer = CompressionGzip.decompress(arrayBuffer);
    } catch (e) {
      uncompressedArrayBuffer = arrayBuffer;
    }

    const blockSize = getBlockSizeAndCheckHeader(uncompressedArrayBuffer);

    const { saveFiles, volumeInfo } = readSaveFiles(uncompressedArrayBuffer, blockSize);

    return new SegaSaturnSaveData(uncompressedArrayBuffer, saveFiles, volumeInfo);
  }

  static createFromSaveFiles(/* saveFiles, size */) {
    /*
    // Setup and make sure we have enough space for the files

    let segaCdArrayBuffer = SegaCdUtil.makeEmptySave(size);
    const initialFreeBlocks = SegaCdUtil.getTotalAvailableBlocks(segaCdArrayBuffer); // If we call SegaCdUtil.getNumFreeBlocks() it will subtract one because of the extra block that's reserved for the first file's directory entry

    const requiredBlocksForSaves = saveFiles.reduce((accumulatedBlocks, saveFile) => accumulatedBlocks + getRequiredBlocks(saveFile), 0);
    const requiredBlocksForDirectoryEntries = Math.ceil(saveFiles.length / 2);
    const requiredReservedBlocks = ((saveFiles.length % 2) === 0) ? 1 : 0; // We can store 2 directory entries in a block. We always need room for the next future directory entry. So, if there are an odd number of save files we can store the next one in our last block. But if there are an even number of save files we need to reserve the next block

    const requiredBlocks = requiredBlocksForSaves + requiredBlocksForDirectoryEntries + requiredReservedBlocks;

    if (requiredBlocks > initialFreeBlocks) {
      throw new Error(`The specified save files require a total of ${requiredBlocks} blocks of free space, but Sega CD save data of ${size} bytes only has ${initialFreeBlocks} free blocks`);
    }

    // Write the files
    */

    // return new SegaSaturnSaveData(segaSaturnArrayBuffer, saveFiles);
  }

  // This constructor creates a new object from a binary representation of Sega CD save data
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
