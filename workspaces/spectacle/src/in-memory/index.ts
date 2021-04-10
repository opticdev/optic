import { EventEmitter } from 'events';
import {
  IOpticCapturesService,
  IOpticContext,
  IOpticDiffService,
  IOpticEngine,
  IOpticSpecReadWriteRepository
} from '../index';
import { AsyncTools, Streams } from '@useoptic/diff-engine-wasm';

export interface InMemorySpecState {
  events: any[];
}

export class InMemorySpecRepository implements IOpticSpecReadWriteRepository {
  private events: any[] = [];

  constructor(
    public notifications: EventEmitter,
    private initialState: InMemorySpecState
  ) {
    this.events.push(...initialState.events);
  }

  async appendEvents(events: any[]): Promise<void> {
    this.events.push(...events);
    this.notifications.emit('change');
  }

  async listEvents(): Promise<any[]> {
    return this.events;
  }
}

interface StartDiffResult {
}

interface InMemoryInteractionsRepository {
}

interface InMemoryCapturesServiceDependencies {
  // interactionsRepository: InMemoryInteractionsRepository,
  // inMemoryDiff: InMemoryDiff
}

export class InMemoryCapturesService implements IOpticCapturesService {
  constructor(dependencies: InMemoryCapturesServiceDependencies) {
  }

  async listCaptures() {
    return;
  }

  async iterateCapturedSamples(): Promise<void> {
  }

  async loadInteraction(): Promise<void> {

  }

  async startDiff(
    events: any[],
    ignoreRequests: string[]
  ): Promise<void> {

  }
}

export class InMemoryDiffService implements IOpticDiffService {

}

interface InMemoryDiffDependencies {
  opticEngine: IOpticEngine,
}

export class InMemoryDiff {
  private diffId?: any;
  private diffing?: Promise<any[]>;

  constructor(private dependencies: InMemoryDiffDependencies) {
  }

  start(events: any[], interactions: any[]) {
    const spec = this.dependencies.opticEngine.spec_from_events(JSON.stringify(events));

    const diffingStream = (async function* (opticEngine: any): AsyncIterable<Streams.DiffResults.DiffResult> {
      for (let interaction of interactions) {
        let results = opticEngine.diff_interaction(
          JSON.stringify(interaction),
          spec
        );

        let parsedResults = JSON.parse(results);
        let taggedResults = (parsedResults = parsedResults.map(
          (item: [any, any]) => {
            const [diffResult, fingerprint] = item;
            return [
              diffResult,
              [interaction.uuid],
              fingerprint
            ];
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

    return this.diffId;
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

export class InMemoryOpticContextBuilder {
  static fromEvents(opticEngine: IOpticEngine, events: any[]): IOpticContext {
    const notifications = new EventEmitter();
    return {
      opticEngine,
      capturesService: new InMemoryCapturesService({
      }),
      diffService: new InMemoryDiffService(),
      specRepository: new InMemorySpecRepository(notifications, { events })
    };
  }
}