import fs from 'fs';
import { configFile } from './constants';

export const writeOpticConfig = async (config: string) =>
  new Promise<void>((resolve, reject) => {
    const cb = (err: unknown) => {
      if (err) reject(err);
      resolve();
    };
    fs.writeFile(configFile, config, cb);
  });
