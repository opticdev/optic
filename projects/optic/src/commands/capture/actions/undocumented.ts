import prompts from 'prompts';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { matchPathPattern } from '../../../utils/pathPatterns';
import { minimatch } from 'minimatch';
import { logger } from '../../../logger';
import { ParseResult } from '../../../utils/spec-loaders';

import {
  CapturedInteraction,
  CapturedInteractions,
} from '../sources/captured-interactions';
import { InferPathStructure } from '../operations/infer-path-structure';
import {
  generateEndpointSpecPatches,
  generatePathAndMethodSpecPatches,
  generateRefRefactorPatches,
  jsonOpsFromSpecPatches,
} from '../patches/patches';
import chalk from 'chalk';
import { writePatchesToFiles } from '../write/file';
import { SpecPatches } from '../patches/patchers/spec/patches';
import { UnpatchableDiff } from '../patches/patchers/shapes/diff';

type MethodMap = Map<string, { add: Set<string>; ignore: Set<string> }>;

export async function promptUserForPathPattern(
  interactions: CapturedInteractions,
  inferredPathStructure: InferPathStructure,
  options: { update: 'interactive' | 'automatic' }
) {
  const filteredInteractions: CapturedInteraction[] = [];
  const methodMap: MethodMap = new Map(
    Object.values(OpenAPIV3.HttpMethods)
      .filter((method) => method !== 'options' && method !== 'head')
      .map((method) => [
        method,
        {
          add: new Set(),
          ignore: new Set(),
        },
      ])
  );

  const newIgnorePaths: { method: string; path: string }[] = [];

  for await (const interaction of interactions) {
    const { path, method } = interaction.request;
    const pathsNode = methodMap.get(method);
    if (!pathsNode) {
      logger.debug(
        `Skipping ${method} ${path} because ${method} is not a supported method`
      );
      continue;
    }
    const { add, ignore } = pathsNode;
    const pathInAdd = [...add.values()].some(
      (p) => matchPathPattern(p, path).match
    );
    const pathInIgnore = [...ignore.values()].some((ignore) =>
      minimatch(path, ignore)
    );
    const guessedPattern =
      inferredPathStructure.includeObservedUrlPath(method, path) ?? path;

    if (pathInAdd) {
      filteredInteractions.push(interaction);
    } else if (pathInIgnore) {
      logger.debug(`Skipping ${method} ${path} because is in ignored specs`);
      continue;
    } else if (options.update === 'automatic') {
      add.add(guessedPattern);
      filteredInteractions.push(interaction);
    } else {
      logger.info(`> ` + chalk.bold.blue(guessedPattern));
      const results = await prompts(
        [
          {
            type: 'select',
            name: 'action',
            message: `Is this the right pattern for ${chalk.gray(
              `${method.toUpperCase()} ${path}`
            )}`,
            choices: [
              {
                title: 'yes',
                value: 'yes',
              },
              {
                title: 'no',
                value: 'no',
              },
              {
                title: 'ignore',
                value: 'ignore',
              },
              {
                title: 'skip',
                value: 'skip',
              },
            ],
          },
          {
            type: (pre) => (pre === 'no' ? 'text' : null),
            name: 'newPath',
            message: `Provide the correct path (e.g. ${chalk.gray(
              '/api/users/{userId}'
            )})`,
            validate: (pattern) =>
              matchPathPattern(pattern, interaction.request.path).match
                ? true
                : `Must be a valid path pattern and match the path ${path}`,
          },
        ],
        { onCancel: () => process.exit(1) }
      );

      if (results.action === 'yes') {
        add.add(guessedPattern);
        filteredInteractions.push(interaction);
      } else if (results.action === 'no') {
        add.add(results.newPath);
        filteredInteractions.push(interaction);
      } else if (results.action === 'skip') {
        continue;
      } else {
        ignore.add(path);
        newIgnorePaths.push({ method, path });
      }
    }
  }
  const endpointsToAdd: { method: string; path: string }[] = [];
  for (const [method, methodNode] of methodMap) {
    for (const path of methodNode.add) {
      endpointsToAdd.push({ method, path });
    }
  }
  return {
    interactions: filteredInteractions,
    endpointsToAdd,
    ignorePaths: newIgnorePaths,
  };
}

export async function documentNewEndpoint(
  interactions: CapturedInteraction[],
  parseResult: ParseResult,
  endpoint: { method: string; path: string }
) {
  const interactionsAsAsyncIterator = (async function* () {
    for (const interaction of interactions) {
      const { path, method } = interaction.request;
      if (
        matchPathPattern(endpoint.path, path).match &&
        endpoint.method === method
      ) {
        yield interaction;
      }
    }
  })();
  const meta: {
    schemaAdditionsSet: Set<string>;
    usedExistingRef: boolean;
    unpatchableDiffs: UnpatchableDiff[];
  } = {
    schemaAdditionsSet: new Set<string>(),
    usedExistingRef: false,
    unpatchableDiffs: [],
  };

  // generate patches to add the endpoint if doesn't exist
  const specPatches = (async function* (): SpecPatches {
    // Holds the same reference so we can mutate the spec in place and pass it to different generators
    const specHolder = {
      spec: parseResult.jsonLike,
    };

    yield* generatePathAndMethodSpecPatches(specHolder, endpoint);

    yield* generateEndpointSpecPatches(
      interactionsAsAsyncIterator,
      specHolder,
      endpoint,
      meta
    );

    yield* generateRefRefactorPatches(specHolder, meta);

    // If we use an existing ref, we need to rerun traffic
    if (meta.usedExistingRef) {
      meta.unpatchableDiffs = [];
      yield* generateEndpointSpecPatches(
        interactionsAsAsyncIterator,
        specHolder,
        endpoint,
        meta
      );
    }
  })();

  // TODO do something with unpatchable diffs

  const operations = await jsonOpsFromSpecPatches(specPatches);
  await writePatchesToFiles(operations, parseResult.sourcemap);
}
