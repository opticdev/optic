import fs from 'fs';

export const readOpenApiSpec = async (filePath: string): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const cb = (err: unknown, data: Buffer) => {
      if (err) reject(err);
      const stringFile = data.toString();
      resolve(stringFile);
    };
    fs.readFile(filePath, cb);
  });
