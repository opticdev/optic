import { parseIgnore } from '@useoptic/cli-config';
import { IHttpInteraction } from '@useoptic/domain-types';
import { spawn as spawnDiffEngine } from '@useoptic/diff-engine';
import {
  CaptureInteractionIterator,
  LocalCaptureInteractionPointerConverter,
} from '../captures/avro/file-system/interaction-iterator';
import fs from 'fs-extra';
import path from 'path';
import lockfile from 'proper-lockfile';
import _throttle from 'lodash.throttle';
import Chain, { chain } from 'stream-chain';
import { fork } from 'stream-fork';
import { Readable, Writable } from 'stream';
import { stringer as JSONLStringer } from 'stream-json/jsonl/Stringer';

export interface IDiffProjectionEmitterConfig {
  diffId: string;
  specFilePath: string;
  ignoreRequestsFilePath: string;
  filtersFilePath: string;
  additionalCommandsFilePath: string;
  captureBaseDirectory: string;
  captureId: string;
}

export function getDiffOutputPaths(values: {
  captureBaseDirectory: string;
  captureId: string;
  diffId: string;
}) {
  const { captureBaseDirectory, captureId, diffId } = values;
  const base = path.join(captureBaseDirectory, captureId, 'diffs', diffId);
  const diffs = path.join(base, 'diffs.json');
  const diffsStream = path.join(base, 'diffs.jsonl');
  const stats = path.join(base, 'stats.json');
  const undocumentedUrls = path.join(base, 'undocumentedUrls.json');
  const events = path.join(base, 'events.json');
  const ignoreRequests = path.join(base, 'ignoreRequests.json');
  const filters = path.join(base, 'filters.json');
  const additionalCommands = path.join(base, 'additionalCommands.json');

  return {
    base,
    diffs,
    diffsStream,
    stats,
    undocumentedUrls,
    events,
    ignoreRequests,
    filters,
    additionalCommands,
  };
}

async function safeWriteJson(filePath: string, contents: any) {
  await fs.ensureFile(filePath);
  await lockfile.lock(filePath);
  await fs.writeJson(filePath, contents);
  await lockfile.unlock(filePath);
}

export class DiffWorkerRust {
  constructor(private config: IDiffProjectionEmitterConfig) {}

  async run() {
    console.log('running');

    let hasMoreInteractions = true;
    let diffedInteractionsCounter = BigInt(0);
    let skippedInteractionsCounter = BigInt(0);

    const reportProgress = _throttle(function notifyParent() {
      const progress = {
        diffedInteractionsCounter: diffedInteractionsCounter.toString(),
        skippedInteractionsCounter: skippedInteractionsCounter.toString(),
        hasMoreInteractions,
      };
      if (process && process.send) {
        process.send({
          type: 'progress',
          data: progress,
        });
      } else {
        console.log(progress);
      }
    }, 1000);

    function notifyParentOfError(e: Error) {
      if (process && process.send) {
        process.send({
          type: 'error',
          data: {
            message: e.message,
          },
        });
      } else {
        console.error(e);
      }
    }

    try {
      console.time('load inputs');
      const [ignoreRequests, filters] = await Promise.all([
        fs.readJson(this.config.ignoreRequestsFilePath),
        fs.readJson(this.config.filtersFilePath),
      ]);
      console.timeEnd('load inputs');
      const ignoredRequests = parseIgnore(ignoreRequests);

      function filterIgnoredRequests(interaction: IHttpInteraction) {
        return !ignoredRequests.shouldIgnore(
          interaction.request.method,
          interaction.request.path
        );
      }

      // function filterByEndpoint(endpoint: { pathId: string; method: string }) {
      //   return function (interaction: IHttpInteraction) {
      //     const pathId = ScalaJSHelpers.getOrUndefined(
      //       undocumentedUrlHelpers.tryResolvePathId(interaction.request.path)
      //     );
      //     return (
      //       endpoint.method === interaction.request.method &&
      //       endpoint.pathId === pathId &&
      //       !ignoredRequests.shouldIgnore(
      //         interaction.request.method,
      //         interaction.request.path
      //       )
      //     );
      //   };
      // }

      // const interactionFilter =
      //   filters.length > 0
      //     ? filterByEndpoint(filters[0])
      //     : filterIgnoredRequests;
      //
      // TODO: re-enable or reconsider filtering by endpoints, disabled now as we're
      // trying to not read the spec with Scala
      const interactionFilter = filterIgnoredRequests;
      const interactionIterator = CaptureInteractionIterator(
        {
          captureId: this.config.captureId,
          captureBaseDirectory: this.config.captureBaseDirectory,
        },
        interactionFilter
      );

      const diffOutputPaths = getDiffOutputPaths(this.config);

      const interactionPointerConverter = new LocalCaptureInteractionPointerConverter(
        {
          captureBaseDirectory: this.config.captureBaseDirectory,
          captureId: this.config.captureId,
        }
      );

      await fs.ensureDir(diffOutputPaths.base);

      const interactionsStream = chain([
        Readable.from(interactionIterator, {
          highWaterMark: 1,
          objectMode: true,
        }),
        (item) => {
          skippedInteractionsCounter = item.skippedInteractionsCounter;
          diffedInteractionsCounter = item.diffedInteractionsCounter;
          hasMoreInteractions = item.hasMoreInteractions;
          if (!item.hasMoreInteractions) {
            return Chain.final();
          }

          if (!item.interaction) return;

          const { batchId, index } = item.interaction.context;
          let interactionPointer = interactionPointerConverter.toPointer(
            item.interaction.value,
            {
              interactionIndex: index,
              batchId,
            }
          );

          reportProgress();

          return [[item.interaction.value, [interactionPointer]]];
        },
        JSONLStringer(),
      ]);
      const diffsSink = fs.createWriteStream(diffOutputPaths.diffsStream, {
        highWaterMark: 32,
      });
      diffsSink.once('finish', () => {
        hasMoreInteractions = false;
        reportProgress();
        reportProgress.flush();
      });

      let diffEngine = spawnDiffEngine({ specPath: diffOutputPaths.events });
      // let processStreams: Writable[] = [diffEngine.input];
      // if (process.env.OPTIC_DEVELOPMENT === 'yes') {
      //   processStreams.push(
      //     fs.createWriteStream(
      //       path.join(diffOutputPaths.base, 'interactions.jsonl')
      //     )
      //   );
      // }

      // consume diffEngine's stdout:
      diffEngine.output.pipe(diffsSink);

      // consume diffEngine's stderr:
      const diffEngineLogFilePath = path.join(
        diffOutputPaths.base,
        'diff-engine-output.log'
      );
      const diffEngineLog = fs.createWriteStream(diffEngineLogFilePath, {
        highWaterMark: 32,
      });
      diffEngine.error.pipe(diffEngineLog);

      // provide diffEngine's stdin:
      interactionsStream.pipe(diffEngine.input);

      // write initial output
      await Promise.all([
        safeWriteJson(diffOutputPaths.stats, {
          diffedInteractionsCounter: diffedInteractionsCounter.toString(),
          skippedInteractionsCounter: skippedInteractionsCounter.toString(),
          isDone: !hasMoreInteractions,
        }),
        safeWriteJson(diffOutputPaths.undocumentedUrls, []),
      ]);

      // initial notification to indicate we've started without issue
      reportProgress();
    } catch (e) {
      console.error(e);
      reportProgress.cancel();
      notifyParentOfError(e);
    }
  }
}
