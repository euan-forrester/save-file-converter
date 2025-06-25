import Ps1Basics from './Basics';

import Util from '../../../util/util';

const {
  BLOCK_SIZE,
  NUM_DATA_BLOCKS,
  MAGIC_ENCODING,
} = Ps1Basics;

const SAVE_BLOCK_MAGIC = 'SC';
const MAGIC_OFFSET = 0;

const SAVE_BLOCK_DESCRIPTION_OFFSET = 0x04;
const SAVE_BLOCK_DESCRIPTION_LENGTH = 64;
const SAVE_BLOCK_DESCRIPTION_ENCODING = 'shift-jis';

function getBlock(dataBlocksArrayBuffer, blockNum) {
  const offset = BLOCK_SIZE * blockNum;
  return dataBlocksArrayBuffer.slice(offset, offset + BLOCK_SIZE);
}

function createSaveBlockEmpty() {
  return Util.getFilledArrayBuffer(BLOCK_SIZE, 0x00);
}

function convertTextToHalfWidth(s) {
  // The description stored in the save data is in full-width characters but we'd rather display normal half-width ones
  // https://stackoverflow.com/a/58515363
  return s.replace(/[\uff01-\uff5e]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)).replace(/\u3000/g, '\u0020');
}

export default class Ps1SaveBlocks {
  static checkMagic(rawData) {
    Util.checkMagic(rawData, MAGIC_OFFSET, SAVE_BLOCK_MAGIC, MAGIC_ENCODING);
  }

  static readSaveBlocks(saveFile, dataBlocksArrayBuffer) {
    const fileDescriptionTextDecoder = new TextDecoder(SAVE_BLOCK_DESCRIPTION_ENCODING);

    const dataBlocks = saveFile.dataBlockNumbers.map((dataBlockNumber) => getBlock(dataBlocksArrayBuffer, dataBlockNumber));

    Util.checkMagic(dataBlocks[0], MAGIC_OFFSET, SAVE_BLOCK_MAGIC, MAGIC_ENCODING);

    const description = convertTextToHalfWidth(
      Util.trimNull(
        fileDescriptionTextDecoder.decode(
          dataBlocks[0].slice(SAVE_BLOCK_DESCRIPTION_OFFSET, SAVE_BLOCK_DESCRIPTION_OFFSET + SAVE_BLOCK_DESCRIPTION_LENGTH),
        ),
      ),
    );

    // Check that we actually got as many bytes as the file was supposed to have

    const rawData = Util.concatArrayBuffers(dataBlocks);

    if (rawData.byteLength !== saveFile.rawDataSize) {
      throw new Error(`Save file appears to be corrupted: expected file ${description} to be ${saveFile.rawDataSize} bytes, but was actually ${rawData.byteLength} bytes`);
    }

    return {
      ...saveFile,
      description,
      rawData,
    };
  }

  static createSaveBlocks(saveFiles) {
    // Divide up the save file itself into blocks

    const saveBlocks = [];

    saveFiles.forEach((saveFile) => {
      const numBlocks = saveFile.rawData.byteLength / BLOCK_SIZE;

      for (let i = 0; i < numBlocks; i += 1) {
        saveBlocks.push(saveFile.rawData.slice(i * BLOCK_SIZE, (i + 1) * BLOCK_SIZE));
      }
    });

    while (saveBlocks.length < NUM_DATA_BLOCKS) {
      saveBlocks.push(createSaveBlockEmpty());
    }

    return saveBlocks;
  }
}
