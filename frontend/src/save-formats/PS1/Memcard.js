/*
The PS1 memcard format is described here:
https://www.psdevwiki.com/ps3/PS1_Savedata#Virtual_Memory_Card_PS1_.28.VM1.29
*/

import Ps1Basics from './Components/Basics';
import Ps1DirectoryBlock from './Components/DirectoryBlock';
import Ps1SaveBlocks from './Components/SaveBlocks';

import Util from '../../util/util';

const {
  BLOCK_SIZE,
  NUM_DATA_BLOCKS,
  NUM_TOTAL_BLOCKS,
} = Ps1Basics;

function checkFile(file) {
  Ps1SaveBlocks.checkMagic(file.rawData);

  if (file.rawData.byteLength <= 0) {
    throw new Error(`File ${file.filename} does not contain any data`);
  }

  if ((file.rawData.byteLength % BLOCK_SIZE) !== 0) {
    throw new Error(`File ${file.filename} size must be a multiple of ${BLOCK_SIZE} bytes`);
  }
}

export default class Ps1MemcardSaveData {
  static encodeFilename(filename, filenameTextEncoder) {
    return Ps1DirectoryBlock.encodeFilename(filename, filenameTextEncoder);
  }

  static createFromPs1MemcardData(memcardArrayBuffer) {
    return new Ps1MemcardSaveData(memcardArrayBuffer);
  }

  static createFromSaveFiles(saveFiles) {
    // Make sure that each file has the correct magic, is a correct size, and the total size isn't bigger than a single memcard

    saveFiles.forEach((f) => checkFile(f));

    const totalSize = saveFiles.reduce((total, f) => total + f.rawData.byteLength, 0);
    if (totalSize > (NUM_DATA_BLOCKS * BLOCK_SIZE)) {
      throw new Error(`Total size of files is ${totalSize} bytes (${totalSize / BLOCK_SIZE} blocks) but max size is ${NUM_DATA_BLOCKS * BLOCK_SIZE} bytes (${NUM_DATA_BLOCKS} blocks)`);
    }

    // Create our directory frames + save blocks

    const headerBlock = Ps1DirectoryBlock.createHeaderBlock(saveFiles);
    const saveBlocks = Ps1SaveBlocks.createSaveBlocks(saveFiles);

    // Concat all of our blocks together to form our memcard image

    const arrayBuffer = Util.concatArrayBuffers([headerBlock, ...saveBlocks]);

    // Now go back and re-parse the data we've created to get the description etc for each file

    return new Ps1MemcardSaveData(arrayBuffer);
  }

  // This constructor creates a new object from a binary representation of a PS1 memcard
  constructor(arrayBuffer) {
    this.arrayBuffer = arrayBuffer;

    const headerArrayBuffer = arrayBuffer.slice(0, BLOCK_SIZE); // The first block describes the layout of the card, and is hidden from the user
    const dataBlocksArrayBuffer = arrayBuffer.slice(BLOCK_SIZE, BLOCK_SIZE * NUM_TOTAL_BLOCKS); // The remaining blocks contain the actual save data

    const saveFilesFromDirectory = Ps1DirectoryBlock.readDirectoryBlock(headerArrayBuffer);

    this.saveFiles = saveFilesFromDirectory.map((saveFile) => Ps1SaveBlocks.readSaveBlocks(saveFile, dataBlocksArrayBuffer));
  }

  getDirectoryFrame(i) {
    const headerArrayBuffer = this.arrayBuffer.slice(0, BLOCK_SIZE);
    return Ps1DirectoryBlock.getDirectoryFrame(headerArrayBuffer, i);
  }

  getSaveFiles() {
    return this.saveFiles;
  }

  getArrayBuffer() {
    return this.arrayBuffer;
  }
}
