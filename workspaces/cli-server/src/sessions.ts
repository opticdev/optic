import {
  getPathsRelativeToCwd,
  readApiConfig,
  IApiCliConfig,
} from '@useoptic/cli-config';
import { createDiff, Diff } from './diffs';
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
      resolvedPaths.capturesPath,
      resolvedPaths.specStorePath
    );
  }

  async diffCapture(
    captureId: string,
    endpoints?: Array<{ pathId: string; method: string }>
  ) {
    if (!this.diffs)
      throw new Error(
        'Session must have been started before it can diff a capture'
      );

    return this.diffs.startDiff(captureId, endpoints);
  }

  async stop() {}
}

class SessionDiffs {
  private diffsByCaptureId: Map<string, Diff> = new Map();

  constructor(
    readonly configPath: string,
    readonly capturesPath: string,
    readonly specPath: string
  ) {}

  async startDiff(
    captureId: string,
    endpoints?: Array<{ pathId: string; method: string }>
  ): Promise<Diff> {
    const existingDiff = this.diffsByCaptureId.get(captureId);
    if (existingDiff) return existingDiff;

    const diffId = Uuid.v4();
    const newDiff = createDiff(OnDemandDiff, {
      captureId,
      configPath: this.configPath,
      captureBaseDirectory: this.capturesPath,
      diffId,
      endpoints,
      specPath: this.specPath,
    });
    this.diffsByCaptureId.set(captureId, newDiff);

    newDiff.events.once('finish', () => {
      this.diffsByCaptureId.delete(captureId);
    });
    newDiff.events.once('error', (err) => {
      throw err;
    });

    await newDiff.start();

    return newDiff;
  }
}
