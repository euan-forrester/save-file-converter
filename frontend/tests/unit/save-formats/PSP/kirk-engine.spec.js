import { expect } from 'chai';
import moduleFactory from '@/save-formats/PSP/kirk-engine/test-webassembly';

describe('kirk-engine imported library', function () { // eslint-disable-line func-names
  // No arrow function above so that 'this' binds correctly
  before(async () => {
    const moduleOverrides = {
      locateFile: (s) => `src/save-formats/PSP/kirk-engine/${s}`,
    };

    this.moduleInstance = await moduleFactory(moduleOverrides);
  });

  it('should run a test function using cwrap', () => {
    const testCaller = this.moduleInstance.cwrap('testCaller', 'number', ['number', 'number']);

    const result = testCaller(13, 29);

    expect(result).to.equal(42);
  });

  it('should run a test function using ccall', () => {
    const result = this.moduleInstance.ccall('testCaller', 'number', ['number', 'number'], [13, 29]);

    expect(result).to.equal(42);
  });

  it('should run a test function called directly', () => {
    const result = this.moduleInstance._testCaller(13, 29); // eslint-disable-line no-underscore-dangle

    expect(result).to.equal(42);
  });
});
