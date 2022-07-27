import { Writable } from 'stream';

export async function createCommandFeedback(options?: {
  destination?: Writable;
}) {
  const chalk = (await import('chalk')).default;
  if (!options) options = {};

  const destination: Writable = options.destination || process.stderr;

  return {
    inputError(message: string, errCode: number = 1) {
      destination.write(chalk.bgRed.white(' input ') + ' ' + message + '\n');
      process.exit(errCode);
    },

    internal(message: string, errCode: number = 1) {
      destination.write(
        chalk.bgRed.white(' internal-error ') + ' ' + message + '\n'
      );
      process.exit(errCode);
    },

    log(message: string) {
      return destination.write(message + '\n');
    },

    success(message: string) {
      return destination.write(
        ' ' + chalk.greenBright('✓') + ' ' + message + '\n'
      );
    },
  };
}
