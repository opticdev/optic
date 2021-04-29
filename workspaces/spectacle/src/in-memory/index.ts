import { EventEmitter } from 'events';
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
  IOpticInteractionsRepository,
  IOpticSpecReadWriteRepository,
  IOpticSpecRepository,
  StartDiffResult,
} from '../index';
import { AsyncTools, Streams } from '@useoptic/diff-engine-wasm';
import {
  ILearnedBodies,
  IValueAffordanceSerializationWithCounterGroupedByDiffHash,
} from '@useoptic/cli-shared/build/diffs/initial-types';

////////////////////////////////////////////////////////////////////////////////

export interface IOpticCommandContext {
  clientId: string;
  clientSessionId: string;
}

////////////////////////////////////////////////////////////////////////////////

export interface InMemorySpecState {
  events: any[];
}

////////////////////////////////////////////////////////////////////////////////
export interface InMemorySpecRepositoryDependencies {
  notifications: EventEmitter;
  initialState: InMemorySpecState;
  opticEngine: IOpticEngine;
}

export class InMemorySpecRepository implements IOpticSpecReadWriteRepository {
  private events: any[] = [];
  public notifications: EventEmitter;

  constructor(private dependencies: InMemorySpecRepositoryDependencies) {
    this.notifications = dependencies.notifications;
    this.events.push(...dependencies.initialState.events);
  }

  async appendEvents(events: any[]): Promise<void> {
    this.events.push(...events);
    this.notifications.emit('change');
  }

  async listEvents(): Promise<any[]> {
    return this.events;
  }

  async applyCommands(
    commands: any[],
    batchCommitId: string,
    commitMessage: string,
    commandContext: IOpticCommandContext
  ): Promise<void> {
    const newEventsString = this.dependencies.opticEngine.try_apply_commands(
      JSON.stringify(commands),
      JSON.stringify(this.events),
      batchCommitId,
      commitMessage
    );
    const newEvents = JSON.parse(newEventsString);
    this.events.push(...newEvents);
    this.notifications.emit('change');
  }
}

////////////////////////////////////////////////////////////////////////////////

class InMemoryInteractionsRepository implements IOpticInteractionsRepository {
  private map: Map<string, any[]> = new Map();

  async listById(id: string): Promise<any[]> {
    const interactions = this.map.get(id);
    if (!interactions) {
      throw new Error(`no interactions found for capture id ${id}`);
    }
    return interactions;
  }

  async set(id: string, interactions: any[]) {
    this.map.set(id, interactions);
  }
}

////////////////////////////////////////////////////////////////////////////////

interface InMemoryCapturesServiceDependencies {
  diffRepository: IOpticDiffRepository;
  opticEngine: IOpticEngine;
  interactionsRepository: InMemoryInteractionsRepository;
  specRepository: IOpticSpecRepository;
  configRepository: IOpticConfigRepository;
}

export class InMemoryCapturesService implements IOpticCapturesService {
  constructor(
    private dependencies: InMemoryCapturesServiceDependencies,
    private captures: ICapture[]
  ) {}

  async listCaptures(): Promise<ICapture[]> {
    return this.captures;
  }

  private async listCapturedInteractions(captureId: string): Promise<any[]> {
    return this.dependencies.interactionsRepository.listById(captureId);
  }

  async startDiff(diffId: string, captureId: string): Promise<StartDiffResult> {
    const notifications = new EventEmitter();

    const events = await this.dependencies.specRepository.listEvents();

    const diff = new InMemoryDiff({
      opticEngine: this.dependencies.opticEngine,
      configRepository: this.dependencies.configRepository,
      notifications,
    });
    const diffService = new InMemoryDiffService({
      diff,
    });

    const interactions = await this.listCapturedInteractions(captureId);
    const onComplete = new Promise<IOpticDiffService>((resolve, reject) => {
      notifications.once('complete', () => resolve(diffService));
    });
    await diff.start(events, interactions);

    await this.dependencies.diffRepository.add(diffId, diffService);

    return {
      onComplete,
    };
  }
}

////////////////////////////////////////////////////////////////////////////////

export class InMemoryConfigRepository implements IOpticConfigRepository {
  ignoreRequests: string[] = [];
}

////////////////////////////////////////////////////////////////////////////////

interface InMemoryDiffServiceDependencies {
  diff: InMemoryDiff;
}

//@jaap: we need to make sure this and InMemoryDiff are up-to-date relative to the latest changes
export class InMemoryDiffService implements IOpticDiffService {
  constructor(private dependencies: InMemoryDiffServiceDependencies) {}

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
}

////////////////////////////////////////////////////////////////////////////////

interface InMemoryDiffDependencies {
  opticEngine: IOpticEngine;
  configRepository: InMemoryConfigRepository;
  notifications: EventEmitter;
}

export class InMemoryDiff {
  private diffing?: Promise<any[]>;

  constructor(private dependencies: InMemoryDiffDependencies) {}

  start(events: any[], interactions: any[]) {
    const spec = this.dependencies.opticEngine.spec_from_events(
      JSON.stringify(events)
    );

    const diffingStream = (async function* (
      opticEngine: any
    ): AsyncIterable<Streams.DiffResults.DiffResult> {
      for (let interaction of interactions) {
        let results = opticEngine.diff_interaction(
          JSON.stringify(interaction),
          spec
        );

        let parsedResults = JSON.parse(results);
        let taggedResults = (parsedResults = parsedResults.map(
          (item: [any, any]) => {
            const [diffResult, fingerprint] = item;
            return [diffResult, [interaction.uuid], fingerprint];
          }
        ));

        for (let result of taggedResults) {
          yield result;
        }
        // make sure this is async so we don't block the UI thread
        await new Promise((resolve) => setTimeout(resolve));
      }
    })(this.dependencies.opticEngine);

    // Consume stream instantly for now, resulting in a Promise that resolves once exhausted
    this.diffing = AsyncTools.toArray(diffingStream);

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

  //@dev here is where to use learn_undocumented_bodies and learn_shape_diff_affordances from opticEngine consuming diff results
}

export class InMemoryDiffRepository implements IOpticDiffRepository {
  private map: Map<string, IOpticDiffService> = new Map();

  async add(id: string, diff: IOpticDiffService): Promise<void> {
    this.map.set(id, diff);
  }

  async findById(id: string): Promise<IOpticDiffService> {
    const diffService = this.map.get(id);
    if (!diffService) {
      throw new Error(`could not find diff ${id}`);
    }
    return diffService;
  }
}

export class InMemoryOpticContextBuilder {
  static async fromEvents(
    opticEngine: IOpticEngine,
    events: any[]
  ): Promise<IOpticContext> {
    const notifications = new EventEmitter();
    const diffRepository = new InMemoryDiffRepository();
    const interactionsRepository = new InMemoryInteractionsRepository();
    const configRepository = new InMemoryConfigRepository();
    const specRepository = new InMemorySpecRepository({
      notifications,
      initialState: {
        events,
      },
      opticEngine,
    });
    return {
      opticEngine,
      capturesService: new InMemoryCapturesService(
        {
          diffRepository,
          opticEngine,
          interactionsRepository,
          configRepository,
          specRepository,
        },
        []
      ),
      diffRepository,
      configRepository,
      specRepository,
    };
  }

  static async fromEventsAndInteractions(
    opticEngine: IOpticEngine,
    events: any[],
    interactions: any[],
    captureId: string
  ): Promise<IOpticContext> {
    const notifications = new EventEmitter();
    const diffRepository = new InMemoryDiffRepository();
    const interactionsRepository = new InMemoryInteractionsRepository();
    await interactionsRepository.set(captureId, interactions);
    const configRepository = new InMemoryConfigRepository();
    const specRepository = new InMemorySpecRepository({
      notifications,
      initialState: {
        events,
      },
      opticEngine,
    });
    return {
      opticEngine,
      capturesService: new InMemoryCapturesService(
        {
          diffRepository,
          opticEngine,
          interactionsRepository,
          specRepository,
          configRepository,
        },
        [{ captureId, startedAt: new Date().toISOString() }]
      ),
      diffRepository,
      configRepository,
      specRepository,
    };
  }
}
