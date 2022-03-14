import { Command } from 'commander';
import { runCommand as snykRunCommand } from '../example-workflows/snyk/commands';

export function debugWorkflowsCommand(): Command {
  const command = new Command('debug-workflows');

  const snykCommand = snykRunCommand();
  snykCommand.name('snyk'); // override command name to keep debugging sane

  command.addCommand(snykCommand);

  return command;
}
