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
      const { jsonLike: spec, sourcemap } = specReadResult.unwrap();

      let interactions = AT.merge(...sources);

      let observations = matchInteractions(spec, interactions);
    });

  return command;
}

export async function matchInteractions(
  spec: OpenAPIV3.Document,
  interactions: CapturedInteractions
): Promise<StatusObservations> {
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
          pathPattern: documentedInteraction.operation.pathPattern,
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
      pathPattern: string;
      method: string;
    }
  | {
      kind: StatusObservationKind.InteractionUnmatchedOperation;
      path: string;
      method: string;
    }
);

export interface StatusObservations extends AsyncIterable<StatusObservation> {}
