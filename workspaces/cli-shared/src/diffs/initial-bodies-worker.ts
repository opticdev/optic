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
  mapScala,
  opticEngine,
  RfcCommandContext,
  ScalaJSHelpers,
} from '@useoptic/domain';
import fs from 'fs-extra';
import Bottleneck from 'bottleneck';
import path from 'path';
import lockfile from 'proper-lockfile';

const LearnAPIHelper = opticEngine.com.useoptic.diff.interactions.interpreters.LearnAPIHelper();

export interface IInitialBodiesProjectionEmitterConfig {
  specFilePath: string;
  additionalCommandsFilePath: string;
  captureBaseDirectory: string;
  captureId: string;
  pathId: string;
  method: string;
}

export function getInitialBodiesOutputPaths(values: {
  captureBaseDirectory: string;
  captureId: string;
}) {
  const { captureBaseDirectory, captureId } = values;
  const base = path.join(
    captureBaseDirectory,
    captureId,
    'initial-bodies',
    captureId
  );
  const events = path.join(base, 'events.json');
  const additionalCommands = path.join(base, 'additionalCommands.json');

  return {
    base,
    events,
    additionalCommands,
  };
}

async function safeWriteJson(filePath: string, contents: any) {
  await fs.ensureFile(filePath);
  await lockfile.lock(filePath);
  await fs.writeJson(filePath, contents);
  await lockfile.unlock(filePath);
}

export class InitialBodiesWorker {
  constructor(private config: IInitialBodiesProjectionEmitterConfig) {}

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
      const [events, additionalCommands] = await Promise.all([
        fs.readJson(this.config.specFilePath),
        fs.readJson(this.config.additionalCommandsFilePath),
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

      const undocumentedUrlHelpers = new opticEngine.com.useoptic.diff.helpers.UndocumentedUrlIncrementalHelpers(
        rfcState
      );

      function filterByEndpoint(endpoint: { pathId: string; method: string }) {
        return function (interaction: IHttpInteraction) {
          const pathId = ScalaJSHelpers.getOrUndefined(
            undocumentedUrlHelpers.tryResolvePathId(interaction.request.path)
          );
          return (
            endpoint.method === interaction.request.method &&
            endpoint.pathId === pathId
          );
        };
      }

      const interactionFilter = filterByEndpoint({
        pathId: this.config.pathId,
        method: this.config.method,
      });
      const interactionIterator = CaptureInteractionIterator(
        {
          captureId: this.config.captureId,
          captureBaseDirectory: this.config.captureBaseDirectory,
        },
        interactionFilter
      );

      let hasMoreInteractions = true;
      let diffedInteractionsCounter = BigInt(0);
      let skippedInteractionsCounter = BigInt(0);
      const batcher = new Bottleneck.Batcher({
        maxSize: 100,
        maxTime: 100,
      });
      const diffOutputPaths = getInitialBodiesOutputPaths(this.config);

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
        // const outputDiff = safeWriteJson(
        //   diffOutputPaths.diffs,
        //   opticEngine.DiffWithPointersJsonSerializer.toJs(diffs)
        // );
        // const outputCount = safeWriteJson(
        //   diffOutputPaths.undocumentedUrls,
        //   opticEngine.UrlCounterJsonSerializer.toFriendlyJs(undocumentedUrls)
        // );
        // const outputStats = safeWriteJson(diffOutputPaths.stats, {
        //   diffedInteractionsCounter: diffedInteractionsCounter.toString(),
        //   skippedInteractionsCounter: skippedInteractionsCounter.toString(),
        //   isDone: !hasMoreInteractions,
        // });
        //
        // await Promise.all([outputDiff, outputCount, outputStats]);

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

      const shapeBuilderMap = LearnAPIHelper.newShapeBuilderMap(
        this.config.pathId,
        this.config.method
      );

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

        LearnAPIHelper.learnBody(deserializedInteraction, shapeBuilderMap)

          // console.timeEnd(`serdes ${batchId} ${index}`);
          // console.time(`diff ${batchId} ${index}`);
          // diffs = DiffHelpers.groupInteractionPointerByDiffs(
          //   resolvers,
          //   rfcState,
          //   deserializedInteraction,
          //   interactionPointerConverter.toPointer(item.interaction.value, {
          //     interactionIndex: index,
          //     batchId,
          //   }),
          //   diffs
          // );
          // console.timeEnd(`diff ${batchId} ${index}`);
          // console.time(`count ${batchId} ${index}`);
          // undocumentedUrls = undocumentedUrlHelpers.countUndocumentedUrls(
          //   deserializedInteraction,
          //   undocumentedUrls
          // );
          // console.timeEnd(`count ${batchId} ${index}`);
          .batcher.add(null);
      }
      hasMoreInteractions = false;
      batcher.add(null);
    } catch (e) {
      notifyParentOfError(e);
    }
  }
}
