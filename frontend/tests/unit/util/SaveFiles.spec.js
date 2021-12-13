import { expect } from 'chai';
import SaveFilesUtil from '@/util/SaveFiles';

const SAVE_FILE_SIZE = 8192;

describe('SaveFilesUtil', () => {
  it('should create a save file that erases a save from a cartridge', () => {
    const saveFile = new ArrayBuffer(SAVE_FILE_SIZE);
    const saveFileArray = new Uint8Array(saveFile);

    for (let i = 0; i < SAVE_FILE_SIZE; i += 1) {
      saveFileArray[i] = (i % 255) + 1; // All non-zero
    }

    const eraseSaveFile = SaveFilesUtil.getEraseCartridgeSave(saveFile);
    const eraseSaveFileArray = new Uint8Array(eraseSaveFile);

    expect(eraseSaveFile.byteLength).to.equal(saveFile.byteLength);

    for (let i = 0; i < saveFile.byteLength; i += 1) {
      expect(saveFileArray[i]).to.not.equal(0);
      expect(eraseSaveFileArray[i]).to.equal(0);
    }
  });
});
