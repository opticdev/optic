import path from 'path';
import fs from 'fs';

export const loadFile = (filePath: string): Promise<Buffer> => {
  const workingDir = process.cwd();
  const resolvedPath = path.resolve(workingDir, filePath);
  return new Promise((resolve, reject) => {
    fs.readFile(resolvedPath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

export const writeFile = (
  filePath: string,
  buffer: Buffer
): Promise<string> => {
  const workingDir = process.cwd();
  const resolvedPath = path.resolve(workingDir, filePath);
  return new Promise((resolve, reject) => {
    fs.writeFile(resolvedPath, buffer, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(resolvedPath);
      }
    });
  });
};
