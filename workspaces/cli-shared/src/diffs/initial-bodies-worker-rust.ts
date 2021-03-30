import { IHttpInteraction as HttpInteraction } from '@useoptic/domain-types';
import { CaptureInteractionIterator } from '../captures/avro/file-system/interaction-iterator';
import { ILearnedBodies as LearnedBodies } from './initial-types';
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
import { AsyncTools as AT } from '@useoptic/diff-engine-wasm';

export class InitialBodiesWorkerRust {
  constructor(private config: WorkerConfig) {}

  async run() {
    const interactionFilter = await createEndpointFilter(
      this.config.specFilePath,
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

    let hasMoreInteractions = false;
    const interactions = (async function* (interactionItems) {
      for await (let item of interactionItems) {
        hasMoreInteractions = item.hasMoreInteractions;
        if (!item.hasMoreInteractions) break;
        if (!item.interaction) continue;

        yield item.interaction.value;
      }
    })(interactionIterator);
  }
}

interface EndpointInteractionFilter {
  (interaction: HttpInteraction): boolean;
}

// TODO: implement this with WASM domain instead of ScalaJS
async function createEndpointFilter(
  specFilePath: string,
  pathId: string,
  method: string
): Promise<EndpointInteractionFilter> {
  console.time('load inputs');
  const events = await fs.readJson(specFilePath);
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
