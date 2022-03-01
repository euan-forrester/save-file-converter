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

// Lists taken from https://forum.digitpress.com/forum/showthread.php?134961-NES-SNES-Genny-Games-with-Battery-Back-up-Save-feature&p=1614576&viewfull=1#post1614576

const GENESIS_EEPROM_GAME_IDS = [
// Blockbuster World Videogame Championship II (NBA Jam T.E. portion) (EEPROM)
// Mega Man: The Wily Wars (Europe/Japan only title on physical cart; all European copies of the game, and the second ([alt] rom) release of the Japanese version, use EEPROM. The original Japanese release uses SRAM (battery).
// Micro Machines 2 (Europe exclusive title) (EEPROM)
// Micro Machines '96 (Europe exclusive title) (EEPROM)
// Micro Machines Military (Europe exclusive title) (EEPROM)
// Brian Lara/Shane Warne Cricket (Europe/Australia exclusive title) (EEPROM)
// Barkley: Shut Up and Jam! 2 (EEPROM)
// College Slam (EEPROM)
// Evander "Real Deal" Holyfield Boxing (EEPROM)
// Frank Thomas Big Hurt Baseball (EEPROM)
// Greatest Heavyweights of the Ring (EEPROM)
// NBA Jam (EEPROM)
// NBA Jam Tournament Edition (EEPROM)
// NFL Quarterback Club (EEPROM)
// NFL Quarterback Club '96 (EEPROM)
// NHLPA Hockey '93 (EEPROM)
// Rings of Power (EEPROM)
// Sports Talk Baseball (EEPROM)
// Unnecessary Roughness '95 (EEPROM)
  'MAVE', // Wonder Boy in Monster World (EEPROM)
];

const GENESIS_FRAM_GAME_IDS = [
  'MBME', // Sonic the Hedgehog 3 (FRAM) (NTSC)
  'MBMP', // Sonic the Hedgehog 3 (FRAM) (PAL)
];

export default (arrayBuffer, platformType, gameId) => {
  let output = null;
  let saveType = null;

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
      saveType = 'SRAM';

      if (GENESIS_EEPROM_GAME_IDS.indexOf(gameId) >= 0) {
        saveType = 'EEPROM';
      } else if (GENESIS_FRAM_GAME_IDS.indexOf(gameId) >= 0) {
        saveType = 'FRAM';
      }

      output = ConvertFromSega(arrayBuffer, platformType, saveType);
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
