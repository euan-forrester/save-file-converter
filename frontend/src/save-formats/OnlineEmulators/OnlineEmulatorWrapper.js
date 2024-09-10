// At their core, many online emulator sites appear to use mostly the same underlying emulators, which appear to be
// supplied to them by a couple of different sources such as neptunejs[.]xyz or retroemulator[.]com
//
// The big difference is that some sites will only allow the user to download/upload a single save state
// while other sites will manage a set of save states and allow the user to download a zip file containing all of them.
//
// Some of the sites that support these zip files will include a screen shot file along with each save state file.
// So we want to filter those out

import JSZip from 'jszip';

import Util from '../../util/util';
import PlatformSaveSizes from '../PlatformSaveSizes';

import Snes9xSaveStateData from './Emulators/Snes9x';
import GbSaveStateData from './Emulators/Gb';
import VbaNextSaveStateData from './Emulators/VBA-Next';
import MGbaSaveStateData from './Emulators/mGba';

const IMAGE_FILE_TYPES = ['.png', '.jpg', '.jpeg', '.tif', '.tiff', '.gif', '.bmp'];

const GBA_SAVE_STATE_TYPES = [
  // We're just testing based on file size, so go from the largest file to the smallest
  VbaNextSaveStateData,
  MGbaSaveStateData,
];

async function getSaveStatesFromZip(zipContents) {
  const compressedSaveStateFiles = zipContents.filter((relativePath, file) => (IMAGE_FILE_TYPES.indexOf(Util.getExtension(file.name)) < 0));

  const saveStateData = await Promise.all(compressedSaveStateFiles.map((file) => file.async('arraybuffer')));

  return compressedSaveStateFiles.map((file, i) => ({ name: file.name, arrayBuffer: saveStateData[i] }));
}

function getSaveStateFromSingleFile(arrayBuffer, filename) {
  return [{ name: filename, arrayBuffer }];
}

function getClass(platform, saveStateArrayBuffer) {
  switch (platform) {
    case 'snes':
      return Snes9xSaveStateData;

    case 'gba': {
      const saveStateType = GBA_SAVE_STATE_TYPES.find((clazz) => {
        try {
          clazz.createFromSaveStateData(saveStateArrayBuffer, PlatformSaveSizes.gba[0]); // Smallest size because if we pick a bigger one we might get a false positive for one of the classes if the save state file is for a smaller sized save state type but with a bigger internal save file
          return true;
        } catch (e) {
          return false;
        }
      });

      if (saveStateType === undefined) {
        throw new Error('Unrecogized GBA save state');
      }

      return saveStateType;
    }

    case 'gb':
      return GbSaveStateData;

    default:
      throw new Error(`Unrecognized platform type: '${platform}'`);
  }
}

export default class OnlineEmulatorWrapper {
  static async createFromEmulatorData(emulatorSaveStateArrayBuffer, emulatorSaveStateFilename, platform, saveSize = null) {
    // First we need to determine whether we've been given a compressed file containing save states,
    // or just given a save state directly

    const zip = new JSZip();

    let saveStates = [];

    try {
      const zipContents = await zip.loadAsync(emulatorSaveStateArrayBuffer, { checkCRC32: true });
      saveStates = await getSaveStatesFromZip(zipContents);
    } catch (e) {
      // According to wikipedia, the correct way to determine whether a file is a zip file is to look
      // for an end of central directory record. There's also a byte signature at the start of the file,
      // but apparently this is optional and not always present
      // https://en.wikipedia.org/wiki/ZIP_(file_format)#Structure
      if (e.message.startsWith('Can\'t find end of central directory')) {
        saveStates = getSaveStateFromSingleFile(emulatorSaveStateArrayBuffer, emulatorSaveStateFilename);
      } else {
        throw e;
      }
    }

    // Now that we have our save state data, turn it into raw in-game saves

    const clazz = getClass(platform, saveStates[0].arrayBuffer);
    const files = saveStates.map((saveState) => ({
      name: saveState.name,
      emulatorSaveStateData: clazz.createFromSaveStateData(saveState.arrayBuffer, saveSize),
    }));

    return new OnlineEmulatorWrapper(files, platform, clazz);
  }

  static getRawFileExtension() {
    return 'sav';
  }

  static createWithNewSize(onlineEmulatorWrapperData, newSize) {
    const files = onlineEmulatorWrapperData.getFiles().map((file) => ({
      ...file,
      emulatorSaveStateData: onlineEmulatorWrapperData.getClass().createWithNewSize(file.emulatorSaveStateData, newSize),
    }));

    return new OnlineEmulatorWrapper(files, onlineEmulatorWrapperData.getPlatform(), onlineEmulatorWrapperData.getClass());
  }

  static fileSizeIsRequiredToConvert(platform) {
    const clazz = getClass(platform);

    return clazz.fileSizeIsRequiredToConvert();
  }

  constructor(files, platform, clazz) {
    this.files = files;
    this.platform = platform;
    this.clazz = clazz;
  }

  adjustOutputSizesPlatform() {
    return this.platform;
  }

  getFiles() {
    return this.files;
  }

  getPlatform() {
    return this.platform;
  }

  getClass() {
    return this.clazz;
  }
}
