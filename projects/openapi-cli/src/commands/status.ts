import { Command } from 'commander';
import Path from 'path';
import * as fs from 'fs-extra';

import * as AT from '../lib/async-tools';
import { readDeferencedSpec } from '../specs';
import { DocumentedInteractions } from '../operations';
import {
  CapturedInteraction,
  CapturedInteractions,
  HarEntries,
} from '../captures';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';

export function statusCommand(): Command {
  const command = new Command('status');

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
        return command.error('OpenAPI specification file could not be found');
      }

      const options = command.opts();

      const sources: CapturedInteractions[] = [];

      if (options.har) {
        let absoluteHarPath = Path.resolve(options.har);
        if (!(await fs.pathExists(absoluteHarPath))) {
          return command.error('Har file could not be found at given path');
        }
        let harFile = fs.createReadStream(absoluteHarPath);
        let harEntries = HarEntries.fromReadable(harFile);
        sources.push(CapturedInteractions.fromHarEntries(harEntries));
      }

      if (sources.length < 1) {
        command.showHelpAfterError(true);
        return command.error('Choose a traffic source to match spec by');
      }

      const specReadResult = await readDeferencedSpec(absoluteSpecPath);
      if (specReadResult.err) {
        command.error(
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
  let currentInteraction: CapturedInteraction | null = null;

  const trackedInteractions = AT.tap<CapturedInteraction>((interaction) => {
    currentInteraction = interaction;
  })(interactions);

  const documentedInteractions =
    DocumentedInteractions.fromCapturedInteractions(trackedInteractions, spec);

  const observations = (async function* (): StatusObservations {
    for await (let documentedInteractionOption of documentedInteractions) {
      if (documentedInteractionOption.none) {
        yield {
          kind: StatusObservationKind.InteractionUnmatchedOperation,
          path: currentInteraction!.request.path,
          method: currentInteraction!.request.method,
        };
      } else {
        let documentedInteraction = documentedInteractionOption.unwrap();

        yield {
          kind: StatusObservationKind.InteractionMatchedOperation,
          capturedPath: documentedInteraction.interaction.request.path,
          path: documentedInteraction.operation.pathPattern,
          method: documentedInteraction.operation.method,
        };
      }
    }
  })();

  return observations;
}

export enum StatusObservationKind {
  InteractionMatchedOperation = 'interaction-matched-operation',
  InteractionUnmatchedOperation = 'interaction-unmatched-operation',
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
      kind: StatusObservationKind.InteractionUnmatchedOperation;
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
    unmatchedOperations: new Map<string, { path: string; method: string }>(),
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
      observation.kind === StatusObservationKind.InteractionUnmatchedOperation
    ) {
      stats.interationsCount += 1;
      let opId = operationId(observation);

      if (!stats.unmatchedOperations.has(opId)) {
        const { path, method } = observation;
        stats.unmatchedOperations.set(opId, { path, method });
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
  console.log('');
  console.log('Undocumented paths');
  console.log('==================');

  const orderedUnmatched = [...stats.unmatchedOperations.entries()]
    .sort((a, b) => {
      let termA = a[1].path + a[1].method; // path first, method second
      let termB = b[1].path + a[1].method;

      return termA < termB ? -1 : termA > termB ? 1 : 0;
    })
    .map(([_key, op]) => op);
  for (let unmatched of orderedUnmatched) {
    console.log(
      `${unmatched.method.toUpperCase().padEnd(6, ' ')}${unmatched.path}`
    );
  }

  function operationId({ path, method }: { path: string; method: string }) {
    return `${method}${path}`;
  }
}
