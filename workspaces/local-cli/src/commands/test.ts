import { Command, flags } from '@oclif/command';
import {
  LocalTaskSessionWrapper,
  runCommandFlags,
} from '../shared/local-cli-task-runner';

export default class Test extends Command {
  static description = 'alias for "api run test --ci"';
  static flags = runCommandFlags;

  async run() {
    const { flags } = this.parse(Test);
    flags['ci'] = true;
    await LocalTaskSessionWrapper(this, 'test', flags);
  }
}
