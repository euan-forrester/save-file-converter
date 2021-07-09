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

// FIXME: Add retries

import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import { parse } from 'node-html-parser';

const BASE_URL = 'https://www.gametdb.com/Wii/';

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
];

const UNKNOWN = 'Unknown';

export default class GetPlatform {
  constructor() {
    this.axios = axios.create({
      baseURL: BASE_URL,
    });
  }

  async get(gameId) {
    try {
      const response = await this.axios.get(gameId, { adapter: httpAdapter });

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

      // All done with query selectors to try and accompdate any small changes in the html
      const gameDataTable = root.querySelector('.GameData');
      const platformRow = gameDataTable.querySelector('tr:nth-child(3)');
      const platformType = platformRow.querySelector('td:last-child').firstChild.textContent.trim();

      const platformTypeIndex = PLATFORMS.indexOf(platformType);

      if (platformTypeIndex === -1) {
        return UNKNOWN;
      }

      return PLATFORMS[platformTypeIndex];
    } catch (error) {
      if (error.response.status === 404) {
        return UNKNOWN;
      }

      return UNKNOWN; // Unsure if we should do something different here
    }
  }
}
