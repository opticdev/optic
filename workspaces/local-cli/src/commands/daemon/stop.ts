import {Command} from '@oclif/command';
import {ensureDaemonStopped} from '@useoptic/cli-server';
import {lockFilePath} from '../../shared/paths';

export default class DaemonStop extends Command {
  static description = 'ensures the Optic daemon has been stopped';

  async run() {
    await ensureDaemonStopped(lockFilePath);
    this.log('Done!')
  }
}
