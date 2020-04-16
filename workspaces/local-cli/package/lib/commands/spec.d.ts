import { Command } from '@oclif/command';
import { IApiCliConfig } from '@useoptic/cli-config';
export default class Spec extends Command {
    static description: string;
    run(): Promise<void>;
    helper(basePath: string, config: IApiCliConfig): Promise<void>;
}
