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

  async start() {}
  async stop() {}
}
