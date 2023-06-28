import { logger } from '../logger';
import chalk from 'chalk';

export function renderCloudSetup() {
  logger.info('');
  logger.info('');
  logger.info(
    ' ' +
      chalk.bold.yellow(
        'Finish setting up Optic by adding your OPTIC_TOKEN. Setup: '
      ) +
      chalk.blue.underline('https://app.useoptic.com/')
  );
  logger.info(
    '  → ' +
      chalk.dim(
        'Preview Docs | Visual Diffs | Sharable links | API Changelogs | Stats'
      )
  );
}
