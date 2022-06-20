import fs from 'fs';

export const writeOpticConfig = async (config: string) => {
  const file = 'optic.yml';
  const fileExists = fs.existsSync(file);
  if (fileExists)
    throw new Error(`Error: a pre-existing "${file}" file was found.`);

  return new Promise<void>((resolve, reject) => {
    const cb = (err: unknown) => {
      if (err) reject(err);
      resolve();
    };
    fs.writeFile(file, config, cb);
  });
};
