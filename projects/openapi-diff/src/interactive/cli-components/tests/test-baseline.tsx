import React from 'react';
import { program as cli } from 'commander';
import { OpticOssDebugCaptureSource } from '../../../services/traffic/sources/debug-implementations';
import path from 'path';
import { Baseline } from '../baseline';
import { render } from 'ink';

const examplesDir = path.resolve(__dirname, 'example-sessions');

cli
  .requiredOption('--capture <name>')
  .action(async (options: { capture: string }) => {
    const debugSource = new OpticOssDebugCaptureSource(
      path.join(examplesDir, options.capture),
      1000
    );

    render(
      <Baseline
        source={debugSource}
        openApiFilePath={`${process.cwd()}/openapi.json`}
      />
    );
  });

cli.parse(process.argv);
