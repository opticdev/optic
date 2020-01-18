import * as path from 'path';
import * as os from 'os';

export const lockFilePath = path.join(os.homedir(), '.optic', 'daemon-lock.json');
