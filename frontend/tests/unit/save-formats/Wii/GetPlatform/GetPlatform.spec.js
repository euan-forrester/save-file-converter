import { expect } from 'chai';
import GetPlatform from '@/save-formats/Wii/GetPlatform/GetPlatform';
import getHttpClient from '@/save-formats/Wii/GetPlatform/HttpClient';
import getMockHttpClient from '#/unit/save-formats/Wii/GetPlatform/MockHttpClient';

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
    const gameInfo = await this.getPlatform.get('FBNE'); // Ninja Gaiden
    expect(gameInfo.platform).equals('VC-NES');
    expect(gameInfo.region).equals('North America');
  });

  it('should get the correct VC platform for a SNES game', async () => {
    const gameInfo = await this.getPlatform.get('JECE'); // Chrono Trigger
    expect(gameInfo.platform).equals('VC-SNES');
    expect(gameInfo.region).equals('North America');
  });

  it('should get the correct VC platform for an N64 game', async () => {
    const gameInfo = await this.getPlatform.get('NADJ'); // Star Fox 64
    expect(gameInfo.platform).equals('VC-N64');
    expect(gameInfo.region).equals('Japan');
  });

  it('should get the correct VC platform for a Turbografx 16 game', async () => {
    const gameInfo = await this.getPlatform.get('QAPN'); // Castlevania: Rondo of Blood
    expect(gameInfo.platform).equals('VC-PCE');
    expect(gameInfo.region).equals('North America');
  });

  it('should get the correct VC platform for a Master System game', async () => {
    const gameInfo = await this.getPlatform.get('LADE'); // Phantasy Star
    expect(gameInfo.platform).equals('VC-SMS');
    expect(gameInfo.region).equals('North America');
  });

  it('should get the correct VC platform for a Genesis game', async () => {
    const gameInfo = await this.getPlatform.get('MC4E'); // Strider
    expect(gameInfo.platform).equals('VC-MD');
    expect(gameInfo.region).equals('North America');
  });

  it('should get the correct VC platform for a Neo Geo game', async () => {
    const gameInfo = await this.getPlatform.get('EAEP'); // Samurai Shodown
    expect(gameInfo.platform).equals('VC-NEOGEO');
    expect(gameInfo.region).equals('Europe');
  });

  it('should get the correct VC platform for a C64 game', async () => {
    const gameInfo = await this.getPlatform.get('C97E'); // California Games
    expect(gameInfo.platform).equals('VC-C64');
    expect(gameInfo.region).equals('North America');
  });

  it('should get the correct VC platform for an arcade game', async () => {
    const gameInfo = await this.getPlatform.get('E6ZJ'); // Star Force
    expect(gameInfo.platform).equals('VC-Arcade');
    expect(gameInfo.region).equals('Japan');
  });

  it('should recognize a WiiWare game', async () => {
    const gameInfo = await this.getPlatform.get('WKTE'); // Contra Rebirth
    expect(gameInfo.platform).equals('WiiWare');
    expect(gameInfo.region).equals('North America');
  });

  it('should recognize a Wii game', async () => {
    const gameInfo = await this.getPlatform.get('R3OP01'); // Metroid: Other M
    expect(gameInfo.platform).equals('Wii');
    expect(gameInfo.region).equals('Europe');
  });

  it('should recognize a Homebrew game', async () => {
    const gameInfo = await this.getPlatform.get('D40A'); // Luigi and the Island of Mystery
    expect(gameInfo.platform).equals('Homebrew');
    expect(gameInfo.region).equals(GetPlatform.unknownRegion());
  });

  it('should recognize a game without a platform listed', async () => {
    // Some titles in the downloadable XML document don't have any platform listed. Those seem to get
    // listed as 'Wii' when viewed on the main site
    const gameInfo = await this.getPlatform.get('DAXE01'); // The Legend of Zelda: Skyward Sword (Demo)
    expect(gameInfo.platform).equals('Wii');
    expect(gameInfo.region).equals('North America');
  });

  it('should not recognize an unknown game', async () => {
    const gameInfo = await this.getPlatform.get('ABCD');
    expect(gameInfo.platform).equals(GetPlatform.unknownPlatform());
    expect(gameInfo.region).equals(GetPlatform.unknownRegion());
  });
});
