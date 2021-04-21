import { IHttpInteraction as HttpInteraction } from '@useoptic/domain-types';
import { CaptureInteractionIterator } from '../captures/avro/file-system/interaction-iterator';
import fs from 'fs-extra';
import Path from 'path';
import { getInitialBodiesOutputPaths } from './initial-bodies-worker';
import { learnShapeDiffAffordances } from '@useoptic/diff-engine';
import { Streams } from '@useoptic/diff-engine-wasm';
import { ShapeDiffAffordances } from '@useoptic/diff-engine-wasm/lib/streams/learning-results/shape-diff-affordances';
import * as DiffEngine from '@useoptic/diff-engine-wasm/engine/build';
import { getDiffOutputPaths } from './diff-worker-rust';

export interface ShapeDiffAffordancesConfig {
  pathId: string;
  method: string;
  captureId: string;
  diffId: string;
  events: any;
  captureBaseDirectory: string;
}

export { ShapeDiffAffordances };

export class ShapeDiffAffordancesWorker {
  constructor(private config: ShapeDiffAffordancesConfig) {}

  async run(): Promise<{ [fingerprint: string]: ShapeDiffAffordances }> {
    const outputPaths = getInitialBodiesOutputPaths(this.config);
    await fs.ensureDir(outputPaths.base);
    await fs.writeJson(outputPaths.events, this.config.events);

    // diffs
    const diffResultsPath = getDiffOutputPaths(this.config).diffsStream;

    // interactions
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

    const taggedInteractions = (async function* (interactionItems) {
      for await (let item of interactionItems) {
        if (!item.hasMoreInteractions) break;
        if (!item.interaction) continue;

        let pointer = `${item.interaction.context.batchId}-${item.interaction.context.index}`;
        yield [item.interaction.value, [pointer]];
      }
    })(interactionIterator);

    let learningResults = Streams.LearningResults.ShapeDiffAffordances.fromJSONL()(
      learnShapeDiffAffordances(taggedInteractions, {
        diffResultsPath,
        specPath: outputPaths.events,
      })
    );

    return await Streams.LearningResults.ShapeDiffAffordances.affordancesByFingerprint()(
      learningResults
    );
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
