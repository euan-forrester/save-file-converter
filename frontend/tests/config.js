import ArrayBufferUtil from '#/util/ArrayBuffer';

const LOCAL_OVERRIDES_FILE_PATH = './tests/config.local.js'; // Note that if we need to change this it has be changed below as well

const defaultConfig = {
  testPspIsos: true,
  testPspRetailIsos: false, // We don't have these committed to the repo for obvious reasons, so we don't want the continuous deployment tests to test for them
};

export default class Config {
  static async Create() {
    const localOverridesExist = await ArrayBufferUtil.fileExists(LOCAL_OVERRIDES_FILE_PATH);

    if (localOverridesExist) {
      const localOverrides = await import('./config.local.js'); // Can't be a dynamic string for an import, so have to hardcode this here

      return new Config({
        ...defaultConfig,
        ...localOverrides.default,
      });
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
