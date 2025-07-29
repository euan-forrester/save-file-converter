/* eslint-disable no-bitwise */

/*
There are various formats on GameFAQs for individual save files. Fortunately they have magic in the header
which makes them easy to distinguish between
*/

import GameCubeGameSharkSaveData from './GameShark';
import GameCubeMaxDriveSaveData from './MaxDrive';
import GameCubeGciSaveData from './Gci';

const INDIVIDUAL_SAVE_CLASSES = [
  GameCubeGameSharkSaveData,
  GameCubeMaxDriveSaveData,
  GameCubeGciSaveData, // This one last because it doesn't have any handy magic bytes in the header to easily distinguish it
];

export default class IndividualSaves {
  static convertIndividualSaveToSaveFile(individualSave) {
    INDIVIDUAL_SAVE_CLASSES.forEach((individualSaveClass) => {
      try {
        return individualSaveClass.convertIndividualSaveToSaveFile(individualSave);
      } catch (e) {
        // Move onto the next individual save type
      }
    });

    throw new Error('This does not appear to be a GameCube individual save file');
  }
}
