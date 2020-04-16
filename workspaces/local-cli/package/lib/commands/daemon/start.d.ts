import { Command } from '@oclif/command';
export default class DaemonStop extends Command {
    static description: string;
    static hidden: boolean;
    run(): Promise<void>;
}
