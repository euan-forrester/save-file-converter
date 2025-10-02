import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import DreamcastVmiVmsSaveData from '@/save-formats/Dreamcast/IndividualSaves/VmiVms';
import DreamcastUtil from '@/save-formats/Dreamcast/Util';

const DIR = './tests/data/save-formats/dreamcast/individualsaves';

const VMI_1_FILENAME = `${DIR}/IKARUGA.VMI`;
const VMS_1_FILENAME = `${DIR}/IKARUGA.VMS`;

const VMI_2_FILENAME = `${DIR}/v93102.vmi`;
const VMS_2_FILENAME = `${DIR}/v93102.VMS`;

const VMI_3_FILENAME = `${DIR}/v4596.vmi`;
const VMS_3_FILENAME = `${DIR}/v4596.VMS`;

const VMI_4_FILENAME = `${DIR}/KISSPC.VMI`;
const VMS_4_FILENAME = `${DIR}/KISSPC.VMS`;

describe('Dreamcast - .VMI/.VMS', () => {
  it('should correctly read a .VMI/.VMS pair of files', async () => {
    const vmiArrayBuffer = await ArrayBufferUtil.readArrayBuffer(VMI_1_FILENAME);
    const vmsArrayBuffer = await ArrayBufferUtil.readArrayBuffer(VMS_1_FILENAME);

    const dreamcastSaveFile = DreamcastVmiVmsSaveData.convertIndividualSaveToSaveFile(vmiArrayBuffer, vmsArrayBuffer);

    expect(dreamcastSaveFile.checksum).to.equal(0x41414140); // This checksum matches the calculated checksum
    expect(dreamcastSaveFile.description).to.equal('ikaruga                         ');
    expect(dreamcastSaveFile.copyright).to.equal('jeffma                          ');
    expect(dreamcastSaveFile.version).to.equal(0);
    expect(dreamcastSaveFile.fileNumber).to.equal(1);
    expect(dreamcastSaveFile.resourceName).to.equal('IKARUGA');
    expect(dreamcastSaveFile.fileMode).to.equal(0);
    expect(dreamcastSaveFile.fileSize).to.equal(17408);

    expect(dreamcastSaveFile.fileName).to.equal('IKARUGA_DATA');
    expect(dreamcastSaveFile.fileType).to.equal('Data');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveFile.fileCreationTime)).to.equal('2002-09-07 20:22:06');
    expect(dreamcastSaveFile.copyProtected).to.equal(false);
    expect(dreamcastSaveFile.fileSizeInBlocks).to.equal(34);
    expect(dreamcastSaveFile.firstBlockNumber).to.equal(0);
    expect(dreamcastSaveFile.fileHeaderBlockNumber).to.equal(0);
    expect(dreamcastSaveFile.storageComment).to.equal('ﾒｲﾝﾊﾞｯｸｱｯﾌﾟﾃﾞｰﾀ '); // "Main backup data"
    expect(dreamcastSaveFile.fileComment).to.equal('斑鳩（いかるが）                '); // "Ikaruga"

    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveFile.rawData, vmsArrayBuffer)).to.equal(true);
  });

  it('should correctly read a second .VMI/.VMS pair of files', async () => {
    const vmiArrayBuffer = await ArrayBufferUtil.readArrayBuffer(VMI_2_FILENAME);
    const vmsArrayBuffer = await ArrayBufferUtil.readArrayBuffer(VMS_2_FILENAME);

    const dreamcastSaveFile = DreamcastVmiVmsSaveData.convertIndividualSaveToSaveFile(vmiArrayBuffer, vmsArrayBuffer);

    expect(dreamcastSaveFile.checksum).to.equal(0x41444440); // This checksum doesn't match the calculated checksum. My guess is that the Planetweb Browser overwrites the resource name but doesn't update the checksum
    expect(dreamcastSaveFile.description).to.equal('Planetweb Browser');
    expect(dreamcastSaveFile.copyright).to.equal('Planetweb, Inc.');
    expect(dreamcastSaveFile.version).to.equal(0);
    expect(dreamcastSaveFile.fileNumber).to.equal(1);
    expect(dreamcastSaveFile.resourceName).to.equal('v93102');
    expect(dreamcastSaveFile.fileMode).to.equal(0);
    expect(dreamcastSaveFile.fileSize).to.equal(1536);

    expect(dreamcastSaveFile.fileName).to.equal('GAUNTLET.001');
    expect(dreamcastSaveFile.fileType).to.equal('Data');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveFile.fileCreationTime)).to.equal('1998-12-25 12:00:00');
    expect(dreamcastSaveFile.copyProtected).to.equal(false);
    expect(dreamcastSaveFile.fileSizeInBlocks).to.equal(3);
    expect(dreamcastSaveFile.firstBlockNumber).to.equal(0);
    expect(dreamcastSaveFile.fileHeaderBlockNumber).to.equal(0);
    expect(dreamcastSaveFile.storageComment).to.equal('Temple of Magi  ');
    expect(dreamcastSaveFile.fileComment).to.equal('GAUNTLET LEGENDS                Gauntlet');

    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveFile.rawData, vmsArrayBuffer)).to.equal(true);
  });

  it('should correctly read a third .VMI/.VMS pair of files, this one containing icon data', async () => {
    const vmiArrayBuffer = await ArrayBufferUtil.readArrayBuffer(VMI_3_FILENAME);
    const vmsArrayBuffer = await ArrayBufferUtil.readArrayBuffer(VMS_3_FILENAME);

    const dreamcastSaveFile = DreamcastVmiVmsSaveData.convertIndividualSaveToSaveFile(vmiArrayBuffer, vmsArrayBuffer);

    expect(dreamcastSaveFile.checksum).to.equal(0x41444440); // This checksum doesn't match the calculated checksum. My guess is that the Planetweb Browser overwrites the resource name but doesn't update the checksum
    expect(dreamcastSaveFile.description).to.equal('Planetweb Browser');
    expect(dreamcastSaveFile.copyright).to.equal('Planetweb, Inc.');
    expect(dreamcastSaveFile.version).to.equal(0);
    expect(dreamcastSaveFile.fileNumber).to.equal(1);
    expect(dreamcastSaveFile.resourceName).to.equal('v4596');
    expect(dreamcastSaveFile.fileMode).to.equal(0);
    expect(dreamcastSaveFile.fileSize).to.equal(1024);

    expect(dreamcastSaveFile.fileName).to.equal('ICONDATA_VMS');
    expect(dreamcastSaveFile.fileType).to.equal('Data');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveFile.fileCreationTime)).to.equal('1998-12-25 12:00:00');
    expect(dreamcastSaveFile.copyProtected).to.equal(false);
    expect(dreamcastSaveFile.fileSizeInBlocks).to.equal(2);
    expect(dreamcastSaveFile.firstBlockNumber).to.equal(0);
    expect(dreamcastSaveFile.fileHeaderBlockNumber).to.equal(0);
    expect(dreamcastSaveFile.storageComment).to.equal('No Name         ');
    expect(dreamcastSaveFile.fileComment).to.equal(' ');

    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveFile.rawData, vmsArrayBuffer)).to.equal(true);
  });

  it('should correctly read a fourth .VMI/.VMS pair of files', async () => {
    const vmiArrayBuffer = await ArrayBufferUtil.readArrayBuffer(VMI_4_FILENAME);
    const vmsArrayBuffer = await ArrayBufferUtil.readArrayBuffer(VMS_4_FILENAME);

    const dreamcastSaveFile = DreamcastVmiVmsSaveData.convertIndividualSaveToSaveFile(vmiArrayBuffer, vmsArrayBuffer);

    expect(dreamcastSaveFile.checksum).to.equal(0x43414341); // This checksum matches the calculated checksum
    expect(dreamcastSaveFile.description).to.equal('KISS PC - ALL STAGES            ');
    expect(dreamcastSaveFile.copyright).to.equal('PAVLIK                          ');
    expect(dreamcastSaveFile.version).to.equal(306);
    expect(dreamcastSaveFile.fileNumber).to.equal(1);
    expect(dreamcastSaveFile.resourceName).to.equal('KISSPC');
    expect(dreamcastSaveFile.fileMode).to.equal(0);
    expect(dreamcastSaveFile.fileSize).to.equal(1536);

    expect(dreamcastSaveFile.fileName).to.equal('TRMR_KPC.DAT');
    expect(dreamcastSaveFile.fileType).to.equal('Data');
    expect(DreamcastUtil.formatDateWithoutTimezone(dreamcastSaveFile.fileCreationTime)).to.equal('2004-09-16 08:55:18');
    expect(dreamcastSaveFile.fileSizeInBlocks).to.equal(3);
    expect(dreamcastSaveFile.firstBlockNumber).to.equal(0);
    expect(dreamcastSaveFile.fileHeaderBlockNumber).to.equal(0);
    expect(dreamcastSaveFile.copyProtected).to.equal(false);
    expect(dreamcastSaveFile.storageComment).to.equal('KISSPSYCHOCIRCUS');
    expect(dreamcastSaveFile.fileComment).to.equal('');

    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveFile.rawData, vmsArrayBuffer)).to.equal(true);
  });
});
