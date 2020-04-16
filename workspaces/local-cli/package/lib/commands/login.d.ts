import { Command } from '@oclif/command';
export default class Login extends Command {
    static description: string;
    run(): Promise<void>;
}
