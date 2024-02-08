import { expect } from 'chai';
import Util from '@/util/util';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import OnlineEmulatorWrapper from '@/save-formats/OnlineEmulators/OnlineEmulatorWrapper';

const MULTIPLE_SAVE_DIR = './tests/data/save-formats/online-emulators/myemulator.online';
const SINGLE_SAVE_DIR = './tests/data/save-formats/online-emulators/arcadespot.com';

const MULTIPLE_SAVE_SNES_DIR = `${MULTIPLE_SAVE_DIR}/snes`;
const MULTIPLE_SAVE_GBA_DIR = `${MULTIPLE_SAVE_DIR}/gba`;

const SINGLE_SAVE_SNES_DIR = `${SINGLE_SAVE_DIR}/snes`;
const SINGLE_SAVE_GBA_DIR = `${SINGLE_SAVE_DIR}/gba`;

const EMULATOR_MULTIPLE_SAVE_SNES_FILENAME = `${MULTIPLE_SAVE_SNES_DIR}/sneszelda1.ggz`;
const RAW_MULTIPLE_SAVE_SNES_FILENAME = `${MULTIPLE_SAVE_SNES_DIR}/sneszelda1.sav`;

const EMULATOR_MULTIPLE_SAVE_GBA_FILENAME = `${MULTIPLE_SAVE_GBA_DIR}/gbazelda.ggz`;
const RAW_MULTIPLE_SAVE_GBA_FILENAMES = [
  `${MULTIPLE_SAVE_GBA_DIR}/gbazelda-0.sav`,
  `${MULTIPLE_SAVE_GBA_DIR}/gbazelda-1.sav`,
  `${MULTIPLE_SAVE_GBA_DIR}/gbazelda-2.sav`,
  `${MULTIPLE_SAVE_GBA_DIR}/gbazelda-3.sav`,
];

const EMULATOR_SINGLE_SAVE_SNES_FILENAME = `${SINGLE_SAVE_SNES_DIR}/Legend-of-Zelda-The-A-Link-to-the-Past-U-.save`;
const RAW_SINGLE_SAVE_SNES_FILENAME = `${SINGLE_SAVE_SNES_DIR}/Legend-of-Zelda-The-A-Link-to-the-Past-U-.sav`;

const EMULATOR_SINGLE_SAVE_GBA_FILENAME = `${SINGLE_SAVE_GBA_DIR}/the-legend-of-zelda-the-minish-cap.save`;
const RAW_SINGLE_SAVE_GBA_FILENAME = `${SINGLE_SAVE_GBA_DIR}/the-legend-of-zelda-the-minish-cap.sav`;

describe('OnlineEmulators - Wrapper', () => {
  it('should convert an online emulator file containing multiple SNES save states to raw format', async () => {
    const emulatorArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_MULTIPLE_SAVE_SNES_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_MULTIPLE_SAVE_SNES_FILENAME);

    const onlineEmulatorWrapper = await OnlineEmulatorWrapper.createFromEmulatorData(emulatorArrayBuffer, Util.getFilename(EMULATOR_MULTIPLE_SAVE_SNES_FILENAME), 'snes');

    expect(onlineEmulatorWrapper.getFiles().length).to.equal(1);

    expect(onlineEmulatorWrapper.getFiles()[0].name).to.equal('sneszelda12`Jan | 19 | 12:04 | 2024.snes');
    expect(onlineEmulatorWrapper.getFiles()[0].emulatorSaveStateData.getRawArrayBuffer().byteLength).to.equal(131072); // This is the value specified in the save state
    expect(ArrayBufferUtil.arrayBuffersEqual(onlineEmulatorWrapper.getFiles()[0].emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert an online emulator file containing multiple GBA save states to raw format', async () => {
    const emulatorArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_MULTIPLE_SAVE_GBA_FILENAME);
    const rawArrayBuffers = await Promise.all(RAW_MULTIPLE_SAVE_GBA_FILENAMES.map((n) => ArrayBufferUtil.readArrayBuffer(n)));

    const onlineEmulatorWrapper = await OnlineEmulatorWrapper.createFromEmulatorData(emulatorArrayBuffer, Util.getFilename(EMULATOR_MULTIPLE_SAVE_GBA_FILENAME), 'gba', 8192);

    expect(onlineEmulatorWrapper.getFiles().length).to.equal(4);

    expect(onlineEmulatorWrapper.getFiles()[0].name).to.equal('gbazelda1`Jan | 19 | 10:59 | 2024.gba');
    expect(ArrayBufferUtil.arrayBuffersEqual(onlineEmulatorWrapper.getFiles()[0].emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffers[0])).to.equal(true);

    expect(onlineEmulatorWrapper.getFiles()[1].name).to.equal('gbazelda2`Jan | 19 | 10:59 | 2024.gba');
    expect(ArrayBufferUtil.arrayBuffersEqual(onlineEmulatorWrapper.getFiles()[1].emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffers[1])).to.equal(true);

    expect(onlineEmulatorWrapper.getFiles()[2].name).to.equal('gbazelda3`Jan | 19 | 10:59 | 2024.gba');
    expect(ArrayBufferUtil.arrayBuffersEqual(onlineEmulatorWrapper.getFiles()[2].emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffers[2])).to.equal(true);

    expect(onlineEmulatorWrapper.getFiles()[3].name).to.equal('gbazelda4`Jan | 19 | 10:59 | 2024.gba');
    expect(ArrayBufferUtil.arrayBuffersEqual(onlineEmulatorWrapper.getFiles()[3].emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffers[3])).to.equal(true);
  });

  it('should convert an online emulator file containing a single SNES save states to raw format', async () => {
    const emulatorArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_SINGLE_SAVE_SNES_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_SINGLE_SAVE_SNES_FILENAME);

    const onlineEmulatorWrapper = await OnlineEmulatorWrapper.createFromEmulatorData(emulatorArrayBuffer, Util.getFilename(EMULATOR_SINGLE_SAVE_SNES_FILENAME), 'snes');

    expect(onlineEmulatorWrapper.getFiles().length).to.equal(1);

    expect(onlineEmulatorWrapper.getFiles()[0].name).to.equal(Util.getFilename(EMULATOR_SINGLE_SAVE_SNES_FILENAME));
    expect(onlineEmulatorWrapper.getFiles()[0].emulatorSaveStateData.getRawArrayBuffer().byteLength).to.equal(131072); // This is the value specified in the save state
    expect(ArrayBufferUtil.arrayBuffersEqual(onlineEmulatorWrapper.getFiles()[0].emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert an online emulator file containing a single GBA save states to raw format', async () => {
    const emulatorArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_SINGLE_SAVE_GBA_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_SINGLE_SAVE_GBA_FILENAME);

    const onlineEmulatorWrapper = await OnlineEmulatorWrapper.createFromEmulatorData(emulatorArrayBuffer, Util.getFilename(EMULATOR_SINGLE_SAVE_GBA_FILENAME), 'gba', 8192);

    expect(onlineEmulatorWrapper.getFiles().length).to.equal(1);

    expect(onlineEmulatorWrapper.getFiles()[0].name).to.equal(Util.getFilename(EMULATOR_SINGLE_SAVE_GBA_FILENAME));
    expect(ArrayBufferUtil.arrayBuffersEqual(onlineEmulatorWrapper.getFiles()[0].emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffer)).to.equal(true);
  });

  it('should resize saves within an online emulator file containing multiple GBA save states', async () => {
    const emulatorArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_MULTIPLE_SAVE_GBA_FILENAME);
    const rawArrayBuffers = await Promise.all(RAW_MULTIPLE_SAVE_GBA_FILENAMES.map((n) => ArrayBufferUtil.readArrayBuffer(n)));

    const onlineEmulatorWrapper = await OnlineEmulatorWrapper.createFromEmulatorData(emulatorArrayBuffer, Util.getFilename(EMULATOR_MULTIPLE_SAVE_GBA_FILENAME), 'gba', 8192);

    const resizedOnlineEmulatorWrapper = OnlineEmulatorWrapper.createWithNewSize(onlineEmulatorWrapper, 512);

    // These arraybuffers will be truncated versions of the correct in-game saves. They won't be valid to load in an emulator

    expect(resizedOnlineEmulatorWrapper.getFiles().length).to.equal(4);
    expect(resizedOnlineEmulatorWrapper.getFiles()[0].emulatorSaveStateData.getRawArrayBuffer().byteLength).to.equal(512);
    expect(resizedOnlineEmulatorWrapper.getFiles()[1].emulatorSaveStateData.getRawArrayBuffer().byteLength).to.equal(512);
    expect(resizedOnlineEmulatorWrapper.getFiles()[2].emulatorSaveStateData.getRawArrayBuffer().byteLength).to.equal(512);
    expect(resizedOnlineEmulatorWrapper.getFiles()[3].emulatorSaveStateData.getRawArrayBuffer().byteLength).to.equal(512);

    const rawArrayBuffersTruncated = rawArrayBuffers.map((i) => i.slice(0, 512));

    expect(ArrayBufferUtil.arrayBuffersEqual(resizedOnlineEmulatorWrapper.getFiles()[0].emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffersTruncated[0])).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(resizedOnlineEmulatorWrapper.getFiles()[1].emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffersTruncated[1])).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(resizedOnlineEmulatorWrapper.getFiles()[2].emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffersTruncated[2])).to.equal(true);
    expect(ArrayBufferUtil.arrayBuffersEqual(resizedOnlineEmulatorWrapper.getFiles()[3].emulatorSaveStateData.getRawArrayBuffer(), rawArrayBuffersTruncated[3])).to.equal(true);
  });

  it('should resize saves within an online emulator file containing multiple SNES save states', async () => {
    const emulatorArrayBuffer = await ArrayBufferUtil.readArrayBuffer(EMULATOR_SINGLE_SAVE_SNES_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_SINGLE_SAVE_SNES_FILENAME);

    const onlineEmulatorWrapper = await OnlineEmulatorWrapper.createFromEmulatorData(emulatorArrayBuffer, Util.getFilename(EMULATOR_SINGLE_SAVE_SNES_FILENAME), 'snes');

    const resizedOnlineEmulatorWrapper = OnlineEmulatorWrapper.createWithNewSize(onlineEmulatorWrapper, 512);

    // These arraybuffers will be truncated versions of the correct in-game saves. They won't be valid to load in an emulator

    expect(resizedOnlineEmulatorWrapper.getFiles().length).to.equal(1);
    expect(resizedOnlineEmulatorWrapper.getFiles()[0].emulatorSaveStateData.getRawArrayBuffer().byteLength).to.equal(512);

    const rawArrayBufferTruncated = rawArrayBuffer.slice(0, 512);

    expect(ArrayBufferUtil.arrayBuffersEqual(resizedOnlineEmulatorWrapper.getFiles()[0].emulatorSaveStateData.getRawArrayBuffer(), rawArrayBufferTruncated)).to.equal(true);
  });
});
