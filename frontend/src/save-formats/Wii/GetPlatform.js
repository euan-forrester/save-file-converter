/* Gets the platform of a Wii Virtual Console game based on its Game ID

Note that we do this by asking gametdb.com

Our options are:
1) Include their 16 MB file along with our distribution, and download and parse it in the user's browser
2) Have a build-time process that strips out the unneeded stuff from this file then download that to the user's browser instead
3) Have a server backend that periodically injests this file
4) Hit their website

Reasons for not doing these:
1 is a nonstarter because the file is way too big to download
2 sounds like extra work for a save format I'm not sure will be popular
3 I'd rather not have a server backend to keep hosting costs to a minimum.

Plus this site gets very little traffic. May need to reevaluate if we start getting lots of traffic but I don't expect that given our tiny niche.
*/

import { parse } from 'node-html-parser';

// Here, we proxy our requests through the public service for allOrigins (https://allorigins.win/).
// This adds CORS headers to the responses from gametdb.com, without seeming to add too much latency on top of gametdb's approx 2 seconds.
//
// We may need to reevaluate usage of this proxy (and directly hitting the gametdb service) if our traffic increases.
const BASE_URL = 'https://api.allorigins.win/raw?url=https://www.gametdb.com/Wii/';

// Note that these types are listed in the downloadable XML version of the website's data, which can be found at: https://www.gametdb.com/Wii/Downloads
const PLATFORMS = [
  'VC-NES', // Nintendo Entertainment System
  'VC-SNES', // Super Nintendo Entertainment System
  'VC-N64', // Nintendo 64
  'VC-PCE', // PC Engine aka Turbografx 16
  'VC-SMS', // Sega Master System
  'VC-MD', // Mega Drive aka Sega Genesis
  'VC-NEOGEO', // Neo Geo
  'VC-C64', // Commodore 64
  'VC-Arcade', // Arcade
  'WiiWare', // WiiWare
  'Wii', // Wii native title
  'Homebrew', // Homebrew title
];

const REGIONS = {
  'NTSC-U': 'North America',
  'NTSC-J': 'Japan',
  'PAL': 'Europe', // eslint-disable-line quote-props
};

const PLATFORMS_LOWERCASE = PLATFORMS.map((x) => x.toLowerCase());

const UNKNOWN_PLATFORM = 'Unknown';
const UNKNOWN_REGION = 'Unknown region';

export default class GetPlatform {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  static getBaseUrl() {
    return BASE_URL;
  }

  static unknownPlatform() {
    return UNKNOWN_PLATFORM;
  }

  static unknownRegion() {
    return UNKNOWN_REGION;
  }

  async get(gameId) {
    try {
      const response = await this.httpClient.get(gameId);

      const root = parse(response.data);

      // The gametdb page looks like:
      // ...
      // <table class="GameData">
      //   <tr>
      //     <td>TD</td><td>[Game ID]</td>
      //   </tr>
      //   <tr>
      //     <td>region</td><td>[Region]</td>
      //   </tr>
      //   <tr>
      //     <td>type</td><td>[Platform type]</td>
      //   </tr>
      //   ...
      // </table>
      // ...

      // All done with query selectors to try and accompdate any potential future small changes in the html
      const gameDataTable = root.querySelector('.GameData');

      // The platform type can be listed on rows 2 or 3. The former happens if the region is omitted,
      // such as in the case of homebrew titles

      let platformType = null;
      let region = null;

      for (let i = 3; i >= 1; i -= 1) { // Count backwards because almost every game has it on row 3
        const row = gameDataTable.querySelector(`tr:nth-child(${i})`);

        let rowName = row.querySelector('td:first-child').firstChild.textContent;

        if (rowName !== null) {
          rowName = rowName.trim().toLowerCase();
        }

        if ((rowName === 'type') && (platformType === null)) {
          platformType = row.querySelector('td:last-child').firstChild.textContent;
        }

        if ((rowName === 'region') && (region === null)) {
          region = row.querySelector('td:last-child').firstChild.textContent;
        }
      }

      // Make sure our region has every word capitalized, so that we get something like "North America"

      if (region !== null) {
        region = region.trim().toUpperCase();

        if (region in REGIONS) {
          region = REGIONS[region]; // Turn "NTSC-U" into "North America", etc
        } else {
          region = null;
        }
      }

      // Make sure we find the platform we parsed in our list of all possible platforms

      if (platformType !== null) {
        platformType = platformType.trim().toLowerCase();
      }

      const platformTypeIndex = PLATFORMS_LOWERCASE.indexOf(platformType);

      let platform = UNKNOWN_PLATFORM;

      if (platformTypeIndex >= 0) {
        platform = PLATFORMS[platformTypeIndex];
      }

      if (region === null) {
        region = UNKNOWN_REGION;
      }

      return {
        platform,
        region,
      };
    } catch (error) {
      if ((error.response !== undefined) && (error.response.status === 404)) {
        return {
          platform: UNKNOWN_PLATFORM,
          region: UNKNOWN_REGION,
        };
      }

      return {
        platform: UNKNOWN_PLATFORM,
        region: UNKNOWN_REGION,
      }; // Unsure if we should do something different here
    }
  }
}
