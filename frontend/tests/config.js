const defaultConfig = {
  testPspIsos: true,
  testPspRetailIsos: false, // We don't have these committed to the repo for obvious reasons, so we don't want the continuous deployment tests to test for them
};

export default class Config {
  static Create() {
    try {
      const localOverrides = require('./config.local.js'); // eslint-disable-line global-require, import/no-unresolved

      return new Config({
        ...defaultConfig,
        ...localOverrides.default,
      });
    } catch {
      // Fall though
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
