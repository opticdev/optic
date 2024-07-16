import { Command, program as cliInstance } from 'commander';
import { initSentry } from './sentry';
import { flushEvents, initSegment, trackEvent } from './segment';

import updateNotifier from 'update-notifier';
import { registerDiff } from './commands/diff/diff';
import { registerRulesetUpload } from './commands/ruleset/upload';

import { OpticCliConfig, initializeConfig } from './config';
import { registerRulesetInit } from './commands/ruleset/init';
import { registerApiAdd } from './commands/api/add';
import { registerApiCreate } from './commands/api/create';
import { registerCaptureCommand } from './commands/capture/capture';
import { registerConfigCommand } from './commands/config';
import { captureCommand as captureV1Command } from './commands/oas/capture';
import { newCommand } from './commands/oas/new';
import { setupTlsCommand } from './commands/oas/setup-tls';
import { verifyCommand } from './commands/oas/verify';
import { registerDiffAll } from './commands/diff/diff-all';
import { registerSpecPush } from './commands/spec/push';
import { registerSpecAddApiUrl } from './commands/spec/add-api-url';
import { registerLogin } from './commands/login/login';
import { registerCiComment } from './commands/ci/comment/comment';
import { logger } from './logger';
import chalk from 'chalk';
import { registerDereference } from './commands/dereference/dereference';
import { registerCiSetup } from './commands/ci/setup';
import { registerLint } from './commands/lint/lint';
import { registerBundle } from './commands/bundle/bundle';
import { updateCommand } from './commands/oas/update';
import { registerApiList } from './commands/api/list';
import { registerHistory } from './commands/history';
import { registerRunCommand } from './commands/run';
import path from 'path';
import { CustomUploadFn } from './types';

const packageJson = require('../package.json');

type installMethod = 'binary' | 'npm/yarn' | 'docker';
const allowedMethods = ['binary', 'npm/yarn', 'docker'];
function getInstallMethod(): installMethod {
  if (
    process.env.INSTALLATION_METHOD !== undefined &&
    allowedMethods.includes(process.env.INSTALLATION_METHOD)
  ) {
    return process.env.INSTALLATION_METHOD as installMethod;
  }

  return 'npm/yarn';
}

const getInstallInstruction = (): string => {
  const installMethod = getInstallMethod();

  // TODO: distinguish between 'binary' and 'npm/yarn' installations
  // vercel/pkg is deprecated. waiting on node's native packaging to explore this more

  if (installMethod === 'docker') {
    return 'docker pull docker.io/useoptic/optic:latest';
  }

  return 'npm i -g @useoptic/optic';
};

export const initCli = async (
  cli: Command = cliInstance,
  options: {
    hideNotifier?: boolean;
    customUpload?: CustomUploadFn;
  } = {}
): Promise<Command> => {
  cli.name('optic');
  cli.helpOption('-h, --help', 'Display help for the command');
  logger.debug(
    `Using Optic version ${packageJson.version} - ${getInstallMethod()}`
  );
  initSentry(process.env.SENTRY_URL, packageJson.version);
  initSegment(process.env.SEGMENT_KEY);
  cli.hook('preAction', async (command) => {
    const subcommands = ['ruleset', 'oas', 'api', 'spec', 'ci'];
    let commandName: string;
    let args: string[];
    if (subcommands.includes(command.args[0])) {
      commandName = command.args.slice(0, 2).join('.');
      args = command.args.slice(2);
    } else {
      [commandName, ...args] = command.args;
    }
    trackEvent(`optic.${commandName}`, {
      args,
      isInCi: process.env.CI === 'true',
    });
    trackEvent(`optic.cli`, {
      commandName,
      args,
      installMethod: getInstallMethod(),
      isInCi: process.env.CI === 'true',
    });
  });

  if (options.hideNotifier !== true) {
    const notifier = updateNotifier({
      pkg: {
        name: packageJson.name,
        version: packageJson.version,
      },
    });

    cli.hook('postAction', async () => {
      if (notifier.update) {
        logger.info(
          `
  ${chalk.green(chalk.bold(`New Optic version available:`))} ${
    notifier.update.latest
  } (current ${notifier.update.current})
  
  Run ${chalk.yellow(getInstallInstruction())} to upgrade Optic`
        );
      }
      try {
        await flushEvents();
        // we can ignore non-critical tracking errors
      } catch (e) {}
    });
  }

  let cliConfig: OpticCliConfig;

  try {
    cliConfig = await initializeConfig();
  } catch (e) {
    logger.error(chalk.red('Error initializing the cli config'));
    logger.error((e as Error).message);
    process.exitCode = 1;
    return cli;
  }

  cli.version(packageJson.version, '-V, --version', 'Display version');
  cli.addHelpCommand(false);

  registerRunCommand(cli, cliConfig, options);
  registerDiff(cli, cliConfig, options);

  const betaSubcommands = cli.command('beta', { hidden: true });
  registerCaptureCommand(cli, cliConfig);
  registerConfigCommand(cli, cliConfig);

  //@todo by 2023/5/10
  const oas = new Command('oas').description(
    '[Deprecated] capture/verify/update are now top-level commands'
  );
  oas.addCommand(await captureV1Command(cliConfig));
  oas.addCommand(await newCommand());
  oas.addCommand(await setupTlsCommand());
  oas.addCommand(verifyCommand(cliConfig));
  oas.addCommand(updateCommand());

  cli.addCommand(oas, { hidden: true });

  // commands for tracking changes with openapi
  cli.addCommand(await newCommand(), { hidden: true });
  cli.addCommand(await setupTlsCommand(), { hidden: true });
  cli.addCommand(verifyCommand(cliConfig), { hidden: true });
  cli.addCommand(updateCommand(), { hidden: true });

  registerLint(cli, cliConfig);
  registerDiffAll(cli, cliConfig, options);
  registerLogin(cli, cliConfig);
  registerDereference(cli, cliConfig);
  registerBundle(cli, cliConfig);

  const rulesetSubcommands = cli
    .command('ruleset', { hidden: true })
    .description(
      'Commands to build your own optic rulesets. See `optic ruleset --help`'
    )
    .addHelpCommand(false);
  registerRulesetUpload(rulesetSubcommands, cliConfig);
  registerRulesetInit(rulesetSubcommands, cliConfig);

  const apiSubcommands = cli
    .command('api', { hidden: true })
    .addHelpCommand(false);
  registerApiAdd(apiSubcommands, cliConfig);
  registerApiCreate(apiSubcommands, cliConfig);
  registerApiList(apiSubcommands, cliConfig);

  const specSubcommands = cli
    .command('spec', { hidden: true })
    .addHelpCommand(false);
  registerSpecPush(specSubcommands, cliConfig);
  registerSpecAddApiUrl(specSubcommands, cliConfig);

  const ciSubcommands = cli
    .command('ci', { hidden: true })
    .addHelpCommand(false);
  registerCiComment(ciSubcommands, cliConfig);
  registerCiSetup(ciSubcommands, cliConfig);

  registerHistory(cli, cliConfig);

  return cli;
};
