/*
The emulator yaba sanshiro reads/writes raw Saturn BIOS files which are byte-expanded.
They're also a nonstandard length (0x800000 bytes, byte-expanded -- so 0x400000 regular) that's much longer than
regular BIOS files (0x8000 bytes) or regular backup cart files (0x80000 bytes)

I'm unsure of what cartridge saves look like from this emulator because I haven't seen an example yet
*/

import SegaSaturnSaveData from '../SegaSaturn';

import GenesisUtil from '../../../util/Genesis';

const PADDING_VALUE = 0xFF;

const BLOCK_SIZE = 0x40;
const FILE_SIZE = 0x800000; // The final, byte-expanded, file size

export default class YabaSanshiroSegaSaturnSaveData {
  static createWithNewSize(/* segaSaturnSaveData, newSize */) {
    /*
    const newRawSaveData = SegaSaturnUtil.resize(segaSaturnSaveData.getArrayBuffer(), newSize);

    return SegaSaturnSaveData.createFromSegaSaturnData(newRawSaveData);
    */
  }

  static createFromSegaSaturnData(arrayBuffer) {
    // Saves from yaba sanshiro are byte-expanded

    if (!GenesisUtil.isByteExpanded(arrayBuffer)) {
      throw new Error('This does not appear to be a yaba sanshiro save file');
    }

    const byteCollapsedArrayBuffer = GenesisUtil.byteCollapse(arrayBuffer);

    return SegaSaturnSaveData.createFromSegaSaturnData(byteCollapsedArrayBuffer, BLOCK_SIZE);
  }

  static createFromSaveFiles(saveFiles) {
    const segaSaturnSaveData = SegaSaturnSaveData.createFromSaveFiles(saveFiles, BLOCK_SIZE, FILE_SIZE / 2);

    return new SegaSaturnSaveData(
      GenesisUtil.byteExpand(segaSaturnSaveData.getArrayBuffer(), PADDING_VALUE),
      segaSaturnSaveData.getSaveFiles(),
      segaSaturnSaveData.getVolumeInfo(),
    );
  }
}
