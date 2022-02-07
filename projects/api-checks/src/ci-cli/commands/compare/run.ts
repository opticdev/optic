import commander, { Command } from 'commander';

export const registerRun = (
  cli: Command,
  projectName: string,
  scriptSubcommands: commander.Command[]
) => {
  const runCommand = cli.command('run');
  scriptSubcommands.forEach((scriptCommand) => {
    console.log(scriptCommand.name());
    runCommand.addCommand(scriptCommand);
  });
};
