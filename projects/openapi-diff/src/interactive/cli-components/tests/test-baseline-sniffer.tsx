import React from 'react';
import { program as cli } from 'commander';
import { Baseline } from '../baseline';
import { render } from 'ink';
import { SnifferSource } from '../../../services/traffic/sources/sniffer';
import { waitFor } from '../../../utils/debug_waitFor';

cli
  .requiredOption('--port <port>')
  .option('--interface <interface>', 'interface', 'en0')
  .action(async (options: { port: string; interface: string }) => {
    const sniffSource = new SnifferSource({
      port: Number(options.port),
      interface: options.interface,
    });

    sniffSource.on('traffic', console.log);

    render(<Baseline source={sniffSource} />);
  });

cli.parse(process.argv);
