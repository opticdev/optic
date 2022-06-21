import fs from 'fs';
import path from 'path';

export const readOpenApiSpec = async (filePath: string): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const cb = (err: unknown, data: Buffer) => {
      if (err) reject(err);
      const stringFile = data.toString();
      resolve(stringFile);
    };
    const fullFilePath = path.join(process.cwd(), filePath);
    fs.readFile(fullFilePath, cb);
  });
