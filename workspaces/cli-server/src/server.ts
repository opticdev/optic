import {
  IApiCliConfig,
  IOpticTaskRunnerConfig,
  IPathMapping,
} from '@useoptic/cli-config';
import { EventEmitter } from 'events';
import * as express from 'express';
import * as getPort from 'get-port';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import { Socket } from 'net';
import * as path from 'path';
import * as fs from 'fs-extra';
import {
  CapturesHelpers,
  ExampleRequestsHelpers,
  makeRouter,
} from './routers/spec-router';
import { basePath } from '@useoptic/ui';

export const log = fs.createWriteStream('./.optic-daemon.log');

export interface ICliServerConfig {}

export interface IOpticExpressRequestAdditions {
  session: ICliServerSession;
  paths: IPathMapping;
  config: IApiCliConfig;
  capturesHelpers: CapturesHelpers;
  exampleRequestsHelpers: ExampleRequestsHelpers;
}

declare global {
  namespace Express {
    export interface Request {
      optic: IOpticExpressRequestAdditions;
    }
  }
}

export interface ICliServerCaptureInfo {
  captureType: 'run';
  status: 'started' | 'completed';
  taskConfig: IOpticTaskRunnerConfig;
  env: { [key: string]: string };
}

export interface ICliServerSession {
  id: string;
  path: string;
  captures: ICliServerCaptureInfo[];
}

export const shutdownRequested = 'cli-server:shutdown-requested';

class CliServer {
  private server!: http.Server;
  public events: EventEmitter = new EventEmitter();
  private connections: Socket[] = [];

  constructor(private config: ICliServerConfig) {}

  addUiServer(app: express.Application) {
    const resourceRoot = path.resolve(basePath);
    const reactRoot = path.join(resourceRoot, 'build');
    const indexHtmlPath = path.join(reactRoot, 'index.html');
    app.use(express.static(reactRoot));
    app.get('*', (req, res) => {
      res.sendFile(indexHtmlPath);
    });
  }

  makeServer() {
    const app = express();
    app.set('etag', false);
    const sessions: ICliServerSession[] = [];
    let user: object | null;

    app.get('/api/identity', async (req, res: express.Response) => {
      if (user) {
        res.json({ user });
      } else {
        res.sendStatus(404);
      }
    });
    app.put(
      '/api/identity',
      bodyParser.json({ limit: '5kb' }),
      async (req, res: express.Response) => {
        if (req.body.user) {
          user = req.body.user;
          res.status(202).json({});
        } else {
          res.sendStatus(400);
        }
      }
    );

    // @REFACTOR sessionsRouter
    app.get('/api/sessions', (req, res: express.Response) => {
      res.json({
        sessions,
      });
    });

    app.post(
      '/api/sessions',
      bodyParser.json({ limit: '5kb' }),
      async (req, res: express.Response) => {
        const { path, taskConfig } = req.body;
        const captureInfo: ICliServerCaptureInfo = {
          taskConfig,
          captureType: 'run',
          status: 'started',
          env: {},
        };
        const existingSession = sessions.find((x) => x.path === path);
        if (existingSession) {
          if (taskConfig) {
            existingSession.captures.push(captureInfo);
          }
          return res.json({
            session: existingSession,
          });
        }

        const sessionId = (sessions.length + 1).toString();
        const session: ICliServerSession = {
          id: sessionId,
          path,
          captures: taskConfig ? [captureInfo] : [],
        };
        sessions.push(session);

        return res.json({
          session,
        });
      }
    );

    // @REFACTOR adminRouter
    app.post(
      '/admin-api/commands',
      bodyParser.json({ limit: '1kb' }),
      async (req, res) => {
        const { body } = req;

        if (body.type === 'shutdown') {
          res.sendStatus(204);
          this.events.emit(shutdownRequested);
          return;
        }

        res.sendStatus(400);
      }
    );

    // specRouter
    const specRouter = makeRouter(sessions);
    app.use('/api/specs/:specId', specRouter);

    // ui
    this.addUiServer(app);

    return app;
  }

  async start(): Promise<{ port: number }> {
    const app = this.makeServer();
    const port = await getPort({
      port: [34444],
    });
    return new Promise((resolve, reject) => {
      this.server = app.listen(port, () => {
        resolve({
          port,
        });
      });

      this.server.on('connection', (connection) => {
        log.write(`adding connection\n`);
        this.connections.push(connection);
        connection.on('close', () => {
          log.write(`removing connection\n`);
          this.connections = this.connections.filter((c) => c !== connection);
        });
      });
    });
  }

  async stop() {
    if (this.server) {
      await new Promise((resolve) => {
        log.write(`server closing ${this.connections.length} open\n`);
        this.connections.forEach((connection) => {
          log.write(`destroying existing connection\n`);
          connection.end();
          connection.destroy();
        });
        this.server.close((err) => {
          log.write(`server closed\n`);
          this.connections.forEach((connection) => {
            log.write(`destroying existing connection\n`);
            connection.end();
            connection.destroy();
          });
          if (err) {
            console.error(err);
            log.write(`${err.message}\n`);
          }
          resolve();
        });
      });
    }
  }
}

export { CliServer };
