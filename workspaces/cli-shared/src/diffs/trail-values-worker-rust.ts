import { CaptureInteractionIterator } from '../captures/avro/file-system/interaction-iterator';
import fs from 'fs-extra';
import { learnShapeDiffAffordances } from '@useoptic/diff-engine';
import { Streams } from '@useoptic/optic-streams';
import { ShapeDiffAffordances } from '@useoptic/optic-streams/build/streams/learning-results/shape-diff-affordances';
import { getDiffOutputPaths } from './interaction-diff-worker-rust';
import path from 'path';

export interface ShapeDiffAffordancesConfig {
  captureId: string;
  diffId: string;
  events: any;
  captureBaseDirectory: string;
}

export { ShapeDiffAffordances };

export function getTrailLearnersOutputPaths(values: {
  captureBaseDirectory: string;
  captureId: string;
}) {
  const { captureBaseDirectory, captureId } = values;
  const base = path.join(captureBaseDirectory, captureId, 'trails-learned');
  const events = path.join(base, 'events.json');

  return {
    base,
    events,
  };
}

export class ShapeDiffAffordancesWorker {
  constructor(private config: ShapeDiffAffordancesConfig) {}

  async run(): Promise<{ [fingerprint: string]: ShapeDiffAffordances }> {
    const outputPaths = getTrailLearnersOutputPaths(this.config);
    await fs.ensureDir(outputPaths.base);
    await fs.writeJson(outputPaths.events, this.config.events);

    // diffs
    const diffResultsPath = getDiffOutputPaths(this.config).diffsStream;

    const interactionIterator = CaptureInteractionIterator(
      {
        captureId: this.config.captureId,
        captureBaseDirectory: this.config.captureBaseDirectory,
      },
      (a) => true
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
