import { Command, Argument } from 'commander';
import { createSpecFile, SpecTemplate, OpenAPIV3 } from '../lib';
import * as fs from 'fs';
import * as path from 'path';
import { applyTemplate } from '../workflows';

export function debugWorkflowsCommand(): Command {
  const command = new Command('debug-workflow');

  const addResource = new Command('add-resource')
    .addArgument(new Argument('<resource-name>', '[resource-name]'))
    .action(async (resourceName) => {
      if (!fs.existsSync(path.join(process.cwd(), 'resources')))
        throw new Error('Resource directory does not exist');

      let resourceFilePath = path.join(
        process.cwd(),
        'resources',
        resourceName + '.yml'
      );

      return createResourceFile(resourceName, resourceFilePath);
    });

  command.addCommand(addResource);

  return command;
}

async function createResourceFile(
  resourceName: string,
  resourceFilePath: string
) {
  await createSpecFile(resourceFilePath, {
    title: `${resourceName} Resource`,
    version: '1.0.0',
  });

  await applyTemplate(newResourceFileTemplate, resourceFilePath, {
    resourceName,
  });
}

const newResourceFileTemplate = SpecTemplate.create(
  'new-resource-file',
  function (spec: OpenAPIV3.Document, options: { resourceName: string }) {
    spec.servers = [
      { url: 'https://api.snyk.io/v3', description: 'Public Snyk API' },
    ];
    spec.tags = [
      {
        name: options.resourceName,
        description: `Short description of what ${options.resourceName} represents`,
      },
    ];
  }
);
