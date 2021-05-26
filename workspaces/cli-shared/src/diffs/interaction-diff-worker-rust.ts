import {
  CaptureInteractionIterator,
  LocalCaptureInteractionPointerConverter,
} from '../captures/avro/file-system/interaction-iterator';
import { Streams } from '@useoptic/optic-streams';
import { diffInteractions } from '@useoptic/diff-engine';
import fs from 'fs-extra';
import { fork } from 'stream-fork';
import { DiffResult } from '@useoptic/optic-streams/build/streams/diff-results';
import path from 'path';
import { PassThrough } from 'stream';
import { parseIgnore } from '@useoptic/cli-config/build/helpers/ignore-parser';
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
export function getDiffOutputPaths(values: {
  captureBaseDirectory: string;
  captureId: string;
  diffId: string;
}) {
  const { captureBaseDirectory, captureId, diffId } = values;
  const base = path.join(captureBaseDirectory, captureId, 'diffs', diffId);
  const diffs = path.join(base, 'diffs.json');
  const diffsStream = path.join(base, 'diffs.jsonl');
  const stats = path.join(base, 'stats.json');
  const undocumentedUrls = path.join(base, 'undocumentedUrls.json');
  const events = path.join(base, 'events.json');
  const ignoreRequests = path.join(base, 'ignoreRequests.json');
  const filters = path.join(base, 'filters.json');
  const additionalCommands = path.join(base, 'additionalCommands.json');

  return {
    base,
    diffs,
    diffsStream,
    stats,
    undocumentedUrls,
    events,
    ignoreRequests,
    filters,
    additionalCommands,
  };
}
export class InteractionDiffWorkerRust {
  constructor(private config: WorkerConfig) {}
  private async setup() {
    const ignoreFilter = parseIgnore(this.config.ignoreRules);

    const interactionFilter = (i: any) => {
      return !ignoreFilter.shouldIgnore(i.request.method, i.request.path);
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
      diffsJsonlPath: diffOutputPaths.diffsStream,
    };
  }
  async run(): Promise<WorkerResult> {
    const {
      interactionPointerConverter,
      interactionIterator,
      specFilePath,
      diffsJsonlPath,
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
    const inMemorySink = new PassThrough();
    const results = Streams.DiffResults.fromJSONL()(inMemorySink);
    const fsSink = fs.createWriteStream(diffsJsonlPath);
    workerProcessOutput.pipe(fork([inMemorySink, fsSink]));
    return {
      results,
    };
  }
}
