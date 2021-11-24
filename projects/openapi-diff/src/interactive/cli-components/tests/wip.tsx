import React from 'react';
import { program as cli } from 'commander';
import path from 'path';
import { render, Text } from 'ink';
import { ChangeView } from '../ui/change';
import { CodeBlock } from '../ui/code/code-block';

const examplesDir = path.resolve(__dirname, 'example-sessions');

cli.action(async (options: { capture: string }) => {
  // render(<ChangeView />);
  render(<CodeBlock />);
});

cli.parse(process.argv);
