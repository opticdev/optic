import {
  CaptureInteractionIterator,
  LocalCaptureInteractionPointerConverter,
} from '../captures/avro/file-system/interaction-iterator';
import { Streams } from '@useoptic/diff-engine-wasm';
import { diffInteractions } from '@useoptic/diff-engine';
import fs from 'fs-extra';
import { getDiffOutputPaths } from './diff-worker-rust';
import { DiffResult } from '@useoptic/diff-engine-wasm/lib/streams/diff-results';
interface WorkerResult {
  results: AsyncIterable<DiffResult>;
}

interface WorkerConfig {
  diffId: string;
  captureBaseDirectory: string;
  captureId: string;
  events: any[];
  ignoreRules: any[];
}

export class InteractionDiffWorkerRust {
  constructor(private config: WorkerConfig) {}
  private async setup() {
    //@todo: apply ignore rules
    //@aidan @jaap I'm not sure what the contract is here regarding ignores.

    const interactionFilter = (i: any) => {
      return true;
    };
    const interactionIterator = CaptureInteractionIterator(
      {
        captureId: this.config.captureId,
        captureBaseDirectory: this.config.captureBaseDirectory,
      },
      interactionFilter
    );
    const interactionPointerConverter = new LocalCaptureInteractionPointerConverter(
      {
        captureBaseDirectory: this.config.captureBaseDirectory,
        captureId: this.config.captureId,
      }
    );

    const diffOutputPaths = getDiffOutputPaths(this.config);
    await fs.ensureDir(diffOutputPaths.base);
    await Promise.all([
      fs.writeJson(diffOutputPaths.events, this.config.events),
    ]);

    return {
      interactionIterator,
      interactionPointerConverter,
      specFilePath: diffOutputPaths.events,
    };
  }
  async run(): Promise<WorkerResult> {
    const {
      interactionPointerConverter,
      interactionIterator,
      specFilePath,
    } = await this.setup();

    const interactions = (async function* (interactionItems) {
      for await (let item of interactionItems) {
        if (!item.hasMoreInteractions) break;
        if (!item.interaction) continue;

        const { batchId, index } = item.interaction.context;
        let interactionPointer = interactionPointerConverter.toPointer(
          item.interaction.value,
          {
            interactionIndex: index,
            batchId,
          }
        );

        yield [item.interaction.value, [interactionPointer]];
      }
    })(interactionIterator);

    const workerProcessOutput = diffInteractions({
      specPath: specFilePath,
      interactionsStream: interactions,
    });
    const results = Streams.DiffResults.fromJSONL()(workerProcessOutput);

    return {
      results,
    };
  }
}
