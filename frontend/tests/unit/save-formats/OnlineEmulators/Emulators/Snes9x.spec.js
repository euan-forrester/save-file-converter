import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import Snes9xSaveStateData from '@/save-formats/OnlineEmulators/Emulators/Snes9x';

const DIR = './tests/data/save-formats/online-emulators/arcadespot.com/snes';

const EMULATOR_FILENAME = `${DIR}/Legend-of-Zelda-The-A-Link-to-the-Past-U-.save`;
const RAW_FILENAME = `${DIR}/Legend-of-Zelda-The-A-Link-to-the-Past-U-.sav`;

describe('OnlineEmulators - SNES - Snes9x', () => {
  it('should convert an emulator save state to raw format', async () => {
    const emulatorSaveStateArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    const emulatorSaveStateData = Snes9xSaveStateData.createFromSaveStateData(emulatorSaveStateArrayBuffer);

    expect(emulatorSaveStateData.getRawArrayBuffer().byteLength).to.equal(131072); // This is the value specified in the save state

    expect(ArrayBufferUtil.arrayBuffersEqual(emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });
});
