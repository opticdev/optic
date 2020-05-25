import { Command, flags } from '@oclif/command';

export default class Start extends Command {
  static description = 'describe the command here';

  static examples = [`$ optic-ci capture:start ???`];

  static flags = {
    'deployment-id': flags.string({
      required: true,
      description:
        'a unique identifier representing the version of the code, build process, build environment variables, and runtime environment variables',
    }),
    'build-id': flags.string({
      required: true,
      description:
        'a unique identifier representing the version of the code, build process, and build environment variables',
    }),
    environment: flags.string({
      required: true,
      description: 'the name of the environment you are deploying into',
    }),
    'config-path': flags.string({
      required: true,
      description: 'the path to your optic.yml file',
    }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const { args, flags } = this.parse(Start);

    this.log(flags['deployment-id']);
    // use flags.config to resolve the optic.yml. extract the ignoreRequests from it
    // find the .optic/api/specification.json relative to the optic.yml
    // find the jwt
    // use the jwt to get an upload url for the spec
    // upload the spec
    // use the jwt and the spec url and the flags, etc. to create a capture
    // output the response to standard out so the caller can pass it along to each agent-cli
  }
}
