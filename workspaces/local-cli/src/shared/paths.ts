import path from 'path';
import os from 'os';

export const lockFilePath = path.join(
  os.homedir(),
  '.optic',
  'daemon-lock.json'
);
