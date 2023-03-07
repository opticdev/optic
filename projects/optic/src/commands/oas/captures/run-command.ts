import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { createCommandFeedback } from '../reporters/feedback';
import url from 'url';

export class RunCommand {
  constructor(
    private proxyUrl: string,
    private feedback: ReturnType<typeof createCommandFeedback>
  ) {}

  completed: boolean = false;
  process: ChildProcessWithoutNullStreams | undefined = undefined;

  async run(command: string): Promise<{ exitCode: number }> {
    const { port, hostname } = url.parse(this.proxyUrl);

    const [commandStart] = command.split(/ +/);

    const commandProcess = spawn(command, {
      cwd: process.cwd(),
      env: {
        ...process.env,
        http_proxy: `http://${hostname}:${port}`,
        https_proxy: `https://${hostname}:${port}`,
      },
      shell: true,
    });

    this.feedback.notable('Running command: ' + command);

    this.process = commandProcess;

    commandProcess.stdout.setEncoding('utf8');

    commandProcess.stdout.on('data', (data) => {
      const str = data.toString(),
        lines = str.split(/(\r?\n)/g);
      lines.forEach(
        (line) => line.trim() && this.feedback.logChild(commandStart, line)
      );
    });

    commandProcess.stderr.on('data', (data) => {
      const str = data.toString(),
        lines = str.split(/(\r?\n)/g);
      lines.forEach(
        (line) => line.trim() && this.feedback.logChild(commandStart, line)
      );
    });

    return new Promise((resolve) => {
      const endIt = (code: number | undefined) => {
        this.completed = true;
        resolve({ exitCode: commandProcess?.exitCode || 0 });
        commandProcess!.removeAllListeners('error');
        commandProcess!.removeAllListeners('data');
        commandProcess!.removeAllListeners('exit');
      };
      commandProcess!.once('exit', (code) => endIt(code || undefined));
      commandProcess!.once('end', endIt);
      commandProcess!.once('close', endIt);
    });
  }

  async kill() {
    if (!this.completed && this.process) {
      this.process.kill(1);
    }
  }
}
