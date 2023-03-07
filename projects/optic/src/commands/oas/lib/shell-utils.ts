import chalk from 'chalk';
import { exec } from 'child_process';
import isElevated from 'is-elevated';

export const platform: 'mac' | 'windows' | 'linux' =
  process.platform === 'win32'
    ? 'windows'
    : process.platform === 'darwin'
    ? 'mac'
    : 'linux';

export async function exitIfNotElevated(withError: string) {
  const result = await isElevated();
  if (result) {
    return;
  } else {
    console.log(chalk.red(withError));
    process.exit(2);
  }
}

export async function runCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error(`exec error: ${err}`);
        return reject(err);
      }
      resolve(stdout);
    });
  });
}
