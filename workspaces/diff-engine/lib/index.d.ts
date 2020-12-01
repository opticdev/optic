/// <reference types="node" />

import { Duplex } from 'stream';
import { ExecaChildProcess } from 'execa';

export function spawn({
  specPath: string,
}): {
  input: Duplex;
  output: Duplex;
  error: Duplex;
  child: ExecaChildProcess;
};
