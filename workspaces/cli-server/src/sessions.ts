import {
  getPathsRelativeToCwd,
  readApiConfig,
  IApiCliConfig,
} from '@useoptic/cli-config';
import {
  createDiff,
  Diff,
  DiffQueries,
  ProgressStream as DiffProgressStream,
} from './diffs';
import { OnDemandDiff } from './diffs/on-demand';
import * as Uuid from 'uuid';

export class SessionsManager {
  private sessions: Session[] = [];

  private create(path: string) {
    let id = '' + (this.sessions.length + 1);
    let session = new Session(id, path);
    this.sessions.push(session);
    return session;
  }

  async start(path: string): Promise<Session> {
    let existingSession = this.sessions.find(
      (session) => path && session.path === path
    );

    let session = existingSession || this.create(path);

    await session.start();

    return session;
  }

  findById(sessionId: string): Session | undefined {
    return (
      (sessionId &&
        this.sessions.find((session) => session.id === sessionId)) ||
      undefined
    );
  }
}

export class Session {
  constructor(readonly id: string, readonly path: string) {}
  diffs: SessionDiffs | null = null;
  async start() {
    const resolvedPaths = await getPathsRelativeToCwd(this.path);
    this.diffs = new SessionDiffs(
      resolvedPaths.configPath,
      resolvedPaths.opticIgnorePath,
      resolvedPaths.capturesPath,
      resolvedPaths.specStorePath,
      resolvedPaths.specDirPath
    );
  }

  async diffCapture(
    captureId: string,
    events?: Array<{ [key: string]: any }>,
    endpoints?: Array<{ pathId: string; method: string }>
  ) {
    if (!this.diffs)
      throw new Error(
        'Session must have been started before it can diff a capture'
      );

    return this.diffs.startDiff(captureId, events, endpoints);
  }

  diffProgress(diffId: string) {
    if (!this.diffs)
      throw new Error(
        'Session must have been started before diffs can be accessed'
      );

    return this.diffs.progress(diffId);
  }

  diffQueries(diffId: string) {
    if (!this.diffs)
      throw new Error(
        'Session must have been started before diffs can be accessed'
      );

    return this.diffs.queries(diffId);
  }

  async stop() {}
}

class SessionDiffs {
  private diffsById: Map<string, Diff> = new Map();
  private activeDiffsByCaptureId: Map<string, Diff> = new Map();

  constructor(
    readonly configPath: string,
    readonly opticIgnorePath: string,
    readonly capturesPath: string,
    readonly specPath: string,
    readonly specDirPath: string
  ) {}

  async startDiff(
    captureId: string,
    events?: Array<{ [key: string]: any }>,
    endpoints?: Array<{ pathId: string; method: string }>
  ): Promise<string> {
    const diffId = Uuid.v4();
    const newDiff = createDiff(OnDemandDiff, {
      captureId,
      opticIgnorePath: this.opticIgnorePath,
      configPath: this.configPath,
      captureBaseDirectory: this.capturesPath,
      diffId,
      events,
      endpoints,
      specPath: this.specPath,
      specDirPath: this.specDirPath,
    });
    this.activeDiffsByCaptureId.set(captureId, newDiff);
    this.diffsById.set(diffId, newDiff);

    newDiff.events.once('finish', () => {
      this.activeDiffsByCaptureId.delete(captureId);
    });
    newDiff.events.once('error', (err) => {
      debugger;
      console.error(err);
      throw err;
    });

    await newDiff.start();

    return diffId;
  }

  progress(diffId: string): DiffProgressStream | undefined {
    const diff = this.diffsById.get(diffId);
    if (!diff) return;

    return diff.progress();
  }

  queries(diffId: string): DiffQueries | undefined {
    const diff = this.diffsById.get(diffId);
    if (!diff) return;

    return diff.queries();
  }
}
