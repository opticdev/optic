import { Command } from '@oclif/command';
import { verifyTask } from '../shared/verify/verify';

export default class Check extends Command {
  static description =
    'verify that Optic can run your tasks and monitor traffic';

  static args = [
    {
      name: 'taskName',
    },
  ];

  async run() {
    const { args } = this.parse(Check);
    const { taskName } = args;
    await verifyTask(this, taskName);
    process.exit(0);
  }
}
