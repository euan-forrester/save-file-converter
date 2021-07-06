// Note that we're hitting an external service with these calls, so this isn't really a "unit" test
// But I want a test of all of this stuff, so I guess it goes here. It's not really an "integration" test either
// The root cause here is that we shouldn't be hitting an external service for this functionality, but see my notes there for an explanation

import { expect } from 'chai';
import GetVcPlatform from '@/save-formats/Wii/GetVcPlatform';

describe('Get Virtual Console platform', () => {
  it('should get the correct VC platform for an NES game', async () => {
    const platform = await GetVcPlatform('FBNE'); // Ninja Gaiden
    expect(platform).equals('VC-NES');
  });

  it('should get the correct VC platform for a SNES game', async () => {
    const platform = await GetVcPlatform('JECE'); // Chrono Trigger
    expect(platform).equals('VC-SNES');
  });

  it('should get the correct VC platform for an N64 game', async () => {
    const platform = await GetVcPlatform('NAJE'); // Star Fox 64
    expect(platform).equals('VC-N64');
  });

  it('should get the correct VC platform for a Turbografx 16 game', async () => {
    const platform = await GetVcPlatform('QAPN'); // Castlevania: Rondo of Blood
    expect(platform).equals('VC-PCE');
  });

  it('should get the correct VC platform for a Master System game', async () => {
    const platform = await GetVcPlatform('LADE'); // Phantasy Star
    expect(platform).equals('VC-SMS');
  });

  it('should get the correct VC platform for a Genesis game', async () => {
    const platform = await GetVcPlatform('MC4E'); // Strider
    expect(platform).equals('VC-MD');
  });

  it('should get the correct VC platform for a Neo Geo game', async () => {
    const platform = await GetVcPlatform('EAEP'); // Samurai Shodown
    expect(platform).equals('VC-NEOGEO');
  });

  it('should get the correct VC platform for a C64 game', async () => {
    const platform = await GetVcPlatform('C97E'); // California Games
    expect(platform).equals('VC-C64');
  });

  it('should get the correct VC platform for an arcade game', async () => {
    const platform = await GetVcPlatform('E6ZJ'); // Star Force
    expect(platform).equals('VC-Arcade');
  });

  it('should recognize a WiiWare game', async () => {
    const platform = await GetVcPlatform('WKTE'); // Contra Rebirth
    expect(platform).equals('WiiWare');
  });

  it('should recognize a Wii game', async () => {
    const platform = await GetVcPlatform('R3OP01'); // Metroid: Other M
    expect(platform).equals('Wii');
  });

  it('should not recognize an unknown game', async () => {
    const platform = await GetVcPlatform('ABCD');
    expect(platform).equals('Unknown');
  });
});