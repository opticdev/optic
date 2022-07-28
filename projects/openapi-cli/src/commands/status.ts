import { Command } from 'commander';
import Path from 'path';
import * as fs from 'fs-extra';

import { createCommandFeedback } from './reporters/feedback';
import * as AT from '../lib/async-tools';
import { ComponentSchemaExampleFacts, readDeferencedSpec } from '../specs';
import {
  DocumentedInteractions,
  HttpMethod,
  HttpMethods,
  UndocumentedOperation,
  UndocumentedOperationType,
  UndocumentedOperations,
} from '../operations';
import {
  CapturedInteraction,
  CapturedInteractions,
  HarEntries,
} from '../captures';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';

export async function statusCommand(): Promise<Command> {
  const command = new Command('status');
  const feedback = await createCommandFeedback(command);

  command
    .description('match observed traffic up to an OpenAPI spec')
    .argument(
      '<openapi-file>',
      'an OpenAPI spec to match up to observed traffic'
    )
    .option('--har <har-file>', 'path to HttpArchive file (v1.2, v1.3)')
    .action(async (specPath) => {
      const absoluteSpecPath = Path.resolve(specPath);
      if (!(await fs.pathExists(absoluteSpecPath))) {
        return feedback.inputError(
          'OpenAPI specification file could not be found'
        );
      }

      const options = command.opts();

      const sources: CapturedInteractions[] = [];

      if (options.har) {
        let absoluteHarPath = Path.resolve(options.har);
        if (!(await fs.pathExists(absoluteHarPath))) {
          return feedback.inputError(
            'HAR file could not be found at given path'
          );
        }
        let harFile = fs.createReadStream(absoluteHarPath);
        let harEntries = AT.tap(
          (entry: any) => {}
          // console.log('har entry', entry)
        )(HarEntries.fromReadable(harFile));
        sources.push(CapturedInteractions.fromHarEntries(harEntries));
      }

      if (sources.length < 1) {
        return feedback.inputError('choose a traffic source to match spec by');
      }

      const specReadResult = await readDeferencedSpec(absoluteSpecPath);
      if (specReadResult.err) {
        feedback.inputError(
          `OpenAPI specification could not be fully resolved: ${specReadResult.val.message}`
        );
      }
      const { jsonLike: spec } = specReadResult.unwrap();

      let interactions = AT.merge(...sources);

      let observations = matchInteractions(spec, interactions);

      await renderStatus(observations);
    });

  return command;
}

export function matchInteractions(
  spec: OpenAPIV3.Document,
  interactions: CapturedInteractions
): StatusObservations {
  const interactionsFork = AT.forkable(
    // TODO: figure out why this prevents `forkable` from producing an empty object as the last interaction
    AT.tap<CapturedInteraction>(() => {})(interactions)
  );

  const documentedInteractions =
    DocumentedInteractions.fromCapturedInteractions(
      interactionsFork.fork(),
      spec
    );
  const undocumentedOperations =
    UndocumentedOperations.fromCapturedInteractions(
      interactionsFork.fork(),
      spec
    );
  interactionsFork.start();

  const matchingObservations = (async function* (): StatusObservations {
    for await (let documentedInteractionOption of documentedInteractions) {
      console.log;
      if (documentedInteractionOption.none) continue;

      let documentedInteraction = documentedInteractionOption.unwrap();

      yield {
        kind: StatusObservationKind.InteractionMatchedOperation,
        capturedPath: documentedInteraction.interaction.request.path,
        path: documentedInteraction.operation.pathPattern,
        method: documentedInteraction.operation.method,
      };
    }
  })();

  const unmatchingObservations = (async function* (): StatusObservations {
    for await (let undocumentedOperation of undocumentedOperations) {
      if (
        undocumentedOperation.type === UndocumentedOperationType.MissingMethod
      ) {
        yield {
          kind: StatusObservationKind.InteractionUnmatchedMethod,
          path: undocumentedOperation.pathPattern,
          method: undocumentedOperation.method,
        };
      } else if (
        undocumentedOperation.type === UndocumentedOperationType.MissingPath
      ) {
        for (let method of undocumentedOperation.methods) {
          yield {
            kind: StatusObservationKind.InteractionUnmatchedPath,
            path: undocumentedOperation.pathPattern,
            method,
          };
        }
      }
    }
  })();

  return AT.merge(matchingObservations, unmatchingObservations);
}

export enum StatusObservationKind {
  InteractionMatchedOperation = 'interaction-matched-operation',
  InteractionUnmatchedMethod = 'interaction-unmatched-method',
  InteractionUnmatchedPath = 'interaction-unmatched-path',
}

export type StatusObservation = {
  kind: StatusObservationKind;
} & (
  | {
      kind: StatusObservationKind.InteractionMatchedOperation;
      capturedPath: string;
      path: string;
      method: string;
    }
  | {
      kind: StatusObservationKind.InteractionUnmatchedMethod;
      path: string;
      method: string;
    }
  | {
      kind: StatusObservationKind.InteractionUnmatchedPath;
      path: string;
      method: string;
    }
);

export interface StatusObservations extends AsyncIterable<StatusObservation> {}

async function renderStatus(observations: StatusObservations) {
  let stats = {
    interationsCount: 0,
    matchedOperations: new Map<string, { path: string; method: string }>(),
    matchedInteractionCountByOperation: new Map<string, number>(),
    unmatchedMethods: new Map<string, { path: string; methods: string[] }>(),
    unmatchedPaths: new Map<string, { path: string; method: string }>(),
  };

  for await (let observation of observations) {
    if (
      observation.kind === StatusObservationKind.InteractionMatchedOperation
    ) {
      stats.interationsCount += 1;
      let opId = operationId(observation);

      if (!stats.matchedOperations.has(opId)) {
        let { path, method } = observation;
        stats.matchedOperations.set(opId, { path, method });
        stats.matchedInteractionCountByOperation.set(opId, 1);
      } else {
        let interactionCount =
          stats.matchedInteractionCountByOperation.get(opId)! + 1;
        stats.matchedInteractionCountByOperation.set(opId, interactionCount);
      }
    } else if (
      observation.kind === StatusObservationKind.InteractionUnmatchedPath
    ) {
      stats.interationsCount += 1;
      let opId = operationId(observation);

      if (!stats.unmatchedPaths.has(opId)) {
        const { path, method } = observation;
        stats.unmatchedPaths.set(opId, { path, method });
      }
    } else if (
      observation.kind === StatusObservationKind.InteractionUnmatchedMethod
    ) {
      stats.interationsCount += 1;
      let opId = operationId(observation);

      if (!stats.unmatchedMethods.has(opId)) {
        const { path, method } = observation;
        stats.unmatchedMethods.set(opId, { path, methods: [method] });
      } else {
        let methods = stats.unmatchedMethods.get(opId)!.methods;
        methods.push(observation.method);
      }
    }
  }

  console.log('');
  console.log('Matched Operations');
  console.log('==================');
  for (let matched of stats.matchedOperations.values()) {
    console.log(
      `${matched.method.toUpperCase().padEnd(6, ' ')} ${matched.path}`
    );
  }

  console.log('');
  console.log('Undocumented methods');
  console.log('====================');

  const orderedMethods = [...stats.unmatchedMethods.entries()]
    .sort((a, b) => {
      let termA = a[1].path + a[1].methods.join(','); // path first, methods second
      let termB = b[1].path + a[1].methods.join(',');

      return termA < termB ? -1 : termA > termB ? 1 : 0;
    })
    .map(([_key, op]) => op);
  for (let unmatched of orderedMethods) {
    for (let method of unmatched.methods) {
      console.log(`${method.toUpperCase().padEnd(6, ' ')}${unmatched.path}`);
    }
  }

  console.log('');
  console.log('Undocumented paths');
  console.log('==================');

  const orderedPaths = [...stats.unmatchedPaths.entries()]
    .sort((a, b) => {
      let termA = a[1].path + a[1].method; // path first, method second
      let termB = b[1].path + a[1].method;

      return termA < termB ? -1 : termA > termB ? 1 : 0;
    })
    .map(([_key, op]) => op);
  for (let unmatchedPath of orderedPaths) {
    console.log(
      `${unmatchedPath.method.toUpperCase().padEnd(6, ' ')}${
        unmatchedPath.path
      }`
    );
  }

  function operationId({ path, method }: { path: string; method: string }) {
    return `${method}${path}`;
  }
}
