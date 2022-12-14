import { readFile } from 'fs/promises';

const FILE_LOCATION = './tests/data/save-formats/wii/gametdb';
const ENCODING = 'utf8';

export default function getMockHttpClient() {
  return {
    get: async (gameId) => {
      const filename = `${FILE_LOCATION}/${gameId}.html`;

      try {
        const data = await readFile(filename, ENCODING);
        return {
          data,
        };
      } catch (e) {
        const error = new Error(`File not found: '${filename}'`, e);
        error.response = {
          status: 404,
        };
        throw error;
      }
    },
  };
}
