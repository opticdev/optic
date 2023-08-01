import ora, { Ora } from 'ora';
import { logger } from '../logger';

const spinnerIsDisabled =
  process.env.ENVIRONMENT === 'test' || logger.getLevel() === 5;

export const getSpinner = (options: Parameters<typeof ora>[0]): Ora | null => {
  if (spinnerIsDisabled) {
    const text = typeof options === 'string' ? options : options?.text ?? '';
    logger.info(text);
    return null;
  } else {
    return ora(options);
  }
};
