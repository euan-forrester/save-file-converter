/*
The MiSTer saves Genesis data as bytes (similar to the internal Wii format) rather than shorts like some emulators

Based on https://github.com/superg/srmtools
*/

import PaddingUtil from '../../util/Padding';
import GenesisUtil from '../../util/Genesis';

// Genesis files on the mister are padded out to 64k with 0xFFs.
// The core is apparently pretty lenient on reading unpadded files, but we'll still be friendly and pad ours out.
// There's one ROM hack, Sonic 1 Remastered, that instead requires padding out with 0x00s.
// But we're not going to handle that. How could we?
const MISTER_FILE_SIZE = 65536;
const MISTER_PADDING_VALUE = 0xFF;

function padArrayBuffer(inputArrayBuffer) {
  const padding = {
    value: MISTER_PADDING_VALUE,
    count: Math.max(MISTER_FILE_SIZE - inputArrayBuffer.byteLength, 0),
  };

  return PaddingUtil.addPaddingToEnd(inputArrayBuffer, padding);
}

export default class MisterGenesisSaveData {
  static getMisterFileExtension() {
    return 'sav';
  }

  static getRawFileExtension() {
    return 'srm';
  }

  static adjustOutputSizesPlatform() {
    return 'genesis';
  }

  static createFromMisterData(misterArrayBuffer) {
    // First, we need to unpad the mister save. Otherwise we will byte-expand all the 0xFFs at the end
    // which will result in a crazy file

    let unpaddedMisterArrayBuffer = misterArrayBuffer;

    const padding = PaddingUtil.getPadFromEndValueAndCount(misterArrayBuffer);

    // The Genesis MiSTer core can actually output files with either padding value.
    // I guess if it gets a file padded with 0x00 then it just maintains that?
    // So althugh it's tempting to only remove padding here if it's the MISTER_PADDING_VALUE
    // it seems to be more correct to always remove it
    unpaddedMisterArrayBuffer = PaddingUtil.removePaddingFromEnd(misterArrayBuffer, padding.count);

    if (GenesisUtil.isEepromSave(unpaddedMisterArrayBuffer)) {
      // If it's an EEPROM save, an emulator will want it to not be byte expanded
      return new MisterGenesisSaveData(unpaddedMisterArrayBuffer, unpaddedMisterArrayBuffer);
    }

    // Now that the padding is gone, we can proceed

    const rawArrayBuffer = GenesisUtil.byteExpand(unpaddedMisterArrayBuffer, 0x00);

    return new MisterGenesisSaveData(rawArrayBuffer, misterArrayBuffer); // Note that we're passing through the padded file here as the mister file
  }

  static createFromRawData(rawArrayBuffer) {
    // The mister takes all of its files as non-byte-expanded, whether they are SRAM/FRAM or EEPROM

    // Genesis EEPROM saves don't have either kind of strange byte expansion to work in an emulator that the SRAM and FRAM saves
    // for the Genesis do. And so it works as-is on a MiSTer.
    //
    // But, the user may not know that, and try to convert their save when trying to use it
    // on a MiSTer.
    //
    // Rather than display an error, which may mislead the user into not using the tool for other
    // subsequent files that DO require conversion, let's just silently pass back the same file (but add padding)
    // and pretend we converted it.
    //
    // This only applies to a really small list of games, so whichever tactic we choose here
    // won't have much of an impact (hopefully!)

    let unpaddedMisterArrayBuffer = rawArrayBuffer;

    if (GenesisUtil.isByteExpanded(rawArrayBuffer)) {
      unpaddedMisterArrayBuffer = GenesisUtil.byteCollapse(rawArrayBuffer);
    }

    return new MisterGenesisSaveData(rawArrayBuffer, padArrayBuffer(unpaddedMisterArrayBuffer));
  }

  // This constructor creates a new object from a binary representation of a MiSTer save data file
  constructor(rawArrayBuffer, misterArrayBuffer) {
    this.rawArrayBuffer = rawArrayBuffer;
    this.misterArrayBuffer = misterArrayBuffer;
  }

  getRawArrayBuffer() {
    return this.rawArrayBuffer;
  }

  getMisterArrayBuffer() {
    return this.misterArrayBuffer;
  }
}
