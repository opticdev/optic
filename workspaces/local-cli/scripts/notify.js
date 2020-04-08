const notifier = require('node-notifier')
const openBrowser = require('react-dev-utils/openBrowser');
const path = require('path')


const myArgs = process.argv.slice(2);

console.log(myArgs)

function run() {
  notifier.notify(
    {
      title: 'Observed Unexpected API Behavior',
      message: 'Click here to review the diff in Optic',
      icon: path.join(__dirname, 'optic-logo-png.png'),
      timeout: 7,
      open: myArgs[0],
      wait: true
    }
  );

}


run()
