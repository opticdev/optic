import { IHttpInteraction as HttpInteraction } from '@useoptic/domain-types';
import { CaptureInteractionIterator } from '../captures/avro/file-system/interaction-iterator';
import fs from 'fs-extra';
import { getInitialBodiesOutputPaths } from './initial-bodies-worker';
import { learnUndocumentedBodies } from '@useoptic/diff-engine';
import { Streams } from '@useoptic/diff-engine-wasm';
import { LearnedBodies } from '@useoptic/diff-engine-wasm/lib/streams/learning-results';
import * as DiffEngine from '@useoptic/diff-engine-wasm/engine/build';

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

    let learningResults = Streams.LearningResults.fromJSONL()(
      learnUndocumentedBodies(interactions, {
        specPath: outputPaths.events,
      })
    );

    for await (let result of learningResults) {
      return result;
    }

    throw new Error('expected to receive a learning result');
  }
}

interface EndpointInteractionFilter {
  (interaction: HttpInteraction): boolean;
}

async function createEndpointFilter(
  events: any[],
  pathId: string,
  method: string
): Promise<EndpointInteractionFilter> {
  let spec = DiffEngine.spec_from_events(JSON.stringify(events));

  return function (interaction: HttpInteraction) {
    const interactionPathId = DiffEngine.spec_resolve_path_id(
      spec,
      interaction.request.path
    );
    return (
      method === interaction.request.method && pathId === interactionPathId
    );
  };
}
