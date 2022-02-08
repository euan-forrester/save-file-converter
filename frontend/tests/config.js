import ArrayBufferUtil from '#/util/ArrayBuffer';

const LOCAL_OVERRIDES_FILE_PATH = './tests/config.local.js'; // Note that if we need to change this it has be changed below as well

const defaultConfig = {
  testPspIsos: true,
  testPspRetailIsos: false, // We don't have these committed to the repo for obvious reasons, so we don't want the continuous deployment tests to test for them
};

export default class Config {
  static async Create() {
    const localOverridesExist = await ArrayBufferUtil.fileExists(LOCAL_OVERRIDES_FILE_PATH);

    console.log(`Looked for ${LOCAL_OVERRIDES_FILE_PATH} and found it ${localOverridesExist}`);

    if (localOverridesExist) {
      try {
        const localOverrides = require('./config.local.js'); // eslint-disable-line global-require, import/no-unresolved

        console.log('Loaded in local overrides: ', localOverrides);

        return new Config({
          ...defaultConfig,
          ...localOverrides.default,
        });
      } catch {
        // Fall though
      }
    }

    return new Config(defaultConfig);
  }

  constructor(configData) {
    this.configData = configData;
  }

  get() {
    return this.configData;
  }
}
