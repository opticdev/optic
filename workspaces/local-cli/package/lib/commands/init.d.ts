import Command from '@oclif/command';
export default class Init extends Command {
    static description: string;
    run(): Promise<void>;
}
