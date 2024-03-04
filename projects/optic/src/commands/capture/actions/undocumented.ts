import prompts from 'prompts';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { matchPathPattern } from '../../../utils/pathPatterns';
import { minimatch } from 'minimatch';
import { logger } from '../../../logger';
import { ParseResult } from '../../../utils/spec-loaders';
import * as AT from '../../oas/lib/async-tools';
import {
  CapturedInteraction,
  CapturedInteractions,
} from '../sources/captured-interactions';
import { PathInference } from '../operations/path-inference';
import {
  generateEndpointSpecPatches,
  generatePathAndMethodSpecPatches,
  generateRefRefactorPatches,
  jsonOpsFromSpecPatches,
} from '../patches/patches';
import chalk from 'chalk';
import { writePatchesToFiles } from '../write/file';
import { SpecPatch, SpecPatches } from '../patches/patchers/spec/patches';
import { UnpatchableDiff } from '../patches/patchers/shapes/diff';

type MethodMap = Map<string, { add: Set<string>; ignore: Set<string> }>;

export async function promptUserForPathPattern(
  interactions: CapturedInteractions,
  pathInference: PathInference,
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
    const guessedPattern = pathInference.getInferedPattern(path);

    if (pathInAdd) {
      filteredInteractions.push(interaction);
    } else if (pathInIgnore) {
      logger.debug(`Skipping ${method} ${path} because is in ignored specs`);
      continue;
    } else if (options.update === 'automatic') {
      add.add(guessedPattern);
      pathInference.addKnownPath(guessedPattern);
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
        pathInference.addKnownPath(guessedPattern);
        filteredInteractions.push(interaction);
      } else if (results.action === 'no') {
        add.add(results.newPath);
        pathInference.addKnownPath(results.newPath);
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
  parseResult: Exclude<ParseResult, { version: '2.x.x' }>,
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

  // generate patches to add the endpoint if doesn't exist
  const specPatches = (async function* (): SpecPatches {
    // Holds the same reference so we can mutate the spec in place and pass it to different generators
    const specHolder = {
      spec: parseResult.jsonLike,
    };
    const meta = {
      schemaAdditionsSet: new Set<string>(),
      usedExistingRef: false,
    };
    yield* generatePathAndMethodSpecPatches(specHolder, endpoint);

    // We don't need to collect unpatchable diffs here, since optic is generating a spec from no schema, we'll always know how to handle schemas we create
    yield* AT.filter(
      (diffOrPatch: SpecPatch | UnpatchableDiff) =>
        !('unpatchable' in diffOrPatch)
    )(
      generateEndpointSpecPatches(
        interactionsAsAsyncIterator,
        specHolder,
        endpoint,
        meta
      )
    ) as SpecPatches;

    yield* generateRefRefactorPatches(specHolder, meta);

    // If we use an existing ref, we need to rerun traffic
    if (meta.usedExistingRef) {
      yield* AT.filter(
        (diffOrPatch: SpecPatch | UnpatchableDiff) =>
          !('unpatchable' in diffOrPatch)
      )(
        generateEndpointSpecPatches(
          interactionsAsAsyncIterator,
          specHolder,
          endpoint,
          meta
        )
      ) as SpecPatches;
    }
  })();

  const operations = await jsonOpsFromSpecPatches(specPatches);
  await writePatchesToFiles(operations, parseResult.sourcemap);
}
