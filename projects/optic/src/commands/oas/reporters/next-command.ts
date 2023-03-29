import chalk from 'chalk';

export function nextCommand(task: string, runCommand: string) {
  return chalk.bold(`${task} $ ${chalk.dim(runCommand)}`);
}
