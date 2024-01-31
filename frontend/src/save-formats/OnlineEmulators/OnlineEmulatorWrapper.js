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

import Snes9xSaveStateData from './Emulators/Snes9x';
import VbaNextSaveStateData from './Emulators/VBA-Next';

const IMAGE_FILE_TYPES = ['.png', '.jpg', '.jpeg', '.tif', '.tiff', '.gif', '.bmp'];

async function getSaveStatesFromZip(zipContents) {
  const compressedSaveStateFiles = zipContents.filter((relativePath, file) => (IMAGE_FILE_TYPES.indexOf(Util.getExtension(file.name)) < 0));

  const saveStateData = await Promise.all(compressedSaveStateFiles.map((file) => file.async('arraybuffer')));

  return compressedSaveStateFiles.map((file, i) => ({ name: file.name, arrayBuffer: saveStateData[i] }));
}

function getSaveStateFromSingleFile(arrayBuffer, filename) {
  return [{ name: filename, arrayBuffer }];
}

export default class OnlineEmulatorWrapper {
  static async createFromEmulatorData(emulatorSaveStateArrayBuffer, emulatorSaveStateFilename, platform, saveSize) {
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

    let files = null;

    switch (platform) {
      case 'snes': {
        files = saveStates.map((saveState) => ({ name: saveState.name, emulatorSaveStateData: Snes9xSaveStateData.createFromSaveStateData(saveState.arrayBuffer) }));
        break;
      }

      case 'gba': {
        files = saveStates.map((saveState) => ({ name: saveState.name, emulatorSaveStateData: VbaNextSaveStateData.createFromSaveStateData(saveState.arrayBuffer, saveSize) }));
        break;
      }

      default: {
        throw new Error(`Unrecognized platform type: '${platform}'`);
      }
    }

    return new OnlineEmulatorWrapper(files, platform);
  }

  static createWithNewSize(onlineEmulatorWrapperData, newSize) {
    console.log(`onlineEmulatorWrapperData: ${onlineEmulatorWrapperData}, newSize: ${newSize}`);
  }

  static getRawFileExtension() {
    return 'sav';
  }

  static adjustOutputSizesPlatform() {
    return this.platform;
  }

  constructor(files, platform) {
    this.files = files;
    this.platform = platform;
  }

  getFiles() {
    return this.files;
  }
}
