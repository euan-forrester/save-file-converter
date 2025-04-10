/*
The older emulator yabause reads/writes raw Saturn BIOS files which are byte-expanded

I'm unsure of what cartridge saves look like from this emulator because I haven't seen an example yet
*/

import SegaSaturnSaveData from '../SegaSaturn';

import GenesisUtil from '../../../util/Genesis';

const PADDING_VALUE = 0xFF;

export default class YabauseSegaSaturnSaveData {
  static createWithNewSize(/* segaSaturnSaveData, newSize */) {
    /*
    const newRawSaveData = SegaSaturnUtil.resize(segaSaturnSaveData.getArrayBuffer(), newSize);

    return SegaSaturnSaveData.createFromSegaSaturnData(newRawSaveData);
    */
  }

  static createFromSegaSaturnData(arrayBuffer) {
    // Cartridge saves from yabause are byte-expanded

    if (!GenesisUtil.isByteExpanded(arrayBuffer)) {
      throw new Error('This does not appear to be a yabause save file');
    }

    const byteCollapsedArrayBuffer = GenesisUtil.byteCollapse(arrayBuffer);

    return SegaSaturnSaveData.createFromSegaSaturnData(byteCollapsedArrayBuffer);
  }

  static createFromSaveFiles(saveFiles, blockSize) {
    const segaSaturnSaveData = SegaSaturnSaveData.createFromSaveFiles(saveFiles, blockSize);

    return new SegaSaturnSaveData(
      GenesisUtil.byteExpand(segaSaturnSaveData.getArrayBuffer(), PADDING_VALUE),
      segaSaturnSaveData.getSaveFiles(),
      segaSaturnSaveData.getVolumeInfo(),
    );
  }
}
