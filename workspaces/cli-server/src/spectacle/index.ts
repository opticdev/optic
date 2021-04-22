import {
  ICapture,
  IOpticCapturesService,
  IOpticConfigRepository,
  IOpticDiffRepository,
  IOpticDiffService,
  IOpticEngine,
  IOpticInteractionsRepository,
  IOpticSpecReadWriteRepository,
  IOpticSpecRepository,
  StartDiffResult,
} from '@useoptic/spectacle';
import { EventEmitter } from 'events';

////////////////////////////////////////////////////////////////////////////////
export interface LocalCliSpecState {
  events: any[];
}

////////////////////////////////////////////////////////////////////////////////

class LocalCliSpecRepository implements IOpticSpecReadWriteRepository {
  private events: any[] = [];

  constructor(
    public notifications: EventEmitter,
    private initialState: LocalCliSpecState
  ) {
    this.events.push(...initialState.events);
  }

  async appendEvents(events: any[]): Promise<void> {
    //@jaap
    this.events.push(...events);
    this.notifications.emit('change');
  }

  async listEvents(): Promise<any[]> {
    return this.events;
  }
}

////////////////////////////////////////////////////////////////////////////////
//@jaap in contrast to the inMemory one, this one would allow you to stream the interactions, or it would be encapsulated within the diffService
class LocalCliInteractionsRepository implements IOpticInteractionsRepository {
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

interface LocalCliCapturesServiceDependencies {
  diffRepository: IOpticDiffRepository;
  opticEngine: IOpticEngine;
  interactionsRepository: LocalCliInteractionsRepository;
  specRepository: IOpticSpecRepository;
  configRepository: IOpticConfigRepository;
}

////////////////////////////////////////////////////////////////////////////////

export class LocalCliCapturesService implements IOpticCapturesService {
  constructor(private dependencies: LocalCliCapturesServiceDependencies) {}

  async listCaptures(): Promise<ICapture[]> {
    //@jaap this needs to come from the cli-server captures state
    return [];
  }

  // async listCapturedInteractions(captureId: string): Promise<any[]> {
  //   return this.dependencies.interactionsRepository.listById(captureId);
  // }

  async startDiff(diffId: string, captureId: string): Promise<StartDiffResult> {
    const notifications = new EventEmitter();

    //@jaap: here we need to run the diff against the rust binary
    // const events = await this.dependencies.specRepository.listEvents();
    // const diff = new LocalCliDiff({
    //   opticEngine: this.dependencies.opticEngine,
    //   configRepository: this.dependencies.configRepository,
    //   notifications,
    // });
    // const diffService = new LocalCliDiffService({
    //   diff,
    // });
    //
    // const interactions = await this.listCapturedInteractions(captureId);
    // const onComplete = new Promise<IOpticDiffService>((resolve, reject) => {
    //   notifications.on('complete', () => resolve(diffService));
    // });
    // await diff.start(events, interactions);
    //
    // await this.dependencies.diffRepository.add(diffId, diffService);
    const onComplete = Promise.reject();
    return {
      notifications,
      onComplete,
    };
  }
}

////////////////////////////////////////////////////////////////////////////////

export class InMemoryConfigRepository implements IOpticConfigRepository {
  ignoreRequests: string[] = [];
}

////////////////////////////////////////////////////////////////////////////////

export class LocalCliOpticContextBuilder {
  static async fromDirectory() {
    //@jaap: here we would initialize each repository/etc.
  }
}
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
