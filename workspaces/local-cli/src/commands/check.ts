import { Command } from '@oclif/command';

export default class Check extends Command {
  static description =
    'verify that Optic can run your tasks and monitor traffic';

  static hidden = true;

  static args = [
    {
      name: 'taskName',
    },
  ];

  async run() {
    const { args } = this.parse(Check);
    const { taskName } = args;
    this.log(`Deprecated, going forward use 'api run ${taskName} --verbose' `);
  }
}
