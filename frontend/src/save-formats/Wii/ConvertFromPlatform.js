/*
The Wii save files that we get from the SD card are copied from the Wii's internal NAND memory and then
encrypted/obfuscated before being written to the SD card.

Once we've decrypted them, we're left with the file as it was stored on the NAND. However, that file may still have
additional proprietary metadata in it that must also be stripped away before we're left with a raw file that can be
loaded by a different emulator.

The proprietary metadata depends on the target platform for the save data.

More information can be found here:

https://github.com/JanErikGunnar/vcromclaim/blob/master/wiimetadata.py#L473
*/

import ConvertFromN64 from './ConvertFromN64';
import ConvertFromSega from './ConvertFromSega';

export default (arrayBuffer, platformType) => {
  let output = null;

  switch (platformType) {
    case 'VC-NES':
      output = {
        saveData: arrayBuffer.slice(64), // NES games have a 64 byte header: https://github.com/JanErikGunnar/vcromclaim/blob/master/nes_extract.py#L242
        fileExtension: 'sav',
      };
      break;

    case 'VC-PCE':
      // Turbografx-16 games have a strange format that looks encrypted or compressed, and not like what I see
      // when I look at a save made by a PCEngine emulator. Not sure how to parse them further.
      //
      // There may be a 32 byte header: the file is 32 bytes longer than 8kB, and it begins with the text "PCE", similar
      // to how the NES header above contains some similar text.
      output = {
        saveData: arrayBuffer,
        fileExtension: 'bup',
      };
      break;

    case 'VC-MD':
    case 'VC-SMS':
      output = ConvertFromSega(arrayBuffer, platformType);
      break;

    case 'VC-N64':
      output = ConvertFromN64(arrayBuffer);
      break;

    case 'VC-C64': // A few of these games offered saving, usually of high scores. Impossible Mission II (PAL regions) offered saving the game. I couldn't find any Wii VC save files online to test with
    case 'VC-SNES': // https://github.com/JanErikGunnar/vcromclaim/blob/master/wiimetadata.py#L482
    case 'VC-NEOGEO': // https://github.com/JanErikGunnar/vcromclaim/blob/master/wiimetadata.py#L501
    case 'VC-Arcade': // Do these even have saves?
    case 'Wii':
    case 'WiiWare':
    case 'Homebrew':
    case 'Unknown':
      // Nothing needs to be done for these platforms
      output = {
        saveData: arrayBuffer,
        fileExtension: 'sav',
      };
      break;

    default:
      throw new Error(`Unknown Wii platform: '${platformType}'`);
  }

  return output;
};
