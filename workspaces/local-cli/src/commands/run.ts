import { Command } from '@oclif/command';
import { LocalTaskSessionWrapper } from '../shared/local-cli-task-runner';

export default class Run extends Command {
  static description = 'Run a task from your optic.yml';

  static args = [
    {
      name: 'taskName',
    },
  ];

  async run() {
    const { args } = this.parse(Run);
    const { taskName } = args;
    await LocalTaskSessionWrapper(this, taskName);
  }
}
