import {CliDaemon} from './daemon';
import {userDebugLogger} from './logger';
import * as fs from 'fs-extra';
console.log('starting daemon', process.argv, process.env.DEBUG);
console.log(process.cwd(), __dirname, __filename);

const [, , lockFilePath, sentinelFilePath] = process.argv;
userDebugLogger(`daemon lock file ${lockFilePath}`);
const daemon = new CliDaemon({lockFilePath});
daemon.start()
  .then(async result => {
    userDebugLogger(`daemon started on port ${result.port}`);
    await fs.writeJson(sentinelFilePath, result);
  })
  .catch(e => {
    console.error(e);
  });
