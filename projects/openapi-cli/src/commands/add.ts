import { Command } from 'commander';
import { HttpMethods } from '../operations/index';
import { Result, Ok, Err } from 'ts-results';
import Path from 'path';
import * as fs from 'fs-extra';

export function addCommand(): Command {
  const command = new Command('add');

  command
    .argument('<openapi-file>', 'an OpenAPI spec file to add an operation to')
    .argument('<operations...>', 'HTTP method and path pair(s) to add')
    .description('add an operation (path + method) to an OpenAPI specification')
    .action(async (specPath: string, operationComponents: string[]) => {
      const absoluteSpecPath = Path.resolve(specPath);
      if (!(await fs.pathExists(absoluteSpecPath))) {
        return command.error('OpenAPI specification file could not be found');
      }

      let parsedOperationsResult = parseOperations(operationComponents);
      if (parsedOperationsResult.err) {
        return command.error(parsedOperationsResult.val);
      }

      let parsedOperations = parsedOperationsResult.unwrap();
      console.log(parsedOperations);
    });

  return command;
}

interface ParsedOperation {
  methods: Array<typeof HttpMethods>;
  pathPattern: string;
}

function parseOperations(
  rawComponents: string[]
): Result<ParsedOperation[], string> {
  const components = rawComponents.filter((s) => s.length > 0);
  const pairs: ParsedOperation[] = [];

  console.log({ components });

  for (let i = 0; i < Math.ceil(components.length / 2); i++) {
    let rawMethods = components[i * 2];
    let pathPattern = components[i * 2 + 1];

    let methods: Array<typeof HttpMethods> = [];
    for (let maybeMethod of rawMethods.split(',')) {
      let method = HttpMethods[maybeMethod.toUpperCase()];
      if (!method) {
        return Err(`Could not parse '${maybeMethod}' as a valid HTTP method`);
      }
      methods.push(method);
    }

    let pair = { methods, pathPattern };
    pairs.push(pair);
  }

  return Ok(pairs);
}
