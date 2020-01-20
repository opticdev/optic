import {CliDaemon} from './daemon';
import {userDebugLogger} from './logger';
console.log('starting daemon', process.argv, process.env.DEBUG);
console.log(process.cwd(), __dirname, __filename);
const [, , lockFilePath] = process.argv;
userDebugLogger(`daemon lock file ${lockFilePath}`);
const daemon = new CliDaemon({lockFilePath});
daemon.start()
  .then(result => {
    userDebugLogger(`daemon started on port ${result.port}`);
  })
  .catch(e => {
    console.error(e);
  });
