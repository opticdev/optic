import Command from '@oclif/command';
import { IPathMapping } from '@useoptic/cli-config';
export default class GenerateOas extends Command {
    static description: string;
    static flags: {
        json: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        yaml: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    run(): Promise<void>;
    emit(paths: IPathMapping, parsedOas: object): Promise<string>;
}
