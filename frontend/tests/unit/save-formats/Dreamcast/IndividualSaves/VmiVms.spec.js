import { expect } from 'chai';
import ArrayBufferUtil from '#/util/ArrayBuffer';

import DreamcastVmiVmsSaveData from '@/save-formats/Dreamcast/IndividualSaves/VmiVms';

const DIR = './tests/data/save-formats/dreamcast/individualsaves';

const VMI_FILENAME = `${DIR}/IKARUGA.VMI`;
const VMS_FILENAME = `${DIR}/IKARUGA.VMS`;

// Dreamcast timestamps do not have a timezone, so are all in local time. So we want to print them without timezone information so that the tests work wherever they are executed
function formatDateWithoutTimezone(date) {
  const pad = (n) => String(n).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // Months are zero-indexed
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

describe('Dreamcast - .VMI/.VMS', () => {
  it('should correctly read a .VMI/.VMS pair of files', async () => {
    const vmiArrayBuffer = await ArrayBufferUtil.readArrayBuffer(VMI_FILENAME);
    const vmsArrayBuffer = await ArrayBufferUtil.readArrayBuffer(VMS_FILENAME);

    const dreamcastSaveFile = DreamcastVmiVmsSaveData.convertIndividualSaveToSaveFile(vmiArrayBuffer, vmsArrayBuffer);

    expect(dreamcastSaveFile.checksum).to.equal(0x41414140);
    expect(dreamcastSaveFile.description).to.equal('ikaruga                         ');
    expect(dreamcastSaveFile.copyright).to.equal('jeffma                          ');
    expect(formatDateWithoutTimezone(dreamcastSaveFile.timestamp)).to.equal('2002-09-07 20:22:06');
    expect(dreamcastSaveFile.version).to.equal(0);
    expect(dreamcastSaveFile.fileNumber).to.equal(1);
    expect(dreamcastSaveFile.resourceName).to.equal('IKARUGA');
    expect(dreamcastSaveFile.fileName).to.equal('IKARUGA_DATA');
    expect(dreamcastSaveFile.fileMode).to.equal(0);
    expect(dreamcastSaveFile.fileSize).to.equal(17408);

    expect(ArrayBufferUtil.arrayBuffersEqual(dreamcastSaveFile.rawData, vmsArrayBuffer)).to.equal(true);
  });
});
