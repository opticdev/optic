import { EventEmitter } from 'events';
import {
  IBaseSpectacle,
  ICapture,
  IForkableSpectacle,
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
  makeSpectacle,
  SpectacleInput,
  StartDiffResult,
} from '../index';
import { AsyncTools, Streams } from '@useoptic/optic-streams';
import {
  ILearnedBodies,
  IValueAffordanceSerializationWithCounterGroupedByDiffHash,
} from '@useoptic/cli-shared/build/diffs/initial-types';
import { HttpInteraction } from '@useoptic/optic-streams/build/streams/http-interactions';
import { defaultIgnoreRules } from '@useoptic/cli-config/build/helpers/default-ignore-rules';
import { IApiCliConfig, IOpticScript, IOpticTask } from '@useoptic/cli-config';

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
  public changes: AsyncGenerator<number>;

  constructor(private dependencies: InMemorySpecRepositoryDependencies) {
    this.notifications = dependencies.notifications;
    this.events.push(...dependencies.initialState.events);
    this.changes = (async function* () {
      // purely in-memory specs are not expected to change from any other source than ourselves
    })();
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
      commitMessage,
      commandContext.clientId,
      commandContext.clientSessionId
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
  configRepository: InMemoryConfigRepository;
}

export class InMemoryCapturesService implements IOpticCapturesService {
  constructor(
    private dependencies: InMemoryCapturesServiceDependencies,
    private captures: ICapture[]
  ) {}

  async loadInteraction(
    captureId: string,
    pointer: string
  ): Promise<any | undefined> {
    const interactions = await this.dependencies.interactionsRepository.listById(
      captureId
    );
    return interactions.find((i) => i.uuid === pointer);
  }

  async listCaptures(): Promise<ICapture[]> {
    return this.captures;
  }

  private async listCapturedInteractions(captureId: string): Promise<any[]> {
    return this.dependencies.interactionsRepository.listById(captureId);
  }

  async startDiff(diffId: string, captureId: string): Promise<StartDiffResult> {
    const notifications = new EventEmitter();

    const events = await this.dependencies.specRepository.listEvents();
    const interactions = await this.listCapturedInteractions(captureId);

    const diff = new InMemoryDiff({
      opticEngine: this.dependencies.opticEngine,
      configRepository: this.dependencies.configRepository,
      notifications,
    });
    const diffService = new InMemoryDiffService({
      diff,
      opticEngine: this.dependencies.opticEngine,
      specRepository: this.dependencies.specRepository,
      interactions,
    });

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

interface IOpticInMemoryConfigDependencies {
  config: IApiCliConfig;
}

export class InMemoryConfigRepository implements IOpticConfigRepository {
  constructor(private dependencies: IOpticInMemoryConfigDependencies) {}
  addIgnoreRule(rule: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  listIgnoreRules(): Promise<string[]> {
    return Promise.resolve(defaultIgnoreRules);
  }

  getApiName(): Promise<string> {
    return Promise.resolve(this.dependencies.config.name);
  }
}

////////////////////////////////////////////////////////////////////////////////

interface InMemoryDiffServiceDependencies {
  diff: InMemoryDiff;
  opticEngine: IOpticEngine;
  specRepository: IOpticSpecRepository;
  interactions: any[];
}

//@jaap: we need to make sure this and InMemoryDiff are up-to-date relative to the latest changes
export class InMemoryDiffService implements IOpticDiffService {
  constructor(private dependencies: InMemoryDiffServiceDependencies) {}

  async learnShapeDiffAffordances(): Promise<IValueAffordanceSerializationWithCounterGroupedByDiffHash> {
    const events = await this.dependencies.specRepository.listEvents();
    const spec = this.dependencies.opticEngine.spec_from_events(
      JSON.stringify(events)
    );

    const diffs = await this.listDiffs();
    //@jaap @TODO: use asynctools intoJSONL ?
    const taggedInteractionsJsonl = this.dependencies.interactions
      .map((x: HttpInteraction) => {
        return JSON.stringify([x, [x.uuid]]);
      })
      .join('\n');
    const allAffordances = JSON.parse(
      this.dependencies.opticEngine.learn_shape_diff_affordances(
        spec,
        JSON.stringify(diffs.diffs.map((x) => x[0])),
        taggedInteractionsJsonl
      )
    );
    const affordancesByFingerprint = allAffordances.reduce(
      (acc: any, item: any) => {
        const [key, value] = item;
        acc[key] = value;
        return acc;
      },
      {}
    );
    // if (Object.keys(affordancesByFingerprint).length === 0) {
    //   //@GOTCHA: this should only ever be empty if there are no Shape Diffs. use invariant?
    //   debugger;
    // }
    //@jaap @TODO: use asynctools affordancesByFingerprint ?
    return affordancesByFingerprint;
  }

  async learnUndocumentedBodies(
    pathId: string,
    method: string,
    newPathCommands: any[]
  ): Promise<ILearnedBodies> {
    try {
      const events = await this.dependencies.specRepository.listEvents();

      const newEventsString = this.dependencies.opticEngine.try_apply_commands(
        JSON.stringify(newPathCommands),
        JSON.stringify(events),
        'simulated-batch',
        'simulated changes',
        'simulated-client',
        'simulated-session'
      );

      //@aidan check if this returns all events or just the new events

      const spec = this.dependencies.opticEngine.spec_from_events(
        JSON.stringify([...events, ...JSON.parse(newEventsString)])
      );

      //@aidan if you need to filter by method*pathId you can do it here
      const interactionsJsonl = this.dependencies.interactions
        .map((x: HttpInteraction) => {
          return JSON.stringify(x);
        })
        .join('\n');
      const learnedBodies = JSON.parse(
        this.dependencies.opticEngine.learn_undocumented_bodies(
          spec,
          interactionsJsonl,
          'random'
        )
      );
      const learnedBodiesForPathIdAndMethod = learnedBodies.find(
        (x: ILearnedBodies) => {
          return x.pathId === pathId && x.method === method;
        }
      );
      if (!learnedBodiesForPathIdAndMethod) {
        return {
          pathId,
          method,
          requests: [],
          responses: [],
        };
      }
      return learnedBodiesForPathIdAndMethod;
    } catch (e) {
      console.error(e);
      debugger;
      throw e;
    }
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

////////////////////////////////////////////////////////////////////////////////

const defaultConfig: IApiCliConfig = {
  name: 'optic',
  tasks: {},
};

export class InMemoryOpticContextBuilder {
  static async fromEvents(
    opticEngine: IOpticEngine,
    events: any[],
    config: IApiCliConfig = defaultConfig
  ): Promise<IOpticContext> {
    const notifications = new EventEmitter();
    const diffRepository = new InMemoryDiffRepository();
    const interactionsRepository = new InMemoryInteractionsRepository();
    const configRepository = new InMemoryConfigRepository({ config });
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
    captureId: string,
    config: IApiCliConfig = defaultConfig
  ): Promise<IOpticContext> {
    const notifications = new EventEmitter();
    const diffRepository = new InMemoryDiffRepository();
    const interactionsRepository = new InMemoryInteractionsRepository();
    await interactionsRepository.set(captureId, interactions);
    const configRepository = new InMemoryConfigRepository({ config });
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

////////////////////////////////////////////////////////////////////////////////

export interface InMemoryBaseSpectacle extends IBaseSpectacle {
  samples: any[];
  opticContext: IOpticContext;
}

export class InMemorySpectacle
  implements IForkableSpectacle, InMemoryBaseSpectacle {
  private spectaclePromise: ReturnType<typeof makeSpectacle>;

  constructor(
    public readonly opticContext: IOpticContext,
    public samples: any[]
  ) {
    this.spectaclePromise = makeSpectacle(opticContext);
  }

  async fork(): Promise<IBaseSpectacle> {
    const opticContext = await InMemoryOpticContextBuilder.fromEventsAndInteractions(
      this.opticContext.opticEngine,
      [...(await this.opticContext.specRepository.listEvents())],
      this.samples,
      'example-session'
    );
    return new InMemorySpectacle(opticContext, [...this.samples]);
  }

  async mutate<Result, Input = {}>(options: SpectacleInput<Input>) {
    const spectacle = await this.spectaclePromise;
    return spectacle.queryWrapper<Result, Input>(options);
  }

  async query<Result, Input = {}>(options: SpectacleInput<Input>) {
    const spectacle = await this.spectaclePromise;
    return spectacle.queryWrapper<Result, Input>(options);
  }
}
