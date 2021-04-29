import {
  ICapture,
  IListDiffsResponse,
  IListUnrecognizedUrlsResponse,
  IOpticCapturesService,
  IOpticConfigRepository,
  IOpticContext,
  IOpticDiffRepository,
  IOpticDiffService,
  IOpticEngine,
  IOpticSpecReadWriteRepository,
  IOpticSpecRepository,
  StartDiffResult,
} from '@useoptic/spectacle';
import { EventEmitter } from 'events';
import {
  AsyncTools,
  AsyncTools as AT,
  Streams,
} from '@useoptic/diff-engine-wasm';
import * as OpticEngine from '@useoptic/diff-engine';
import * as opticEngine from '@useoptic/diff-engine-wasm/engine/build';
import { isEnvTrue } from '@useoptic/cli-shared';
import {
  InMemoryDiffRepository,
  IOpticCommandContext,
} from '@useoptic/spectacle/build/in-memory';
import { getSpecEventsFrom } from '@useoptic/cli-config/build/helpers/read-specification-json';
import {
  IValueAffordanceSerializationWithCounterGroupedByDiffHash,
  ILearnedBodies,
} from '@useoptic/cli-shared/build/diffs/initial-types';
import { InteractionDiffWorkerRust } from '@useoptic/cli-shared/build/diffs/interaction-diff-worker-rust';
import { getPathsRelativeToCwd, IPathMapping } from '@useoptic/cli-config';
import {
  CapturesHelpers,
  isValidCaptureState,
  ValidCaptureState,
} from '../routers/spec-router';

////////////////////////////////////////////////////////////////////////////////
export interface LocalCliSpecState {}

////////////////////////////////////////////////////////////////////////////////
export interface LocalCliSpecRepositoryDependencies {
  specDirPath: string;
  specStorePath: string;
  notifications: EventEmitter;
}

export class LocalCliSpecRepository implements IOpticSpecReadWriteRepository {
  notifications: EventEmitter;

  constructor(private dependencies: LocalCliSpecRepositoryDependencies) {
    this.notifications = dependencies.notifications;
  }

  async applyCommands(
    commands: any[],
    batchCommitId: string,
    commitMessage: string,
    commandContext: IOpticCommandContext
  ): Promise<void> {
    const commandsStream = AT.from<Streams.Commands.Command>(commands);
    const events = OpticEngine.commit(commandsStream, {
      specDirPath: this.dependencies.specDirPath,
      commitMessage: commitMessage,
      clientSessionId: commandContext.clientSessionId || 'unknown-session',
      clientId: commandContext.clientId,
      appendToRoot: !isEnvTrue(process.env.OPTIC_SPLIT_SPEC_EVENTS),
    });
  }

  async listEvents(): Promise<any[]> {
    if (isEnvTrue(process.env.OPTIC_ASSEMBLED_SPEC_EVENTS)) {
      const events = OpticEngine.readSpec({
        specDirPath: this.dependencies.specDirPath,
      });
      debugger;
      throw new Error(
        'unimplemented. need to streaming parse the events Readable stream'
      );
    } else {
      const events = await getSpecEventsFrom(this.dependencies.specStorePath);
      debugger;
      return events;
    }
  }
}

////////////////////////////////////////////////////////////////////////////////

interface LocalCliCapturesServiceDependencies {
  diffRepository: IOpticDiffRepository;
  opticEngine: IOpticEngine;
  specRepository: IOpticSpecRepository;
  configRepository: IOpticConfigRepository;
  capturesHelpers: CapturesHelpers;
}

////////////////////////////////////////////////////////////////////////////////

export class LocalCliCapturesService implements IOpticCapturesService {
  constructor(private dependencies: LocalCliCapturesServiceDependencies) {}

  async listCaptures(): Promise<ICapture[]> {
    const captures = await this.dependencies.capturesHelpers.listCapturesState();
    const validCaptures: ValidCaptureState[] = captures.filter((x) =>
      isValidCaptureState(x)
    ) as ValidCaptureState[];
    return validCaptures.map((c) => {
      return {
        captureId: c.captureId,
        startedAt: c.metadata.startedAt,
      };
    });
  }

  async startDiff(diffId: string, captureId: string): Promise<StartDiffResult> {
    const notifications = new EventEmitter();
    const diff = new LocalCliDiff({
      notifications,
    });
    const captureBaseDirectory = this.dependencies.capturesHelpers.baseDirectory();
    const events = await this.dependencies.specRepository.listEvents();
    await diff.start({
      diffId,
      captureId,
      captureBaseDirectory,
      events,
      ignoreRules: this.dependencies.configRepository.ignoreRequests,
    });
    const diffService = new LocalCliDiffService({ diff });
    await this.dependencies.diffRepository.add(diffId, diffService);

    const onComplete = new Promise<IOpticDiffService>((resolve, reject) => {
      notifications.once('complete', () => resolve(diffService));
    });

    return {
      onComplete,
    };
  }
}

interface LocalCliDiffDependencies {
  notifications: EventEmitter;
}

class LocalCliDiff {
  private diffing?: Promise<any[]>;

  constructor(private dependencies: LocalCliDiffDependencies) {}

  async start(config: {
    diffId: string;
    captureBaseDirectory: string;
    captureId: string;
    events: any[];
    ignoreRules: any[];
  }) {
    const worker = await new InteractionDiffWorkerRust(config).run();

    //@TODO: should this be writing output to the file system?
    // Consume stream instantly for now, resulting in a Promise that resolves once exhausted
    this.diffing = AsyncTools.toArray(worker.results);
    this.diffing.then(() => {
      this.dependencies.notifications.emit('complete');
    });
  }

  async getNormalizedDiffs() {
    // Q: Why not consume diff stream straight up? A: we don't have a way to fork streams yet
    // allowing only a single consumer, and we need multiple (results themselves + urls)!
    const diffResults = AsyncTools.from(await this.diffing!);

    const normalizedDiffs = Streams.DiffResults.normalize(diffResults);
    const lastUniqueResults = Streams.DiffResults.lastUnique(normalizedDiffs);

    return AsyncTools.toArray(lastUniqueResults);
  }

  async getUnrecognizedUrls() {
    // Q: Why not consume diff stream straight up? A: we don't have a way to fork streams yet
    // allowing only a single consumer, and we need multiple (results themselves + urls)!
    const diffResults = AsyncTools.from(await this.diffing!);

    const undocumentedUrls = Streams.UndocumentedUrls.fromDiffResults(
      diffResults
    );
    const lastUnique = Streams.UndocumentedUrls.lastUnique(undocumentedUrls);

    return AsyncTools.toArray(lastUnique);
  }
}

interface LocalCLiDiffServiceDependencies {
  diff: LocalCliDiff;
}

export class LocalCliDiffService implements IOpticDiffService {
  constructor(private dependencies: LocalCLiDiffServiceDependencies) {}

  learnShapeDiffAffordances(
    pathId: string,
    method: string
  ): Promise<IValueAffordanceSerializationWithCounterGroupedByDiffHash> {
    return Promise.reject('implement me');
  }

  learnUndocumentedBodies(
    pathId: string,
    method: string
  ): Promise<ILearnedBodies> {
    return Promise.reject('implement me');
  }

  async listDiffs(): Promise<IListDiffsResponse> {
    const diffs = (await this.dependencies.diff.getNormalizedDiffs()).map(
      ([diff, tags, fingerprint]) => {
        return [diff, tags, fingerprint];
      }
    );

    return { diffs };
  }

  async listUnrecognizedUrls(): Promise<IListUnrecognizedUrlsResponse> {
    const urls = (await this.dependencies.diff.getUnrecognizedUrls()).map(
      ({ fingerprint, ...rest }) => {
        return rest;
      }
    );
    return { urls };
  }

  //@dev follow usage from capture-router for OnDemandInitialBodyRust and OnDemandShapeDiffAffordancesRust (and upgrade diff worker rust)
}

////////////////////////////////////////////////////////////////////////////////

//@TODO: use IgnoreFileHelper (see on-demand.ts)
export class LocalCliConfigRepository implements IOpticConfigRepository {
  ignoreRequests: string[] = [];
}

////////////////////////////////////////////////////////////////////////////////

export class LocalCliOpticContextBuilder {
  static async fromDirectory(
    paths: IPathMapping,
    capturesHelpers: CapturesHelpers
  ): Promise<IOpticContext> {
    const notifications = new EventEmitter();
    const specRepository = new LocalCliSpecRepository({
      specStorePath: paths.specStorePath,
      specDirPath: paths.specDirPath,
      notifications,
    });
    const configRepository = new LocalCliConfigRepository();
    const diffRepository = new InMemoryDiffRepository();

    const capturesService = new LocalCliCapturesService({
      opticEngine,
      configRepository,
      specRepository,
      diffRepository,
      capturesHelpers,
    });

    return {
      opticEngine,
      capturesService,
      specRepository,
      configRepository,
      diffRepository,
    };
  }
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
