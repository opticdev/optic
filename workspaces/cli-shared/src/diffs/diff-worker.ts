import { cachingResolversAndRfcStateFromEventsAndAdditionalCommands } from '@useoptic/domain-utilities';
import { parseIgnore } from '@useoptic/cli-config';
import { IHttpInteraction } from '@useoptic/domain-types';
import {
  CaptureInteractionIterator,
  LocalCaptureInteractionPointerConverter,
} from '../captures/avro/file-system/interaction-iterator';
import {
  DiffHelpers,
  JsonHelper,
  opticEngine,
  RfcCommandContext,
} from '@useoptic/domain';
import fs from 'fs-extra';
import Bottleneck from 'bottleneck';
import path from 'path';

export interface IDiffProjectionEmitterConfig {
  diffId: string;
  specFilePath: string;
  ignoreRequestsFilePath: string;
  additionalCommandsFilePath: string;
  captureBaseDirectory: string;
  captureId: string;
}

export class DiffWorker {
  constructor(private config: IDiffProjectionEmitterConfig) {}

  async run() {
    debugger;
    console.log('running');
    console.time('load spec');
    const ignoreRequests = await fs.readJson(
      this.config.ignoreRequestsFilePath
    );
    const events: any[] = await fs.readJson(this.config.specFilePath);
    const additionalCommands: any[] = await fs.readJson(
      this.config.additionalCommandsFilePath
    );
    console.timeEnd('load spec');
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
    } = cachingResolversAndRfcStateFromEventsAndAdditionalCommands(
      events,
      commandsContext,
      additionalCommands
    );
    console.timeEnd('build state');
    const ignoredRequests = parseIgnore(ignoreRequests);

    function filterIgnoredRequests(interaction: IHttpInteraction) {
      return !ignoredRequests.shouldIgnore(
        interaction.request.method,
        interaction.request.path
      );
    }

    const interactionIterator = CaptureInteractionIterator(
      {
        captureId: this.config.captureId,
        captureBaseDirectory: this.config.captureBaseDirectory,
      },
      filterIgnoredRequests
    );
    debugger;
    let diffs = DiffHelpers.emptyInteractionPointersGroupedByDiff();

    let interactionCounter = BigInt(0);
    const batcher = new Bottleneck.Batcher({
      maxSize: 100,
      maxTime: 100,
    });
    const diffOutputFilePath = path.join(
      this.config.captureBaseDirectory,
      this.config.captureId,
      'diffs',
      this.config.diffId,
      'diffs.json'
    );
    const queue = new Bottleneck({
      maxConcurrent: 1,
    });

    async function flush() {
      const c = interactionCounter.toString();

      console.time(`flushing ${c}`);
      await fs.ensureFile(diffOutputFilePath);
      await fs.writeJson(
        diffOutputFilePath,
        opticEngine.DiffWithPointersJsonSerializer.toJs(diffs)
      );

      if (process && process.send) {
        process.send({
          type: 'progress',
          data: { interactionCounter: interactionCounter.toString() },
        });
      } else {
        console.log(interactionCounter.toString());
      }
      console.timeEnd(`flushing ${c}`);
    }

    batcher.on('batch', () => {
      queue.schedule(() => flush());
    });

    const interactionPointerConverter = new LocalCaptureInteractionPointerConverter(
      {
        captureBaseDirectory: this.config.captureBaseDirectory,
        captureId: this.config.captureId,
      }
    );
    await flush();

    for await (const item of interactionIterator) {
      // for (const x of [1, 2, 3]) {
      const { batchId, interaction, index } = item;

      interactionCounter = interactionCounter + BigInt(1);
      console.time(`diff ${batchId} ${index}`);
      diffs = DiffHelpers.groupInteractionPointerByNormalizedDiffs(
        resolvers,
        rfcState,
        JsonHelper.fromInteraction(interaction),
        interactionPointerConverter.toPointer(interaction, {
          interactionIndex: index,
          batchId,
        }),
        diffs
      );
      console.timeEnd(`diff ${batchId} ${index}`);
      // }

      batcher.add(null);
    }
  }
}
