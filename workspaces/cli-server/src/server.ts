import {
  getPathsRelativeToCwd,
  IApiCliConfig,
  IPathMapping,
} from '@useoptic/cli-config';
import { EventEmitter } from 'events';
import express from 'express';
import getPort from 'get-port';
import bodyParser from 'body-parser';
import http from 'http';
import { Socket } from 'net';
import path from 'path';
import {
  CapturesHelpers,
  ExampleRequestsHelpers,
  makeRouter,
} from './routers/spec-router';
import Bottleneck from 'bottleneck';
import { basePath } from '@useoptic/ui-v2';
import { TrackingEventBase } from '@useoptic/analytics/lib/interfaces/TrackingEventBase';
import { analyticsEvents, track, trackWithApiName } from './analytics';
import cors from 'cors';
import { IgnoreFileHelper } from '@useoptic/cli-config/build/helpers/ignore-file-interface';
import { Session, SessionsManager } from './sessions';
import { getOrCreateAnonId } from '@useoptic/cli-config/build/opticrc/optic-rc';

const pJson = require('../package.json');

export interface ICliServerConfig {
  cloudApiBaseUrl: string;
}

export interface IOpticExpressRequestAdditions {
  paths: IPathMapping;
  config: IApiCliConfig;
  capturesHelpers: CapturesHelpers;
  ignoreHelper: IgnoreFileHelper;
  exampleRequestsHelpers: ExampleRequestsHelpers;
  session: Session;
  specLoader(): Promise<any[]>;
}

declare global {
  namespace Express {
    export interface Request {
      optic: IOpticExpressRequestAdditions;
    }
  }
}

export interface ICliServerSession {
  id: string;
  path: string;
}

export const shutdownRequested = 'cli-server:shutdown-requested';

class CliServer {
  private server!: http.Server;
  public events: EventEmitter = new EventEmitter();
  private connections: Socket[] = [];
  private corsOptions: cors.CorsOptions = {
    origin: [
      // this needs to be made exclusive in prod
      'http://localhost:4005',
      'https://app.o3c.info',
      'https://app.useoptic.com',
    ],
  };

  constructor(private config: ICliServerConfig) {}

  addUiServer(app: express.Application) {
    const resourceRoot = path.resolve(basePath);
    const reactRoot = path.join(resourceRoot, 'build');
    const indexHtmlPath = path.join(reactRoot, 'index.html');
    app.use(
      express.static(reactRoot, {
        etag: false,
        maxAge: '5000',
      })
    );
    app.use(bodyParser.json({ limit: '1mb' }));
    app.get('*', (req, res) => {
      res.sendFile(indexHtmlPath);
    });
  }

  async makeServer() {
    const app = express();
    app.use(cors(this.corsOptions));
    app.set('etag', false);
    const sessions = new SessionsManager();
    const fileReadBottleneck = new Bottleneck({
      maxConcurrent: 1,
    });
    let user: object | null;

    const anonIdPromise = getOrCreateAnonId();

    app.get('/api/identity', async (req, res: express.Response) => {
      res.json({ user, anonymousId: await anonIdPromise });
    });

    app.get('/api/daemon/status', async (req, res: express.Response) => {
      res.json({ isRunning: true, version: pJson.version });
    });

    app.post(
      '/api/tracking/events',
      bodyParser.json({ limit: '100kb' }),
      async (req, res: express.Response) => {
        const events: TrackingEventBase<any>[] = req.body.events;
        track(events);
        res.status(200).json({});
      }
    );

    app.post(
      '/api/tracking/events/apiname',
      bodyParser.json({ limit: '100kb' }),
      async (req, res: express.Response) => {
        const events: TrackingEventBase<any>[] = req.body.events;
        const apiName: string = req.body.apiName;
        trackWithApiName(apiName)(events);
        res.status(200).json({});
      }
    );

    app.get('/api/tracking/events', async (req, res) => {
      function emit(data: any) {
        console.log('emit');
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }

      const headers = {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache',
      };
      res.writeHead(200, headers);

      analyticsEvents.eventEmitter.on('event', (event: any) => {
        emit({ type: 'message', data: event });
      });

      req.on('close', () => {});
    });

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
        const { path, taskConfig, captureId } = req.body;
        if (captureId && taskConfig) {
          const paths = await getPathsRelativeToCwd(path);
          const { capturesPath } = paths;
          const capturesHelpers = new CapturesHelpers(capturesPath);
          const now = new Date().toISOString();
          await capturesHelpers.updateCaptureState({
            captureId,
            status: 'started',
            metadata: {
              startedAt: now,
              taskConfig,
              lastInteraction: null,
            },
          });
        }

        const session = await sessions.start(path);
        return res.json({
          session: {
            id: session.id,
            path: session.path,
          },
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
    const specRouter = await makeRouter(sessions, fileReadBottleneck);
    app.use('/api/specs/:specId', specRouter);

    // ui
    this.addUiServer(app);

    return app;
  }

  async start(): Promise<{ port: number }> {
    const app = await this.makeServer();
    const port = await getPort({
      port: [34444],
    });
    return new Promise((resolve, reject) => {
      this.server = app.listen(port, () => {
        resolve({
          port,
        });
      });

      this.server.setTimeout(600000);

      this.server.on('connection', (connection) => {
        this.connections.push(connection);
        connection.on('close', () => {
          this.connections = this.connections.filter((c) => c !== connection);
        });
      });
    });
  }

  async stop() {
    if (this.server) {
      await new Promise((resolve) => {
        console.log(`server closing ${this.connections.length} open`);
        this.connections.forEach((connection) => {
          console.log(`destroying existing connection`);
          connection.end();
          connection.destroy();
        });
        this.server.close((err) => {
          console.log(`server closed`);
          this.connections.forEach((connection) => {
            console.log(`destroying existing connection`);
            connection.end();
            connection.destroy();
          });
          if (err) {
            console.error(err);
          }
          resolve(null);
        });
      });
    }
  }
}

export { CliServer };
