import fs from 'node:fs/promises';
import prompts from 'prompts';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { matchPathPattern } from '../../../utils/pathPatterns';
import { minimatch } from 'minimatch';
import { logger } from '../../../logger';
import { ParseResult } from '../../../utils/spec-loaders';
import { getIgnorePaths } from '../../../utils/specs';

import { CapturedInteraction, CapturedInteractions } from '../../oas/captures';
import { InferPathStructure } from '../../oas/operations/infer-path-structure';
import { specToOperations } from '../../oas/operations/queries';
import { updateSpecFiles } from '../../oas/diffing/document';
import {
  generateEndpointSpecPatches,
  generatePathAndMethodSpecPatches,
} from './patches';
import { SpecPatches } from '../../oas/specs';

type MethodMap = Map<string, { add: Set<string>; ignore: Set<string> }>;

export async function promptUserForPathPattern(
  interactions: CapturedInteractions,
  spec: OpenAPIV3.Document
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

  const ignorePaths = getIgnorePaths(spec);
  const newIgnorePaths: { method: string; pattern: string }[] = [];

  for (const ignore of ignorePaths) {
    if (!ignore.method) {
      for (const [, methodNode] of methodMap) {
        methodNode.ignore.add(ignore.path);
      }
    } else if (ignore.method) {
      const maybeNode = methodMap.get(ignore.method);
      maybeNode?.ignore.add(ignore.path);
    }
  }
  const inferredPathStructure = new InferPathStructure(specToOperations(spec));

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

    if (pathInAdd) {
      filteredInteractions.push(interaction);
    } else if (pathInIgnore) {
      logger.debug(`Skipping ${method} ${path} because is in ignored specs`);
      continue;
    } else {
      const guessedPattern =
        inferredPathStructure.includeObservedUrlPath(method, path) ?? path;
      const results = await prompts(
        [
          {
            type: 'select',
            name: 'action',
            message: `Is ${guessedPattern} the right pattern for ${method.toUpperCase()} ${path}`,
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
            message: 'Provide the correct path (e.g. /api/users/{userId)',
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
        newIgnorePaths.push({ method, pattern: path });
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
      yield interaction;
    }
  })();

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
      endpoint
    );
  })();

  let { results: updatedSpecFiles } = updateSpecFiles(
    specPatches,
    parseResult.sourcemap
  );

  for await (const { path, contents } of updatedSpecFiles) {
    await fs.writeFile(path, contents);
  }
}