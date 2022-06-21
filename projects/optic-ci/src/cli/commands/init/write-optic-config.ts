import fs from 'fs';
import path from 'path';

import { configFile } from './constants';

export const writeOpticConfig = async (config: string) =>
  new Promise<void>((resolve, reject) => {
    const cb = (err: unknown) => {
      if (err) reject(err);
      resolve();
    };
    const configPath = path.join(process.cwd(), configFile);
    fs.writeFile(configPath, config, cb);
  });
