const { defaults: tsjPreset } = require('ts-jest/presets');
// const { jsWithTs: tsjPreset } = require('ts-jest/presets');
// const { jsWithBabel: tsjPreset } = require('ts-jest/presets');

module.exports = {
  // [...]
  testPathIgnorePatterns: ['build/*'],
  transform: {
    ...tsjPreset.transform,
    // [...]
  },
};
