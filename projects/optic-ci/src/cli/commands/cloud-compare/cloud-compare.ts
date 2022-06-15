import { Command } from 'commander';

export const registerCloudCompare = (cli: Command, hideCommand: boolean) => {
  cli.command('run', hideCommand ? { hidden: true } : {}).action(() => {
    console.log('todo');
  });
};
