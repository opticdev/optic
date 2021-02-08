import { Command } from '@oclif/command';
import {
  LocalTaskSessionWrapper,
  runCommandFlags,
} from '../shared/local-cli-task-runner';

export default class Start extends Command {
  static description = 'alias for "api run start"';

  static flags = runCommandFlags;

  async run() {
    const { flags } = this.parse(Start);
    await LocalTaskSessionWrapper(this, 'start', flags);
  }
}
