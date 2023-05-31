import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { createCommandFeedback } from '../reporters/feedback';

export class RunCommand {
  constructor(
    private feedback: ReturnType<typeof createCommandFeedback>,
    private feedbackLevel: 'info' | 'error' | 'silent' = 'info',
    private env: { [key: string]: string | undefined } = {}
  ) {}

  completed: boolean = false;
  process: ChildProcessWithoutNullStreams | undefined = undefined;

  async run(command: string): Promise<{ exitCode: number }> {
    const [commandStart] = command.split(/ +/);

    const commandProcess = spawn(command, {
      cwd: process.cwd(),
      env: {
        ...process.env,
        ...this.env,
      },
      shell: true,
    });

    if (this.feedbackLevel === 'info')
      this.feedback.notable('Running command: ' + command);

    this.process = commandProcess;

    commandProcess.stdout.setEncoding('utf8');

    if (this.feedbackLevel === 'info') {
      commandProcess.stdout.on('data', (data) => {
        const str = data.toString(),
          lines = str.split(/(\r?\n)/g);
        lines.forEach(
          (line) => line.trim() && this.feedback.logChild(commandStart, line)
        );
      });
    }

    if (this.feedbackLevel !== 'silent') {
      commandProcess.stderr.on('data', (data) => {
        const str = data.toString(),
          lines = str.split(/(\r?\n)/g);
        lines.forEach(
          (line) => line.trim() && this.feedback.logChild(commandStart, line)
        );
      });
    }

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

  kill() {
    if (this.process) {
      this.process.kill('SIGKILL');
    }
  }
}
