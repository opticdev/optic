import Execa from 'execa';
import { Duplex, PassThrough } from 'stream';
import fs from 'fs';

import Config from './config';

export default function spawn({
  specPath,
}: {
  specPath: string;
}): {
  input: Duplex;
  output: Duplex;
  error: Duplex;
} {
  const input = new PassThrough();
  const output = new PassThrough();
  const error = new PassThrough();

  if (!fs.existsSync(Config.binaryPath)) {
    throw new Error(`expected binary at ${Config.binaryPath}`);
  }

  const diffProcess = Execa(Config.binaryPath, [specPath], {
    input,
    stdio: 'pipe',
  });

  if (!diffProcess.stdout || !diffProcess.stderr)
    throw new Error('diff process should have stdout and stderr streams');

  diffProcess.stdout.pipe(output);
  diffProcess.stderr.pipe(error);

  return { input, output, error };
}
