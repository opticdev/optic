import { cachingResolversAndRfcStateFromEventsAndAdditionalCommandsSeq } from '@useoptic/domain-utilities';
import { IHttpInteraction } from '@useoptic/domain-types';
// @ts-ignore
import sha1 from 'node-sha1';
import { CaptureInteractionIterator } from '../captures/avro/file-system/interaction-iterator';
import {
  JsonHelper,
  opticEngine,
  RfcCommandContext,
  ScalaJSHelpers,
} from '@useoptic/domain';
import fs from 'fs-extra';
import Bottleneck from 'bottleneck';
import path from 'path';
import { IValueAffordanceSerializationWithCounter } from './initial-types';

const LearnJsonTrailAffordances = opticEngine.com.useoptic.diff.interactions.interpreters.distribution_aware.LearnJsonTrailAffordances();

export interface ITrailValuesEmitterWorker {
  specFilePath: string;
  captureBaseDirectory: string;
  captureId: string;
  pathId: string;
  method: string;
  serializedDiff: string;
}

export function getTrailWorkerOutputPaths(values: {
  captureBaseDirectory: string;
  pathId: string;
  method: string;
  serializedDiff: string;
  captureId: string;
}) {
  const {
    captureBaseDirectory,
    serializedDiff,
    captureId,
    pathId,
    method,
  } = values;
  const base = path.join(
    captureBaseDirectory,
    captureId,
    'trail-values',
    // sha1(serializedDiff),
    pathId,
    method
  );
  const events = path.join(base, 'events.json');

  return {
    base,
    events,
  };
}

export class LearnTrailValueWorker {
  constructor(private config: ITrailValuesEmitterWorker) {}

  async run() {
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
      const [events] = await Promise.all([
        fs.readJson(this.config.specFilePath),
      ]);
      const batchId = 'bbb';
      const clientId = 'ccc'; //@TODO: should use real values
      const clientSessionId = 'sss'; //@TODO: should use real values
      const commandsContext = RfcCommandContext(
        clientId,
        clientSessionId,
        batchId
      );

      const learner = LearnJsonTrailAffordances.newLearner(
        this.config.pathId,
        this.config.method,
        this.config.serializedDiff
      );

      const {
        rfcState,
        resolvers,
      } = cachingResolversAndRfcStateFromEventsAndAdditionalCommandsSeq(
        events,
        commandsContext,
        opticEngine.CommandSerialization.fromJs([])
      );

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
      const batcher = new Bottleneck.Batcher({
        maxSize: 100,
        maxTime: 100,
      });
      const outputPaths = getTrailWorkerOutputPaths(this.config);

      const queue = new Bottleneck({
        maxConcurrent: 1,
      });

      function notifyParent(results: IValueAffordanceSerializationWithCounter) {
        const progress = {
          hasMoreInteractions,
          results,
        };
        if (process && process.send) {
          process.send({
            type: 'progress',
            data: progress,
          });
          if (!progress.hasMoreInteractions) {
            setTimeout(() => process.exit(0), 100);
          }
        } else {
          console.log(progress);
        }
      }

      async function flush() {
        const results: IValueAffordanceSerializationWithCounter = JsonHelper.toJs(
          learner.serialize()
        ) as IValueAffordanceSerializationWithCounter;
        notifyParent(results);
      }

      batcher.on('batch', () => {
        console.log('scheduling batch flushSuggestions');
        queue.schedule(() => {
          console.log('executing batch flushSuggestions');
          return flush().catch((e) => {
            notifyParentOfError(e);
          });
        });
      });

      await fs.ensureDir(outputPaths.base);
      await flush();

      for await (const item of interactionIterator) {
        hasMoreInteractions = item.hasMoreInteractions;
        if (!hasMoreInteractions) {
          // @GOTCHA item.interaction.value should not be present when hasMoreInteractions is false
          break;
        }
        if (!item.interaction) {
          continue;
        }
        const { batchId, index } = item.interaction.context;
        const deserializedInteraction = JsonHelper.fromInteraction(
          item.interaction.value
        );

        learner.learnBody(deserializedInteraction, `${batchId}-${index}`);

        batcher.add(null);
      }
      hasMoreInteractions = false;
      batcher.add(null);
    } catch (e) {
      notifyParentOfError(e);
    }
  }
}
