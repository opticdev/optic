import { Command, flags } from '@oclif/command';
import {
  LocalTaskSessionWrapper,
  runCommandFlags,
} from '../shared/local-cli-task-runner';

export default class Run extends Command {
  static description = 'Run a task from your optic.yml';

  static flags = runCommandFlags;

  static args = [
    {
      name: 'taskName',
    },
  ];

  async run() {
    const { args } = this.parse(Run);
    const { flags } = this.parse(Run);
    const { taskName } = args;
    await LocalTaskSessionWrapper(this, taskName, flags);
  }
}
