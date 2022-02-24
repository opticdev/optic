import path from 'path';
import fs from 'fs';

import { OPTIC_CONFIG_PATH } from './constants';
import { CheckConfiguration } from './checker';
/**
 * Expected format
 * module.exports = {
 *  token: process.env.OPTIC_TOKEN,
 *  gitProvider: {
 *    token: process.env.GITHUB_TOKEN,
 *    provider: 'github'
 *  },
 * checks: [
 *
 * ]
 */

type OpticConfiguration = {
  token?: string;
  gitProvider?: {
    token: string;
    provider: 'github';
  };
  checks?: CheckConfiguration[];
};

const findOpticConfigPath = (dir: string): string | null => {
  while (true) {
    const opticConfigPath = path.join(dir, OPTIC_CONFIG_PATH);

    if (fs.existsSync(opticConfigPath)) {
      return opticConfigPath;
    }

    const nextDir = path.dirname(dir);
    if (nextDir === dir) {
      break;
    }
    dir = nextDir;
  }

  return null;
};

export const readConfig = async (): Promise<OpticConfiguration> => {
  const opticConfigPath = findOpticConfigPath(process.cwd());
  if (opticConfigPath) {
    // TODO add validation to configuration loading
    // TODO add in fallbacks / defaults here
    return import(opticConfigPath);
  } else {
    return {};
  }
};
