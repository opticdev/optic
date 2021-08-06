const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');
const path = require('path');

module.exports = function createOpticEnginePlugin() {
  return new WasmPackPlugin({
    crateDirectory: path.resolve(__dirname),

    watchDirectories: [path.resolve(__dirname, '..', 'optic-engine', 'src')],

    outDir: path.resolve(__dirname, 'browser'),
    outName: 'index',
  });
};
