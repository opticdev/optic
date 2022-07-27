export async function createFormatter() {
  const chalk = (await import('chalk')).default;

  return {
    error(message: string) {
      return chalk.bgRed.white(' error ') + ' ' + message;
    },

    success(message: string) {
      return ' ' + chalk.greenBright('✓') + ' ' + message;
    },
  };
}
