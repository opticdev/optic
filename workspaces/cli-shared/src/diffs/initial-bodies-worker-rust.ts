import { CaptureInteractionIterator } from '../captures/avro/file-system/interaction-iterator';
import fs from 'fs-extra';

import { learnUndocumentedBodies } from '@useoptic/diff-engine';
import { Streams } from '@useoptic/optic-streams';
import { LearnedBodies } from '@useoptic/optic-streams/build/streams/learning-results/undocumented-endpoint-bodies';
import * as DiffEngine from '@useoptic/diff-engine-wasm/engine/build';
import * as path from 'path';
import { IHttpInteraction } from '../optic-types';

export interface InitialBodiesWorkerConfig {
  pathId: string;
  method: string;
  captureId: string;
  events: any;
  captureBaseDirectory: string;
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

    let learningResults = Streams.LearningResults.UndocumentedEndpointBodies.fromJSONL()(
      learnUndocumentedBodies(interactions, {
        specPath: outputPaths.events,
      })
    );

    for await (let result of learningResults) {
      return result;
    }

    // If there are no learningResults, we should return empty requests / responses
    return {
      pathId: this.config.pathId,
      method: this.config.method,
      requests: [],
      responses: [],
    };
  }
}

interface EndpointInteractionFilter {
  (interaction: IHttpInteraction): boolean;
}

async function createEndpointFilter(
  events: any[],
  pathId: string,
  method: string
): Promise<EndpointInteractionFilter> {
  let spec = DiffEngine.spec_from_events(JSON.stringify(events));

  return function (interaction: IHttpInteraction) {
    const interactionPathId = DiffEngine.spec_resolve_path_id(
      spec,
      interaction.request.path
    );
    return (
      method === interaction.request.method && pathId === interactionPathId
    );
  };
}
