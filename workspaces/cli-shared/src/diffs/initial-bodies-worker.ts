import { cachingResolversAndRfcStateFromEventsAndAdditionalCommandsSeq } from '@useoptic/domain-utilities';
import { parseIgnore } from '@useoptic/cli-config';
import { IHttpInteraction } from '@useoptic/domain-types';
import {
  CaptureInteractionIterator,
  LocalCaptureInteractionPointerConverter,
} from '../captures/avro/file-system/interaction-iterator';
import {
  DiffHelpers,
  getOrUndefined,
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
import { ILearnedBodies } from './initial-types';

const LearnAPIHelper = opticEngine.com.useoptic.diff.interactions.interpreters.LearnAPIHelper();

export interface IInitialBodiesProjectionEmitterConfig {
  specFilePath: string;
  captureBaseDirectory: string;
  captureId: string;
  pathId: string;
  method: string;
}

export function getInitialBodiesOutputPaths(values: {
  captureBaseDirectory: string;
  pathId: string;
  method: string;
  captureId: string;
}) {
  const { captureBaseDirectory, captureId, pathId, method } = values;
  const base = path.join(
    captureBaseDirectory,
    captureId,
    'initial-bodies',
    pathId,
    method
  );
  const events = path.join(base, 'events.json');
  const initialBodies = path.join(base, 'bodies.json');

  return {
    base,
    events,
    initialBodies,
  };
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
      const [events] = await Promise.all([
        fs.readJson(this.config.specFilePath),
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
        opticEngine.CommandSerialization.fromJs([])
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
      const batcher = new Bottleneck.Batcher({
        maxSize: 100,
        maxTime: 100,
      });
      const outputPaths = getInitialBodiesOutputPaths(this.config);

      const queue = new Bottleneck({
        maxConcurrent: 1,
      });

      function notifyParent(results: ILearnedBodies) {
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

      const { pathId, method } = this.config;

      const shapeBuilderMap = LearnAPIHelper.newShapeBuilderMap(pathId, method);

      async function flush() {
        const results: ILearnedBodies = {
          pathId,
          method,
          requests: mapScala(shapeBuilderMap.requestRegions)(
            (request: any) => ({
              contentType: getOrUndefined(request.contentType),
              commands: opticEngine.CommandSerialization.toJs(request.commands),
              rootShapeId: request.rootShapeId,
            })
          ),
          responses: mapScala(shapeBuilderMap.responseRegions)(
            (response: any) => ({
              contentType: getOrUndefined(response.contentType),
              statusCode: response.statusCode,
              commands: opticEngine.CommandSerialization.toJs(
                response.commands
              ),
              rootShapeId: response.rootShapeId,
            })
          ),
        };
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
        console.time(`serdes ${batchId} ${index}`);
        const deserializedInteraction = JsonHelper.fromInteraction(
          item.interaction.value
        );

        LearnAPIHelper.learnBody(deserializedInteraction, shapeBuilderMap);

        batcher.add(null);
      }
      hasMoreInteractions = false;
      batcher.add(null);
    } catch (e) {
      notifyParentOfError(e);
    }
  }
}
