import { Command } from '@oclif/command';
import { ensureDaemonStarted } from '@useoptic/cli-server';
import { lockFilePath } from '../../shared/paths';
import { Config } from '../../config';
import { cleanupAndExit } from '@useoptic/cli-shared';
export default class DaemonStop extends Command {
  static description = 'ensures the Optic daemon has been started';
  static hidden: boolean = true;

  async run() {
    try {
      await ensureDaemonStarted(lockFilePath, Config.apiBaseUrl);
      this.log('Done!');
      cleanupAndExit();
    } catch (e) {
      this.error(e);
    }
  }
}
