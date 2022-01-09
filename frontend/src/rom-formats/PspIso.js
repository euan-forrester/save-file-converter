// Extracts executables from a PSP .ISO image
// This is based on https://github.com/hrydgard/ppsspp/blob/master/Core/PSPLoaders.cpp

import * as BrowserFS from 'browserfs';

import Util from '../util/util';
import PspParmSfo from '../save-formats/PSP/ParamSfo';

const EXECUTABLE_MAGIC_ENCODING = 'US-ASCII';
const EXECUTABLE_MAGIC = ['~PSP', '\x7FELF'];
const EXECUTABLE_MAGIC_OFFSET = 0;

const MAIN_EXECUTABLE_PATH = '/PSP_GAME/SYSDIR/EBOOT.BIN';
const UNENCRYPTED_EXECUTABLE_PATH = '/PSP_GAME/SYSDIR/BOOT.BIN'; // After firmware 3 was released, games no longer came with unencrypted versions on the UMD. The file is still present, but it's all dummy data for those later games. Apparently the size of the dummy data is the correct size of the decrypted executable though

const PARAM_SFO_PATH = '/PSP_GAME/PARAM.SFO';

// Taken from https://github.com/hrydgard/ppsspp/blob/e094f5673a4f171927afe6eb41eba0326c4511c7/Core/PSPLoaders.cpp#L221
//
// Apparently some translators like to rename the original EBOOT.BIN file to one of the filenames below,
// and then make a new EBOOT.BIN that first launches a plugin and then the actual game.
// We want to look in the actual executable to try and find our gamekey
const ALTERNATIVE_EXECUTABLE_PATHS = [
  'PSP_GAME/SYSDIR/EBOOT.OLD',
  'PSP_GAME/SYSDIR/EBOOT.DAT',
  'PSP_GAME/SYSDIR/EBOOT.BI',
  'PSP_GAME/SYSDIR/EBOOT.LLD',
  // 'PSP_GAME/SYSDIR/OLD_EBOOT.BIN', //Utawareru Mono Chinese version
  'PSP_GAME/SYSDIR/EBOOT.123',
  // 'PSP_GAME/SYSDIR/EBOOT_LRC_CH.BIN', // Hatsune Miku Project Diva Extend chinese version
  'PSP_GAME/SYSDIR/BOOT0.OLD',
  'PSP_GAME/SYSDIR/BOOT1.OLD',
  'PSP_GAME/SYSDIR/BINOT.BIN',
  'PSP_GAME/SYSDIR/EBOOT.FRY',
  'PSP_GAME/SYSDIR/EBOOT.Z.Y',
  'PSP_GAME/SYSDIR/EBOOT.LEI',
  'PSP_GAME/SYSDIR/EBOOT.DNR',
  'PSP_GAME/SYSDIR/DBZ2.BIN',
  // 'PSP_GAME/SYSDIR/ss.RAW',//Code Geass: Lost Colors chinese version
];

// Taken from https://github.com/hrydgard/ppsspp/blob/e094f5673a4f171927afe6eb41eba0326c4511c7/Core/PSPLoaders.cpp#L264
//
// PPSSPP checks for these game IDs by looking at the PARAM.SFO file on the disc. It sounds like other games may have other
// game data files with these paths, so that's why they check the game ID as well.

const OTHER_ALTERNATIVE_EXECUTABLE_PATHS = [
  { gameId: 'NPJH50624', path: '/PSP_GAME/USRDIR/PAKFILE2.BIN' }, // Hunter x Hunter World Adventure (Jpn)
  { gameId: 'NPJH00100', path: '/PSP_GAME/USRDIR/DATA/GIM/GBL' }, // World Neverland: Kukuria Oukoku Monogatari (Jpn)
];

async function getFileSystem(isoArrayBuffer, name) {
  const browserFsBuffer = BrowserFS.BFSRequire('buffer').Buffer;

  const fsReady = new Promise((resolve, reject) => {
    BrowserFS.configure({
      fs: 'IsoFS',
      options: {
        data: browserFsBuffer.from(isoArrayBuffer),
        name,
      },
    }, (err) => { if (err) reject(err); resolve(); });
  });

  await fsReady;

  return BrowserFS.BFSRequire('fs');
}

async function fileExists(fs, path) {
  const statPromise = new Promise((resolve, reject) => {
    fs.stat(path, (err) => { if (err) reject(err); resolve(); });
  });

  try {
    await statPromise;
  } catch (e) {
    return false;
  }

  return true;
}

async function readFile(fs, path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => { if (err) reject(err); resolve(Util.bufferToArrayBuffer(data)); }); // This returns a browserfs Buffer. Somewhere buried in browserfs there is a function called buffer2ArrayBuffer() but I can't figure out how to import it and it looks a lot like our own util function here. Apparently browserfs Buffers are uint8arrays
  });
}

async function getGameId(fs) {
  const paramSfoExists = await fileExists(fs, PARAM_SFO_PATH);

  if (!paramSfoExists) {
    return null; // PPSSPP doesn't fail loading a game if this file is missing, so we shouldn't either
  }

  const paramSfoArrayBuffer = await readFile(fs, PARAM_SFO_PATH);

  const paramSfo = new PspParmSfo(paramSfoArrayBuffer);

  return paramSfo.getValue('DISC_ID');
}

async function findFirstPathThatExists(fs, pathsArray) {
  const pathExistsArray = await Promise.all(pathsArray.map((x) => fileExists(fs, x)));
  const pathExistsIndex = pathExistsArray.findIndex((x) => x);

  if (pathExistsIndex >= 0) {
    return pathsArray[pathExistsIndex];
  }

  return null;
}

async function getExecutable(fs, gameId) {
  // This is based on https://github.com/hrydgard/ppsspp/blob/e094f5673a4f171927afe6eb41eba0326c4511c7/Core/PSPLoaders.cpp#L240

  let pathToExecutable = null;
  let executableArrayBuffer = null;
  let executableIsEncrypted = true;

  const mainExecutablePathExists = await fileExists(fs, MAIN_EXECUTABLE_PATH);
  if (mainExecutablePathExists) {
    pathToExecutable = MAIN_EXECUTABLE_PATH;
  }

  const alternativePathToExecutable = await findFirstPathThatExists(fs, ALTERNATIVE_EXECUTABLE_PATHS);

  if (alternativePathToExecutable !== null) {
    pathToExecutable = alternativePathToExecutable;
  }

  const otherAlternativePaths = OTHER_ALTERNATIVE_EXECUTABLE_PATHS.filter((x) => x.gameId === gameId).map((x) => x.path);
  const otherAlternativePathToExecutable = await findFirstPathThatExists(fs, otherAlternativePaths);

  if (otherAlternativePathToExecutable !== null) {
    pathToExecutable = otherAlternativePathToExecutable;
  }

  // There's a file that exists at either that main executable path or one of the alternative paths.
  // Check if it's an actual encrypted executable

  if (pathToExecutable !== null) {
    executableArrayBuffer = await readFile(fs, pathToExecutable);

    let magicMatches = false;

    EXECUTABLE_MAGIC.forEach((potentialMagic) => {
      try {
        Util.checkMagic(executableArrayBuffer, EXECUTABLE_MAGIC_OFFSET, potentialMagic, EXECUTABLE_MAGIC_ENCODING);
        magicMatches = true;
      } catch (e) {
        // Try the next potentialMagic
      }
    });

    if (!magicMatches) {
      pathToExecutable = null;
    }
  }

  if (pathToExecutable === null) {
    // Couldn't find an encrypted executable, so let's try the unencrypted one

    const unencryptedExecutablePathExists = await fileExists(fs, UNENCRYPTED_EXECUTABLE_PATH);

    if (unencryptedExecutablePathExists) {
      pathToExecutable = UNENCRYPTED_EXECUTABLE_PATH;
      executableIsEncrypted = false;
      executableArrayBuffer = await readFile(fs, UNENCRYPTED_EXECUTABLE_PATH);
    }
  }

  if (pathToExecutable === null) {
    // We couldn't find any known file, so it's not a valid disc image
    throw new Error('This does not appear to be a valid PSP UMD image');
  }

  return {
    path: pathToExecutable,
    encrypted: executableIsEncrypted,
    arrayBuffer: executableArrayBuffer,
  };
}

export default class PspIso {
  static async Create(isoArrayBuffer, name) {
    const fs = await getFileSystem(isoArrayBuffer, name);

    const gameId = await getGameId(fs);
    const executableInfo = await getExecutable(fs, gameId);

    return new PspIso(executableInfo);
  }

  constructor(executableInfo) {
    this.executableInfo = executableInfo;
  }

  getExecutableInfo() {
    return this.executableInfo;
  }
}
