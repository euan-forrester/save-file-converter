// Extracts executables from a PSP .ISO image

import * as BrowserFS from 'browserfs';

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

export default class PspIso {
  static async Create(isoArrayBuffer, name) {
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

    const fs = BrowserFS.BFSRequire('fs');

    const encryptedExecutableExists = await fileExists(fs, '/PSP_GAME/SYSDIR/EBOOT.BIN');

    console.log(`Found encrypted file: ${encryptedExecutableExists}`);

    return new PspIso(fs);
  }

  constructor(fs) {
    this.fs = fs;
  }

  foundExecutable() {
    return this.fs !== null;
  }
}
