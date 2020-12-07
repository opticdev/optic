import { Command } from '@oclif/command';
import { getOrCreateAnonId } from '@useoptic/cli-config/build/opticrc/optic-rc';
export default class DebugIdentity extends Command {
  static description =
    'returns the anonymous id that identifies diff engine logs in Sentry';
  static hidden: boolean = true;

  async run() {
    this.log(await getOrCreateAnonId());
  }
}
