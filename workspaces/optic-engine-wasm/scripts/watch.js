const createWasmPackPlugin = require('../webpack.plugin');

// We provide a mock for the webpack compiler, so we don't have to reimplement all the watching and can
// leverage the existing plugin.

let beforeCompileHook;
let thisCompilationHook;

const compiler = {
  options: {
    mode: 'development',
  },

  watchMode: true,

  hooks: {
    beforeCompile: {
      tapPromise(pluginName, hook) {
        beforeCompileHook = hook;
      },
    },
    thisCompilation: {
      tap(pluginName, hook) {
        thisCompilationHook = hook;
      },
    },
  },
};

let wasmPack = createWasmPackPlugin();

wasmPack.apply(compiler);

beforeCompileHook().catch((err) => {
  throw err;
});
