import { Command, flags } from '@oclif/command';

export default class Run extends Command {
  static description = 'describe the command here';

  static examples = [`$ optic-agent run ????`];

  static flags = {
    command: flags.string({ description: 'the command to run' }),
    masquerade: flags.string({
      description: 'host:port Optic should start on',
    }),
    config: flags.string({
      description: 'the output from optic-ci capture:start ...',
    }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const { args, flags } = this.parse(Run);

    // create a saasClient with the token from the config
    // create a SaasCaptureSaver
    // start the proxy and command
  }
}
