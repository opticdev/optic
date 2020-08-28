import { cachingResolversAndRfcStateFromEventsAndAdditionalCommandsSeq } from '@useoptic/domain-utilities';
import { parseIgnore } from '@useoptic/cli-config';
import { IHttpInteraction } from '@useoptic/domain-types';
import {
  CaptureInteractionIterator,
  LocalCaptureInteractionPointerConverter,
} from '../captures/avro/file-system/interaction-iterator';
import {
  DiffHelpers,
  JsonHelper,
  opticEngine,
  RfcCommandContext,
  ScalaJSHelpers,
} from '@useoptic/domain';
import fs from 'fs-extra';
import Bottleneck from 'bottleneck';
import path from 'path';
import lockfile from 'proper-lockfile';

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
  const stats = path.join(base, 'stats.json');
  const undocumentedUrls = path.join(base, 'undocumentedUrls.json');
  const events = path.join(base, 'events.json');
  const ignoreRequests = path.join(base, 'ignoreRequests.json');
  const filters = path.join(base, 'filters.json');
  const additionalCommands = path.join(base, 'additionalCommands.json');

  return {
    base,
    diffs,
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
      const [
        ignoreRequests,
        events,
        additionalCommands,
        filters,
      ] = await Promise.all([
        fs.readJson(this.config.ignoreRequestsFilePath),
        fs.readJson(this.config.specFilePath),
        fs.readJson(this.config.additionalCommandsFilePath),
        fs.readJson(this.config.filtersFilePath),
      ]);
      console.timeEnd('load inputs');
      console.time('build state');
      const batchId = 'bbb';
      const clientId = 'ccc'; //@TODO: should use real values
      const clientSessionId = 'sss'; //@TODO: should use real values
      const commandsContext = RfcCommandContext(
        clientId,
        clientSessionId,
        batchId
      );
      const {
        rfcState,
        resolvers,
      } = cachingResolversAndRfcStateFromEventsAndAdditionalCommandsSeq(
        events,
        commandsContext,
        opticEngine.CommandSerialization.fromJs(additionalCommands)
      );
      console.timeEnd('build state');
      const ignoredRequests = parseIgnore(ignoreRequests);

      function filterIgnoredRequests(interaction: IHttpInteraction) {
        return !ignoredRequests.shouldIgnore(
          interaction.request.method,
          interaction.request.path
        );
      }

      function filterByEndpoint(endpoint: { pathId: string; method: string }) {
        return function (interaction: IHttpInteraction) {
          const pathId = ScalaJSHelpers.getOrUndefined(
            undocumentedUrlHelpers.tryResolvePathId(interaction.request.path)
          );
          return (
            endpoint.method === interaction.request.method &&
            endpoint.pathId === pathId &&
            !ignoredRequests.shouldIgnore(
              interaction.request.method,
              interaction.request.path
            )
          );
        };
      }

      const interactionFilter =
        filters.length > 0
          ? filterByEndpoint(filters[0])
          : filterIgnoredRequests;
      const interactionIterator = CaptureInteractionIterator(
        {
          captureId: this.config.captureId,
          captureBaseDirectory: this.config.captureBaseDirectory,
        },
        interactionFilter
      );

      let diffs = DiffHelpers.emptyInteractionPointersGroupedByDiff();
      let undocumentedUrls = opticEngine.UndocumentedUrlHelpers.newCounter();
      const undocumentedUrlHelpers = new opticEngine.com.useoptic.diff.helpers.UndocumentedUrlIncrementalHelpers(
        rfcState
      );
      let hasMoreInteractions = true;
      let diffedInteractionsCounter = BigInt(0);
      let skippedInteractionsCounter = BigInt(0);
      const batcher = new Bottleneck.Batcher({
        maxSize: 100,
        maxTime: 100,
      });
      const diffOutputPaths = getDiffOutputPaths(this.config);

      const queue = new Bottleneck({
        maxConcurrent: 1,
      });

      function notifyParent() {
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
      }

      async function flush() {
        const c = diffedInteractionsCounter.toString();

        console.time(`flushing ${c}`);
        const outputDiff = safeWriteJson(
          diffOutputPaths.diffs,
          opticEngine.DiffWithPointersJsonSerializer.toJs(diffs)
        );
        const outputCount = safeWriteJson(
          diffOutputPaths.undocumentedUrls,
          opticEngine.UrlCounterJsonSerializer.toFriendlyJs(undocumentedUrls)
        );
        const outputStats = safeWriteJson(diffOutputPaths.stats, {
          diffedInteractionsCounter: diffedInteractionsCounter.toString(),
          skippedInteractionsCounter: skippedInteractionsCounter.toString(),
          isDone: !hasMoreInteractions,
        });

        await Promise.all([outputDiff, outputCount, outputStats]);

        notifyParent();

        console.timeEnd(`flushing ${c}`);
      }

      batcher.on('batch', () => {
        console.log('scheduling batch flush');
        queue.schedule(() => {
          console.log('executing batch flush');
          return flush().catch((e) => {
            notifyParentOfError(e);
          });
        });
      });

      const interactionPointerConverter = new LocalCaptureInteractionPointerConverter(
        {
          captureBaseDirectory: this.config.captureBaseDirectory,
          captureId: this.config.captureId,
        }
      );

      await fs.ensureDir(diffOutputPaths.base);
      await flush();

      for await (const item of interactionIterator) {
        skippedInteractionsCounter = item.skippedInteractionsCounter;
        diffedInteractionsCounter = item.diffedInteractionsCounter;
        hasMoreInteractions = item.hasMoreInteractions;
        if (!hasMoreInteractions) {
          // @GOTCHA item.interaction.value should not be present when hasMoreInteractions is false
          break;
        }
        if (!item.interaction) {
          continue;
        }
        const { batchId, index } = item.interaction.context;
        console.time(`serdes ${batchId} ${index}`);
        const deserializedInteraction = JsonHelper.fromInteraction(
          item.interaction.value
        );
        console.timeEnd(`serdes ${batchId} ${index}`);
        console.time(`diff ${batchId} ${index}`);
        diffs = DiffHelpers.groupInteractionPointerByDiffs(
          resolvers,
          rfcState,
          deserializedInteraction,
          interactionPointerConverter.toPointer(item.interaction.value, {
            interactionIndex: index,
            batchId,
          }),
          diffs
        );
        console.timeEnd(`diff ${batchId} ${index}`);
        console.time(`count ${batchId} ${index}`);
        undocumentedUrls = undocumentedUrlHelpers.countUndocumentedUrls(
          deserializedInteraction,
          undocumentedUrls
        );
        console.timeEnd(`count ${batchId} ${index}`);
        batcher.add(null);
      }
      hasMoreInteractions = false;
      batcher.add(null);
    } catch (e) {
      notifyParentOfError(e);
    }
  }
}
