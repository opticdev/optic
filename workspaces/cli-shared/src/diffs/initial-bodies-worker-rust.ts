import { IHttpInteraction as HttpInteraction } from '@useoptic/domain-types';
import { CaptureInteractionIterator } from '../captures/avro/file-system/interaction-iterator';
import { cachingResolversAndRfcStateFromEventsAndAdditionalCommandsSeq } from '@useoptic/domain-utilities';
import {
  opticEngine,
  RfcCommandContext,
  ScalaJSHelpers,
} from '@useoptic/domain';
import fs from 'fs-extra';
import {
  IInitialBodiesProjectionEmitterConfig as WorkerConfig,
  getInitialBodiesOutputPaths,
} from './initial-bodies-worker';
import { learnUndocumentedBodies } from '@useoptic/diff-engine';
import { Streams } from '@useoptic/diff-engine-wasm';
import { LearnedBodies } from '@useoptic/diff-engine-wasm/lib/streams/learning-results';

export interface InitialBodiesWorkerConfig {
  pathId: string;
  method: string;
  captureId: string;
  events: any;
  captureBaseDirectory: string;
}

export { LearnedBodies };

export class InitialBodiesWorkerRust {
  constructor(private config: InitialBodiesWorkerConfig) {}

  async run(): Promise<LearnedBodies> {
    const outputPaths = getInitialBodiesOutputPaths(this.config);
    await fs.ensureDir(outputPaths.base);
    await fs.writeJson(outputPaths.events, this.config.events);

    const interactionFilter = await createEndpointFilter(
      this.config.events,
      this.config.pathId,
      this.config.method
    );

    const interactionIterator = CaptureInteractionIterator(
      {
        captureId: this.config.captureId,
        captureBaseDirectory: this.config.captureBaseDirectory,
      },
      interactionFilter
    );

    const interactions = (async function* (interactionItems) {
      for await (let item of interactionItems) {
        if (!item.hasMoreInteractions) break;
        if (!item.interaction) continue;

        yield item.interaction.value;
      }
    })(interactionIterator);

    let learningResults = Streams.LearningResults.fromJSONL(
      learnUndocumentedBodies(interactions, {
        specPath: outputPaths.events,
      })
    );

    let result = await learningResults.next(); // we should get result and only one, since we're filtering per endpoint
    return result.value;
  }
}

interface EndpointInteractionFilter {
  (interaction: HttpInteraction): boolean;
}

// TODO: implement this with WASM domain instead of ScalaJS
async function createEndpointFilter(
  events: any[],
  pathId: string,
  method: string
): Promise<EndpointInteractionFilter> {
  console.time('load inputs');
  console.timeEnd('load inputs');
  console.time('build state');
  const batchId = 'bbb';
  const clientId = 'ccc'; //@TODO: should use real values
  const clientSessionId = 'sss'; //@TODO: should use real values
  const commandsContext = RfcCommandContext(clientId, clientSessionId, batchId);

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

  return function (interaction: HttpInteraction) {
    const interactionPathId = ScalaJSHelpers.getOrUndefined(
      undocumentedUrlHelpers.tryResolvePathId(interaction.request.path)
    );
    return (
      method === interaction.request.method && pathId === interactionPathId
    );
  };
}
