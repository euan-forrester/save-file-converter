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

export default class OnlineEmulatorWrapper {
  static async createFromEmulatorData(emulatorSaveStateArrayBuffer, platform, saveSize) {
    // First we need to determine whether we've been given a compressed file containing save states,
    // or just given a save state directly

    const zip = new JSZip();

    const zipContents = await zip.loadAsync(emulatorSaveStateArrayBuffer, { checkCRC32: true });

    const compressedSaveStateFiles = zipContents.filter((relativePath, file) => (IMAGE_FILE_TYPES.indexOf(Util.getExtension(file.name)) < 0));

    const saveStateDataPromises = compressedSaveStateFiles.map((file) => file.async('arraybuffer'));
    const saveStateData = await Promise.all(saveStateDataPromises);

    const saveStates = compressedSaveStateFiles.map((file, i) => ({ name: file.name, arrayBuffer: saveStateData[i] }));

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
