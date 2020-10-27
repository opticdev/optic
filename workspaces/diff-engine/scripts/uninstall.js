const { uninstall } = require('../lib');

if (process.env.OPTIC_RUST_DIFF_ENGINE !== 'true') {
  process.exit(0);
}

uninstall();
console.log('Uninstalled binaries for diff-engine');
