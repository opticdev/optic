import { Command } from 'commander';
import Path from 'path';
import * as fs from 'fs-extra';
import Spinnies from 'spinnies';
import readline from 'readline';

import { tap, forkable, merge, Subject } from '../lib/async-tools';
import {
  SpecFacts,
  SpecFile,
  SpecFileOperation,
  OpenAPIV3,
  readDeferencedSpec,
} from '../specs';
import { DocumentedBodies } from '../shapes';
import {
  SpecFileOperations,
  SpecPatch,
  SpecPatches,
  SpecFiles,
  SpecFilesAsync,
  SpecFilesSourcemap,
  BodyExampleFact,
  ComponentSchemaExampleFact,
} from '../specs';
import { Ok, Err, Result } from 'ts-results';

import { flushEvents, trackEvent } from '../segment';
import {
  CapturedInteraction,
  CapturedInteractions,
  HarEntries,
  ProxyInteractions,
} from '../captures';
import {
  DocumentedInteraction,
  DocumentedInteractions,
  Operation,
} from '../operations';
import { AbortController } from 'node-abort-controller';

export function updateCommand(): Command {
  const command = new Command('update');

  command
    .usage('openapi.yml')
    .argument('<openapi-file>', 'an OpenAPI spec file to update')
    .description(
      'update an OpenAPI specification from examples or observed traffic'
    )
    .action(async (specPath) => {
      const updateResult = await updateByExample(specPath);

      if (updateResult.err) {
        return command.error(updateResult.val);
      }

      let { stats, results: updatedSpecFiles } = updateResult.val;

      for await (let writtenFilePath of SpecFiles.writeFiles(
        updatedSpecFiles
      )) {
        console.log(`Updated ${writtenFilePath}`);
      }

      console.log(
        `✅ Applied ${stats.patchesCount} patch${
          stats.patchesCount === 1 ? '' : 'es'
        } to ${stats.updatedFilesCount} file${
          stats.updatedFilesCount === 1 ? '' : 's'
        } generated from ${stats.examplesCount} example${
          stats.examplesCount === 1 ? '' : 's'
        }`
      );

      trackEvent(
        'openapi_cli.spec_updated_by_example',
        'openapi_cli', // TODO: determine more useful userId
        {
          examplesCount: stats.examplesCount,
          externalExamplesCount: stats.externalExamplesCount,
          patchesCount: stats.patchesCount,
          updatedFilesCount: stats.updatedFilesCount,
          filesWithOverwrittenYamlCommentsCount:
            stats.filesWithOverwrittenYamlComments.size,
        }
      );

      try {
        await flushEvents();
      } catch (err) {
        console.warn('Could not flush usage analytics (non-critical)');
      }
    })
    .addCommand(updateByTrafficCommand());

  return command;
}

export function updateByTrafficCommand(): Command {
  const command = new Command('traffic');

  command
    .usage('openapi.yml')
    .argument('<openapi-file>', 'an OpenAPI spec file to update')
    .description('update an OpenAPI specification from observed traffic')
    .option('--har <har-file>', 'path to HttpArchive file (v1.2, v1.3)')
    .option(
      '--proxy <target-url>',
      'accept traffic over a proxy targeting the actual service'
    )
    .action(async (specPath) => {
      const absoluteSpecPath = Path.resolve(specPath);
      if (!(await fs.pathExists(absoluteSpecPath))) {
        return command.error('OpenAPI specification file could not be found');
      }

      const options = command.opts();

      let sourcesController = new AbortController();
      const sources: CapturedInteractions[] = [];
      let interactiveCapture = false;

      if (options.har) {
        let absoluteHarPath = Path.resolve(options.har);
        if (!(await fs.pathExists(absoluteHarPath))) {
          return command.error('Har file could not be found at given path');
        }
        let harFile = fs.createReadStream(absoluteHarPath);
        let harEntries = HarEntries.fromReadable(harFile);
        sources.push(CapturedInteractions.fromHarEntries(harEntries));
      }

      if (options.proxy) {
        if (!process.stdin.isTTY) {
          return command.error(
            'Can only use --proxy when in an interactive terminal session'
          );
        }

        let [proxyInteractions, proxyUrl] = await ProxyInteractions.create(
          options.proxy,
          sourcesController.signal
        );
        sources.push(
          CapturedInteractions.fromProxyInteractions(proxyInteractions)
        );
        console.log(
          `Proxy created. Redirect traffic you want to capture to ${proxyUrl}`
        );
        interactiveCapture = true;
      }

      if (sources.length < 1) {
        command.showHelpAfterError(true);
        return command.error(
          'Choose a capture method to update spec by traffic'
        );
      }

      const { jsonLike: spec, sourcemap } = await readDeferencedSpec(
        absoluteSpecPath
      );

      let interactions = merge(...sources);

      let updateResult = await updateByInteractions(spec, interactions);
      if (updateResult.err) {
        return command.error(updateResult.val);
      }

      let { results: updatePatches, observations: updateObservations } =
        updateResult.unwrap();

      let { results: updatedSpecFiles, observations: fileObservations } =
        updateSpecFiles(updatePatches, sourcemap);

      let observations = merge(updateObservations, fileObservations);

      const renderingStats = renderUpdateStats(observations);

      const handleUserSignals = (async function () {
        if (interactiveCapture && process.stdin.isTTY) {
          console.log('Press Enter to finish capturing traffic');
          // wait for an empty new line on input, which should indicate hitting Enter / Return
          let lines = readline.createInterface({ input: process.stdin });
          for await (let line of lines) {
            if (line.trim().length === 0) {
              lines.close();
              readline.moveCursor(process.stdin, 0, -1);
              readline.clearLine(process.stdin, 1);
              sourcesController.abort();
            }
          }
        }
      })();

      const writingSpecFiles = (async function () {
        for await (let writtenFilePath of SpecFiles.writeFiles(
          updatedSpecFiles
        )) {
          console.log(`Updated ${writtenFilePath}`);
        }
      })();
      await Promise.all([handleUserSignals, writingSpecFiles]);

      await renderingStats;
    });

  return command;
}

export async function updateByExample(specPath: string): Promise<
  Result<
    {
      stats: {
        examplesCount: number;
        externalExamplesCount: number;
        patchesCount: number;
        updatedFilesCount: number;
        filesWithOverwrittenYamlComments: Set<string>;
      };
      results: SpecFilesAsync;
    },
    string
  >
> {
  const absoluteSpecPath = Path.resolve(specPath);
  if (!(await fs.pathExists(absoluteSpecPath))) {
    return Err('OpenAPI specification file could not be found');
  }

  const { jsonLike: spec, sourcemap } = await readDeferencedSpec(
    absoluteSpecPath
  );
  const specFiles = [...SpecFiles.fromSourceMap(sourcemap)];

  const stats = {
    examplesCount: 0,
    externalExamplesCount: 0,
    patchesCount: 0,
    updatedFilesCount: 0,
    filesWithOverwrittenYamlComments: new Set<string>(),
  };
  const observers = {
    observeBodyExamples: tap<BodyExampleFact>((exampleFact) => {
      stats.examplesCount++;
      if (exampleFact.value.externalValue) stats.externalExamplesCount++;
    }),
    observeComponentSchemaExamples: tap<ComponentSchemaExampleFact>(
      (_exampleFact) => {
        stats.examplesCount++;
      }
    ),
    observePatches: tap<SpecPatch>((_patch) => {
      stats.patchesCount++;
    }),
    observeFileOperations: tap<SpecFileOperation>((op) => {
      const file = specFiles.find(({ path }) => path === op.filePath);
      if (file && SpecFile.containsYamlComments(file))
        stats.filesWithOverwrittenYamlComments.add(file.path);
    }),
    observeUpdatedFiles: tap<SpecFile>((_file) => {
      stats.updatedFilesCount++;
    }),
  };

  const facts = forkable(SpecFacts.fromOpenAPISpec(spec));
  const bodyExampleFacts = observers.observeBodyExamples(
    SpecFacts.bodyExamples(facts.fork())
  );
  const componentExampleFacts = observers.observeComponentSchemaExamples(
    SpecFacts.componentSchemaExamples(facts.fork())
  );
  facts.start();

  const exampleBodies = merge(
    DocumentedBodies.fromBodyExampleFacts(bodyExampleFacts, spec),
    DocumentedBodies.fromComponentSchemaExampleFacts(
      componentExampleFacts,
      spec
    )
  );

  // const capturedBodies = // combined from matched bodies and new bodies generated from patches?

  const bodyPatches = SpecPatches.fromDocumentedBodies(exampleBodies);

  // additions only, so we only safely extend the spec
  const specAdditions = observers.observePatches(
    SpecPatches.additions(bodyPatches)
  );

  const fileOperations = observers.observeFileOperations(
    SpecFileOperations.fromSpecPatches(specAdditions, sourcemap)
  );

  const updatedSpecFiles = observers.observeUpdatedFiles(
    SpecFiles.patch(specFiles, fileOperations)
  );

  return Ok({
    stats,
    results: updatedSpecFiles,
  });
}

export async function updateByInteractions(
  spec: OpenAPIV3.Document,
  interactions: CapturedInteractions
): Promise<
  Result<{ results: SpecPatches; observations: UpdateObservations }, string>
> {
  const updatingSpec = new Subject<OpenAPIV3.Document>();
  const specUpdates = updatingSpec.iterator;

  const observing = new Subject<UpdateObservation>();
  const observers = {
    capturedInteraction(interaction: CapturedInteraction) {
      observing.onNext({
        kind: UpdateObservationKind.InteractionCaptured,
        path: interaction.request.path,
        method: interaction.request.method,
      });
    },
    documentedInteraction(interaction: DocumentedInteraction) {
      observing.onNext({
        kind: UpdateObservationKind.InteractionMatchedOperation,
        pathPattern: interaction.operation.pathPattern,
        method: interaction.operation.method,
      });
    },
    interactionPatch(interaction: DocumentedInteraction, _patch: SpecPatch) {
      observing.onNext({
        kind: UpdateObservationKind.InteractionPatchGenerated,
        pathPattern: interaction.operation.pathPattern,
        method: interaction.operation.method,
      });
    },
  };

  const documentedInteractions =
    DocumentedInteractions.fromCapturedInteractions(
      tap(observers.capturedInteraction)(interactions),
      spec,
      specUpdates
    );

  const specPatches = (async function* (): SpecPatches {
    let patchedSpec = spec;
    for await (let documentedInteraction of documentedInteractions) {
      observers.documentedInteraction(documentedInteraction);

      let patches = SpecPatches.fromDocumentedInteraction(
        documentedInteraction,
        patchedSpec
      );

      for await (let patch of patches) {
        patchedSpec = SpecPatch.applyPatch(patch, patchedSpec);
        yield patch;
        observers.interactionPatch(documentedInteraction, patch);
      }

      updatingSpec.onNext(patchedSpec);
    }

    updatingSpec.onCompleted();
  })();

  // additions only, so we only safely extend the spec
  const specAdditions = SpecPatches.additions(specPatches);

  // making sure we end observations once we're done generating patches
  const observedResults = (async function* (): SpecPatches {
    yield* specAdditions;
    observing.onCompleted();
  })();

  return Ok({ results: observedResults, observations: observing.iterator });
}

function updateSpecFiles(
  updatePatches: SpecPatches,
  sourcemap: SpecFilesSourcemap
): {
  results: SpecFilesAsync;
  observations: UpdateObservations;
} {
  const stats = {
    filesWithOverwrittenYamlComments: new Set<string>(),
  };
  const observing = new Subject<UpdateObservation>();
  const observers = {
    fileOperation(op: SpecFileOperation) {
      const file = specFiles.find(({ path }) => path === op.filePath);
      if (file && SpecFile.containsYamlComments(file))
        stats.filesWithOverwrittenYamlComments.add(file.path);
    },
    updatedFile(file: SpecFile) {
      observing.onNext({
        kind: UpdateObservationKind.SpecFileUpdated,
        path: file.path,
        overwrittenComments: stats.filesWithOverwrittenYamlComments.has(
          file.path
        ),
      });
    },
  };

  const specFiles = [...SpecFiles.fromSourceMap(sourcemap)];

  const fileOperations = tap(observers.fileOperation)(
    SpecFileOperations.fromSpecPatches(updatePatches, sourcemap)
  );

  const updatedSpecFiles = tap(observers.updatedFile)(
    SpecFiles.patch(specFiles, fileOperations)
  );

  // making sure we end observations once we're done generating patches
  const observedResults = (async function* (): SpecFilesAsync {
    yield* updatedSpecFiles;
    observing.onCompleted();
  })();

  return {
    results: observedResults,
    observations: observing.iterator,
  };
}

export enum UpdateObservationKind {
  InteractionCaptured = 'interaction-captured',
  InteractionMatchedOperation = 'interaction-matched-operation',
  InteractionPatchGenerated = 'interaction-patch-generated',
  SpecFileUpdated = 'spec-file-updated',
}

export type UpdateObservation = {
  kind: UpdateObservationKind;
} & (
  | {
      kind: UpdateObservationKind.InteractionMatchedOperation;
      pathPattern: string;
      method: string;
    }
  | {
      kind: UpdateObservationKind.InteractionPatchGenerated;
      pathPattern: string;
      method: string;
    }
  | {
      kind: UpdateObservationKind.InteractionCaptured;
      path: string;
      method: string;
    }
  | {
      kind: UpdateObservationKind.SpecFileUpdated;
      path: string;
      overwrittenComments: boolean;
    }
);

export interface UpdateObservations extends AsyncIterable<UpdateObservation> {}

async function renderUpdateStats(updateObservations: UpdateObservations) {
  type ObservedOperation = { pathPattern: string; method: string };
  let stats = {
    matchedOperations: new Map<string, ObservedOperation>(),
    patchCountByOperation: new Map<string, number>(),
  };

  const progressIndicators = new Spinnies({
    succeedColor: 'white',
  });

  for await (let observation of updateObservations) {
    if (
      observation.kind === UpdateObservationKind.InteractionMatchedOperation
    ) {
      let { method, pathPattern } = observation;
      let key = `${method}-${pathPattern}`;
      if (!stats.matchedOperations.has(key)) {
        progressIndicators.add(key, {
          text: `${method.toUpperCase()} ${pathPattern} - Matched first interaction`,
        });
      }
      stats.matchedOperations.set(key, { method, pathPattern });
    } else if (
      observation.kind === UpdateObservationKind.InteractionPatchGenerated
    ) {
      let { method, pathPattern } = observation;
      let key = `${method}-${pathPattern}`;
      let count = (stats.patchCountByOperation.get(key) || 0) + 1;
      progressIndicators.update(key, {
        text: `${method.toUpperCase()} ${pathPattern} - ${count} patch${
          count > 1 ? 'es' : ''
        } applied`,
      });
      stats.patchCountByOperation.set(key, count);
    }
  }

  if (stats.matchedOperations.size < 1) {
    console.log(`No matching operations found`);
  }

  for (let [
    key,
    { method, pathPattern },
  ] of stats.matchedOperations.entries()) {
    const patchCount = stats.patchCountByOperation.get(key);

    if (patchCount && patchCount > 0) {
      progressIndicators.succeed(key, {
        text: `${method.toUpperCase()} ${pathPattern} - ${patchCount} patch${
          patchCount > 1 ? 'es' : ''
        } applied`,
      });
    } else {
      progressIndicators.succeed(key, {
        text: `${method.toUpperCase()} ${pathPattern} - no patches necessary`,
      });
    }
  }
}
