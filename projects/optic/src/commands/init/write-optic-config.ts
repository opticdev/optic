import fs from 'fs';

export const writeOpticConfig = async (config: string, configPath: string) =>
  new Promise<void>((resolve, reject) => {
    const cb = (err: unknown) => {
      if (err) reject(err);
      resolve();
    };
    fs.writeFile(configPath, config, cb);
  });
