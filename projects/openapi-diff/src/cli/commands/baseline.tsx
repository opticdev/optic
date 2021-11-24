import { Command } from 'commander';
import path from 'path';
import { isJson, isYaml, writeYaml } from '@useoptic/openapi-io';
import fs from 'fs-extra';
import { emptyOpenApi } from '../empty-open-api';
import { SnifferSource } from '../../services/traffic/sources/sniffer';
import { render } from 'ink';
import { Baseline } from '../../interactive/cli-components/baseline';
import React from 'react';

export function registerBaselineCommands(cli: Command) {
  cli
    .command('baseline')
    .usage('openapi.yaml --sniff-port 4000')
    .argument(
      '<openapi-file>',
      'an OpenAPI file to save to. Will be created if it does not exist'
    )
    .description('watch an API, and document its behaviors in an OpenAPI file')
    .requiredOption('--sniff-port <port>', 'port to sniff')
    .option('--sniff-interface [interface]', 'interface to sniff', 'en0')
    .action(async (openApiRelativePath, options) => {
      const openApiPath = path.resolve(openApiRelativePath);
      await ensureOpenApiAt(openApiPath);

      const sniffSource = new SnifferSource({
        port: Number(options.port),
        interface: options.interface,
      });

      // for debugging
      // sniffSource.on('traffic', console.log);

      render(<Baseline source={sniffSource} openApiFilePath={openApiPath} />);
    });
}

async function ensureOpenApiAt(filepath: string) {
  if (await fs.pathExists(filepath)) return;

  const logWrite = () =>
    console.log(`writing empty OpenAPI file to ${filepath}`);

  if (isJson(filepath)) {
    fs.writeFile(filepath, JSON.stringify(emptyOpenApi(), null, 2));
    logWrite();
  } else if (isYaml(filepath)) {
    fs.writeFile(filepath, writeYaml(emptyOpenApi()));
    logWrite();
  } else {
    throw new Error(`${filepath} must be a .json or .yaml path`);
  }
}
