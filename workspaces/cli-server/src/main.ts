import * as fs from 'fs-extra';
import {CliDaemon} from './daemon';
import {userDebugLogger} from './logger';

const logStream = fs.createWriteStream('.optic-daemon.log', {flags: 'a'});
process.stdout.unpipe().pipe(logStream);
process.stderr.unpipe().pipe(logStream);

const [, , lockFilePath] = process.argv;
userDebugLogger(`daemon lock file ${lockFilePath}`);
const daemon = new CliDaemon({lockFilePath});
daemon.start()
  .then(result => {
    userDebugLogger(`daemon started on port ${result.port}`);
    // @ts-ignore
    process.send({
      type: 'daemon:started'
    });
  })
  .catch(e => {
    console.error(e);
  });
