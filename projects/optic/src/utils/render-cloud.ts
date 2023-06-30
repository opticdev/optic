import { logger } from '../logger';
import chalk from 'chalk';

export function renderCloudSetup() {
  logger.info('');
  logger.info('');
  logger.info(
    ' ' +
      chalk.bold.yellow(
        'Finish setting up Optic by adding your OPTIC_TOKEN. Create one here: '
      ) +
      chalk.blue.underline('https://app.useoptic.com/')
  );

  logger.info(' → Add API Review Tools to your Pull Requests ');
  logger.info(
    chalk.dim(
      '   Preview Docs | Visual Diffs | Notify Consumers | Sharable links | API Changelogs | Stats'
    )
  );
}
