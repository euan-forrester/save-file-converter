import { expect } from 'chai';
import SmsRom from '@/rom-formats/sms';
import ArrayBufferUtil from '#/util/ArrayBuffer';
import Config from '#/config';

const config = Config.Create();

const TEST_RETAIL_ROMS = config.get().testFlashCartRetailGames; // We don't check retail ROMs into the repo

const DIR = './tests/data/rom-formats/sms';

const SMS_FILENAME = `${DIR}/retail/Phantasy Star (USA, Europe) (Rev A).sms`; // The SMS header is pretty far into the file, so we can't just include a snippit of the beginning of the file

const ROM_CHECKSUM = 0xEAD8;

describe('SMS ROM format', () => {
  TEST_RETAIL_ROMS && it('should parse an SMS ROM', async () => { // eslint-disable-line no-unused-expressions
    const romArrayBuffer = await ArrayBufferUtil.readArrayBuffer(SMS_FILENAME);

    const smsRom = new SmsRom(romArrayBuffer);

    expect(smsRom.getChecksum()).to.equal(ROM_CHECKSUM);
  });
});
