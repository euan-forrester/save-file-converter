import { expect } from 'chai';
import GetPlatform from '@/save-formats/Wii/GetPlatform';
import getHttpClient from '@/save-formats/Wii/HttpClient';
import getMockHttpClient from '#/unit/save-formats/Wii/MockHttpClient';

const accessInternet = false; // Used to check if the website we're hitting changes their format in the future. Set to false to use the local copies of the HTML stored in this repo, set to true to hit the actual website and download the HTML

const TEST_TIMEOUT = 10000; // ms

describe('Get Wii platform', function () { // eslint-disable-line func-names
  // No arrow function above so that 'this' binds correctly
  this.timeout(TEST_TIMEOUT);

  before(() => {
    const httpClient = accessInternet ? getHttpClient(GetPlatform.getBaseUrl()) : getMockHttpClient();

    this.getPlatform = new GetPlatform(httpClient);
  });

  it('should get the correct VC platform for an NES game', async () => {
    const platform = await this.getPlatform.get('FBNE'); // Ninja Gaiden
    expect(platform).equals('VC-NES');
  });

  it('should get the correct VC platform for a SNES game', async () => {
    const platform = await this.getPlatform.get('JECE'); // Chrono Trigger
    expect(platform).equals('VC-SNES');
  });

  it('should get the correct VC platform for an N64 game', async () => {
    const platform = await this.getPlatform.get('NADJ'); // Star Fox 64
    expect(platform).equals('VC-N64');
  });

  it('should get the correct VC platform for a Turbografx 16 game', async () => {
    const platform = await this.getPlatform.get('QAPN'); // Castlevania: Rondo of Blood
    expect(platform).equals('VC-PCE');
  });

  it('should get the correct VC platform for a Master System game', async () => {
    const platform = await this.getPlatform.get('LADE'); // Phantasy Star
    expect(platform).equals('VC-SMS');
  });

  it('should get the correct VC platform for a Genesis game', async () => {
    const platform = await this.getPlatform.get('MC4E'); // Strider
    expect(platform).equals('VC-MD');
  });

  it('should get the correct VC platform for a Neo Geo game', async () => {
    const platform = await this.getPlatform.get('EAEP'); // Samurai Shodown
    expect(platform).equals('VC-NEOGEO');
  });

  it('should get the correct VC platform for a C64 game', async () => {
    const platform = await this.getPlatform.get('C97E'); // California Games
    expect(platform).equals('VC-C64');
  });

  it('should get the correct VC platform for an arcade game', async () => {
    const platform = await this.getPlatform.get('E6ZJ'); // Star Force
    expect(platform).equals('VC-Arcade');
  });

  it('should recognize a WiiWare game', async () => {
    const platform = await this.getPlatform.get('WKTE'); // Contra Rebirth
    expect(platform).equals('WiiWare');
  });

  it('should recognize a Wii game', async () => {
    const platform = await this.getPlatform.get('R3OP01'); // Metroid: Other M
    expect(platform).equals('Wii');
  });

  it('should recognize a Homebrew game', async () => {
    const platform = await this.getPlatform.get('D40A'); // Luigi and the Island of Mystery
    expect(platform).equals('Homebrew');
  });

  it('should recognize a game without a platform listed', async () => {
    // Some titles in the downloadable XML document don't have any platform listed. Those seem to get
    // listed as 'Wii' when viewed on the main site
    const platform = await this.getPlatform.get('DAXE01'); // The Legend of Zelda: Skyward Sword (Demo)
    expect(platform).equals('Wii');
  });

  it('should not recognize an unknown game', async () => {
    const platform = await this.getPlatform.get('ABCD');
    expect(platform).equals(GetPlatform.unknownPlatform());
  });
});
