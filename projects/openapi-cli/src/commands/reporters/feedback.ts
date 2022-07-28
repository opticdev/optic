import { Command } from 'commander';
import { Writable } from 'stream';

export async function createCommandFeedback(
  command: Command,
  options?: {
    destination?: Writable;
  }
) {
  const chalk = (await import('chalk')).default;
  if (!options) options = {};

  const destination: Writable = options.destination || process.stderr;

  command.configureOutput({
    writeErr: inputError,
  });

  function inputError(message: string, errCode: number = 1) {
    const prefix = message.indexOf('error: ') > -1 ? '' : 'error: ';
    destination.write(
      chalk.bgRed.white(' input ') + ' ' + prefix + message + '\n'
    );
    process.exit(errCode);
  }

  function instruction(message: string, errCode: number = 1) {
    destination.write(chalk.bgBlue.white(' help ') + ' ' + message + '\n');
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

  function success(message: string) {
    return destination.write(
      ' ' + chalk.greenBright('✓') + ' ' + message + '\n'
    );
  }

  return {
    inputError,
    internal,
    instruction,
    notable,
    log,
    success,
    warning,
  };
}
