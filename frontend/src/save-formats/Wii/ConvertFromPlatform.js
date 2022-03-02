/*
The Wii save files that we get from the SD card are copied from the Wii's internal NAND memory and then
encrypted/obfuscated before being written to the SD card.

Once we've decrypted them, we're left with the file as it was stored on the NAND. However, that file may still be
in a strange format that needs more massaging before it can be loaded by an emulator.

More information can be found here:

https://github.com/JanErikGunnar/vcromclaim/blob/master/wiimetadata.py#L473
*/

import ConvertFromN64 from './ConvertFromN64';
import ConvertFromSega from './ConvertFromSega';
import ConvertFromPcEngine from './ConvertFromPcEngine';

export default (arrayBuffer, platformType, gameId) => {
  let output = null;

  switch (platformType) {
    case 'VC-NES':
      output = {
        saveData: arrayBuffer.slice(64), // NES games have a 64 byte header: https://github.com/JanErikGunnar/vcromclaim/blob/master/nes_extract.py#L242
        fileExtension: 'sav',
      };
      break;

    case 'VC-PCE':
      output = ConvertFromPcEngine(arrayBuffer);
      break;

    case 'VC-MD':
    case 'VC-SMS':
      output = ConvertFromSega(arrayBuffer, platformType, gameId);
      break;

    case 'VC-N64':
      output = ConvertFromN64(arrayBuffer);
      break;

    case 'VC-C64': // A few of these games offered saving, usually of high scores. Impossible Mission II (PAL regions) offered saving the game. I couldn't find any Wii VC save files online to test with
    case 'VC-SNES': // https://github.com/JanErikGunnar/vcromclaim/blob/master/wiimetadata.py#L482
    case 'VC-NEOGEO': // https://github.com/JanErikGunnar/vcromclaim/blob/master/wiimetadata.py#L501 Haven't been able to find any saves online to test this with. Partial (?) list of Neo Geo games that supported saves: https://www.nintendolife.com/forums/virtual_console/neogeo_games_that_allow_saves#reply-05
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
