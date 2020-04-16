import { Command } from '@oclif/command';
export default class Start extends Command {
    static description: string;
    run(): Promise<void>;
}
