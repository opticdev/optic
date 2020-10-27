const { install } = require('../lib');

install()
  .then(() => {
    console.log('Installed diff-engine binary');
  })
  .catch((err) => {
    console.error('Could not install binary', err);
  });
