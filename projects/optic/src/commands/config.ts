import { Command } from 'commander';
import { OpticCliConfig, RenderTemplate } from '../config';
import * as yaml from 'yaml';

export const registerConfigCommand = (
  cli: Command,
  cliConfig: OpticCliConfig
) => {
  const config = cli.command('config');
  config
    .helpOption('-h, --help', 'Display help for the command')
    .addHelpCommand(false)
    .configureHelp({ commandUsage: () => `\n  optic config <command>` })
    .description('Commands to manage the Optic configuration');

  config
    .command('show')
    .description('Display the rendered Optic configuration from optic.yml')
    .configureHelp({ commandUsage: () => `\n  optic config show` })
    .action(async () => {
      if (cliConfig.configPath) {
        console.log(
          // rendering the template a second time isn't awesome (it first happens when the CLI is initialized), but an OpticCliConfig contains more than just whats in optic.yml and doesn't have a simple way to convert to yaml anyway.
          yaml.stringify(await RenderTemplate(cliConfig.configPath), null, 2)
        );
      } else {
        console.log('no config was found');
      }
    });
};
