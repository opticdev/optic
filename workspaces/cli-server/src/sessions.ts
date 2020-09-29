import {
  getPathsRelativeToCwd,
  readApiConfig,
  IApiCliConfig,
} from '@useoptic/cli-config';
import { DiffManager } from './diffs/diff-manager';
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

  async diffCapture(captureId: string) {
    if (!this.diffs)
      throw new Error(
        'Session must have been started before it can diff a capture'
      );

    return this.diffs.startDiff(captureId);
  }

  async stop() {}
}

class SessionDiffs {
  private diffsByCaptureId: Map<string, DiffManager> = new Map();

  constructor(
    readonly configPath: string,
    readonly capturesPath: string,
    readonly specPath: string
  ) {}

  async startDiff(captureId: string): Promise<DiffManager> {
    const existingDiff = this.diffsByCaptureId.get(captureId);
    if (existingDiff) return existingDiff;

    const diffId = Uuid.v4();
    const newDiff = new DiffManager(diffId);
    this.diffsByCaptureId.set(captureId, newDiff);

    const workerStarted = new Promise((resolve, reject) => {
      newDiff.events.once('progress', resolve);
      newDiff.events.once('error', reject);
    });

    await newDiff.start({
      captureId,
      configPath: this.configPath,
      captureBaseDirectory: this.capturesPath,
      diffId,
      specPath: this.specPath,
    });

    await workerStarted;

    return newDiff;
  }
}
