import {CliDaemon} from './daemon';
import {userDebugLogger} from './logger';

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
