import dotenv from 'dotenv';
import path from 'path';

const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
 
updateNotifier({pkg}).notify();
const notifier = updateNotifier({
  pkg,
  updateCheckInterval: 1000 
});

console.log(notifier.fetchInfo());

const envPath =
  process.env.OPTIC_DEBUG_ENV_FILE || path.join(__dirname, '..', '.env');

dotenv.config({
  path: envPath,
});

export { run } from '@oclif/command';
