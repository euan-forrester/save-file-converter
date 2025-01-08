/*
The popular emulator mednafen reads/writes raw Saturn BIOS files, but compresses the cartridge saves using gzip

Note that it is able to load uncompressed cartridge saves as well: it will just compress them when you exit the emulator.

Also, our compressed files are very slightly different from the ones that it creates (different by 1 bit in my test case),
probably because of different compression settings. But the emulator is able to load them fine as well.
*/

import SegaSaturnSaveData from '../SegaSaturn';

import CompressionGzip from '../../../util/CompressionGzip';

export default class MednafenSegaSaturnSaveData {
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

    return SegaSaturnSaveData.createFromSegaSaturnData(uncompressedArrayBuffer);
  }

  static createFromSaveFiles(saveFiles, blockSize) {
    const segaSaturnSaveData = SegaSaturnSaveData.createFromSaveFiles(saveFiles, blockSize);

    if (blockSize === SegaSaturnSaveData.CARTRIDGE_BLOCK_SIZE) {
      return new SegaSaturnSaveData(
        CompressionGzip.compress(segaSaturnSaveData.getArrayBuffer()),
        segaSaturnSaveData.getSaveFiles(),
        segaSaturnSaveData.getVolumeInfo(),
      );
    }

    return segaSaturnSaveData;
  }
}
