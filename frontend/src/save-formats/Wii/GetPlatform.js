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

import axios from 'axios';
import axiosRetry from 'axios-retry';
import { parse } from 'node-html-parser';

// Here, we proxy our requests through the public service for thingproxy (https://github.com/Freeboard/thingproxy).
// This adds CORS headers to the responses from gametdb.com, and adds about 3 seconds of extra latency (on top of gametdb's approx 2 seconds).
//
// Current rate limits for thingproxy are 100kB responses and 10 requests/second per IP address. Our usage is currently pretty low so we can
// currently expect 0-1 requests per day from all users, maybe spiking to like 10 requests/day (although most of those from a single user).
// Responses from gametdb are approx 18kB in size.
//
// We may need to reevaluate usage of this proxy (and directly hitting the gametdb service) if our traffic increases.
const BASE_URL = 'https://thingproxy.freeboard.io/fetch/https://www.gametdb.com/Wii/';
const NUM_RETRIES = 3; // Definitely need some retries given that we're dealing with a free proxy and a free website (that's not intended to be an API)
const RETRY_DELAY = 500; // ms

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

const PLATFORMS_LOWERCASE = PLATFORMS.map((x) => x.toLowerCase());

const UNKNOWN_PLATFORM = 'Unknown';

export default class GetPlatform {
  constructor() {
    this.axios = axios.create({
      baseURL: BASE_URL,
    });

    axiosRetry(this.axios, {
      retries: NUM_RETRIES,
      retryDelay: () => RETRY_DELAY,
    });
  }

  async get(gameId) {
    try {
      const response = await this.axios.get(gameId);

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

      for (let i = 3; i >= 2; i -= 1) { // Count backwards because almost every game has it on row 3
        const platformRow = gameDataTable.querySelector(`tr:nth-child(${i})`);
        let rowName = platformRow.querySelector('td:first-child').firstChild.textContent;

        if (rowName !== null) {
          rowName = rowName.trim().toLowerCase();
        }

        if (rowName === 'type') {
          platformType = platformRow.querySelector('td:last-child').firstChild.textContent;
          break;
        }
      }

      if (platformType !== null) {
        platformType = platformType.trim().toLowerCase();
      }

      const platformTypeIndex = PLATFORMS_LOWERCASE.indexOf(platformType);

      if (platformTypeIndex === -1) {
        return UNKNOWN_PLATFORM;
      }

      return PLATFORMS[platformTypeIndex];
    } catch (error) {
      if ((error.response !== undefined) && (error.response.status === 404)) {
        return UNKNOWN_PLATFORM;
      }

      return UNKNOWN_PLATFORM; // Unsure if we should do something different here
    }
  }
}
