import chalk from 'chalk';

const isElevatedLoad = import('is-elevated');

const platform: 'mac' | 'windows' | 'linux' =
  process.platform === 'win32'
    ? 'windows'
    : process.platform === 'darwin'
    ? 'mac'
    : 'linux';

export async function requireAdmin(purpose: string) {
  const fix = `Re-run ${platform === 'windows' ? 'as admin' : 'with sudo'}`;

  const isElevated = (await isElevatedLoad).default;

  if (!(await isElevated())) {
    console.log(chalk.bold.red(purpose + '\n' + chalk.red(fix)));
    process.exit(1);
  }
}
