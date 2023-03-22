import { Command } from 'commander';
import { Writable } from 'stream';
import { trackEvent, flushEvents } from '../../segment';
import chalk from 'chalk';
export function createCommandFeedback(
  command: Command,
  options?: {
    destination?: Writable;
  }
) {
  if (!options) options = {};

  let commandName = command.name();

  const destination: Writable = options.destination || process.stderr;

  command.configureOutput({
    writeErr: (message) => inputError(message, 'command.error'),
  });

  function inputError(
    message: string,
    name: string,
    eventProperties: { [key: string]: any } = {},
    errCode: number = 1
  ): Promise<void> {
    const prefix = message.indexOf('error: ') > -1 ? '' : 'error: ';
    destination.write(
      chalk.bgRed.white(' input ') + ' ' + prefix + message + '\n'
    );
    trackEvent(`openapi_cli.${commandName}.input-error.${name}`, {
      ...eventProperties,
      message,
    });
    return flushEvents()
      .catch((err) => {
        console.warn('Could not flush usage analytics (non-critical)');
      })
      .finally(() => {
        process.exit(errCode);
      });
  }

  function instruction(message: string, errCode: number = 1) {
    destination.write(chalk.bgBlue.white(' help ') + ' ' + message + '\n');
  }
  function commandInstruction(command: string, action: string) {
    destination.write(
      chalk.gray(` (use "${chalk.bold(command)}" to ${action})`) + '\n'
    );
  }

  function notable(message: string) {
    destination.write(chalk.blueBright(' » ') + message + '\n');
  }

  function warning(message: string) {
    destination.write(chalk.bgYellow.black(' warning ') + ' ' + message + '\n');
  }

  function internal(
    message: string,
    exit: boolean = false,
    errCode: number = 1
  ) {
    destination.write(
      chalk.bgRed.white(' internal-error ') + ' ' + message + '\n'
    );
    if (exit) {
      process.exit(errCode);
    }
  }

  function log(message: string) {
    return destination.write(message + '\n');
  }

  function logChild(child: string, message: string) {
    return destination.write(
      chalk.magenta(`[${child}]`) + ' ' + message + '\n'
    );
  }
  function title(title: string) {
    return destination.write('\n' + chalk.bold.underline(title + '\n'));
  }

  function success(message: string) {
    return destination.write(
      ' ' + chalk.greenBright('✓') + ' ' + message + '\n'
    );
  }

  return {
    inputError,
    internal,
    commandInstruction,
    instruction,
    notable,
    log,
    logChild,
    title,
    success,
    warning,
  };
}

export enum InputErrors {
  CAPTURE_METHOD_MISSING = 'capture-method-missing',
  DESTINATION_FILE_DIR_MISSING = 'destination-file-dir-missing',
  DESTINATION_FILE_ALREADY_EXISTS = ' destination-file-already-exists',
  HAR_FILE_NOT_FOUND = 'har-file-not-found',
  PROXY_IN_NON_TTY = 'proxy-in-non-tty',
  SPEC_FILE_NOT_FOUND = 'spec-file-not-found',
  SPEC_FILE_NOT_READABLE = 'spec-file-not-readable',
}
