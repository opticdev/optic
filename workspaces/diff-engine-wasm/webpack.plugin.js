const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');
const path = require('path');

module.exports = function createDiffEnginePlugin() {
  return new WasmPackPlugin({
    crateDirectory: path.resolve(__dirname, 'engine'),

    watchDirectories: [path.resolve(__dirname, '..', 'diff-engine', 'src')],

    outDir: path.resolve(__dirname, 'engine', 'browser'),
    outName: 'index',
  });
};
