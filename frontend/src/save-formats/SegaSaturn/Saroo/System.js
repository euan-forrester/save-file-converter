/*
Prior to firmware 0.7, the Saroo writes out a copy of the Saturn's internal memory to SS_BUP.BIN when the user goes into the CD player
https://github.com/tpunix/SAROO/issues/232#issuecomment-2574200546

The format is the same as the emulator format for internal saves, except it's byte expanded with 0xFF
*/

import SegaSaturnSaveData from '../SegaSaturn';
import GenesisUtil from '../../../util/Genesis';

const PADDING_VALUE = 0xFF;

export default class SarooSegaSaturnSystemSaveData {
  static createWithNewSize(/* segaSaturnSaveData, newSize */) {
    /*
    const newRawSaveData = SegaSaturnUtil.resize(segaSaturnSaveData.getArrayBuffer(), newSize);

    return SegaSaturnSaveData.createFromSegaSaturnData(newRawSaveData);
    */
  }

  static isSystemSarooData(arrayBuffer) {
    try {
      SarooSegaSaturnSystemSaveData.createFromSarooData(arrayBuffer);
      return true;
    } catch (e) {
      return false;
    }
  }

  static createFromSarooData(arrayBuffer) {
    const internalArrayBuffer = GenesisUtil.byteCollapse(arrayBuffer);

    return SegaSaturnSaveData.createFromSegaSaturnData(internalArrayBuffer);
  }

  static createFromSaveFiles(saveFiles) {
    const segaSaturnSaveData = SegaSaturnSaveData.createFromSaveFiles(saveFiles, SegaSaturnSaveData.INTERNAL_BLOCK_SIZE);

    return new SegaSaturnSaveData(
      GenesisUtil.byteExpand(segaSaturnSaveData.getArrayBuffer(), PADDING_VALUE),
      segaSaturnSaveData.getSaveFiles(),
      segaSaturnSaveData.getVolumeInfo(),
    );
  }
}
